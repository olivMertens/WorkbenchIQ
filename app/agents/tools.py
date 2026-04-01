"""Agent tools — @tool functions wrapping existing GroupaIQ capabilities.

Each tool wraps an existing function from the GroupaIQ pipeline,
exposing it as a callable tool for Microsoft Agent Framework agents.
"""

from __future__ import annotations

import json
from typing import Any

from agent_framework import tool

from ..utils import setup_logging

logger = setup_logging()


# ---------------------------------------------------------------------------
# Phase 1 tools — Chat / Ask IQ
# ---------------------------------------------------------------------------

@tool
def search_policies(query: str, category: str = "", top_k: int = 5) -> str:
    """Search Groupama insurance policy documents using semantic RAG search.

    Use this tool when the user asks about policy coverage, exclusions,
    conditions, deductibles, or any question that requires citing specific
    policy articles.

    Args:
        query: Natural language question about insurance policies.
        category: Optional policy category filter (automotive, life_health,
                  property_casualty, mortgage).
        top_k: Number of policy chunks to retrieve (default 5).

    Returns:
        Formatted policy excerpts with article references and relevance scores.
    """
    import asyncio
    from ..config import load_settings
    from ..rag.search import PolicySearchService

    settings = load_settings()
    if not settings.rag.enabled:
        return _fallback_policy_search(settings, query, category)

    service = PolicySearchService(settings)

    async def _search():
        if category:
            return await service.filtered_search(
                query=query, category=category, top_k=top_k,
            )
        return await service.semantic_search(query=query, top_k=top_k)

    try:
        loop = asyncio.get_event_loop()
        if loop.is_running():
            import concurrent.futures
            with concurrent.futures.ThreadPoolExecutor() as pool:
                results = pool.submit(asyncio.run, _search()).result()
        else:
            results = asyncio.run(_search())
    except Exception as exc:
        logger.warning("RAG search failed, using fallback: %s", exc)
        return _fallback_policy_search(settings, query, category)

    if not results:
        return "Aucun article de police trouvé pour cette requête."

    parts = []
    for r in results:
        parts.append(
            f"### {r.policy_name} — {r.chunk_type}\n"
            f"**Catégorie** : {r.category} | **Pertinence** : {r.similarity:.0%}\n"
            f"{r.content}\n"
        )
    return "\n---\n".join(parts)


def _fallback_policy_search(settings, query: str, category: str) -> str:
    """Fallback: return full policy text when RAG is disabled."""
    from ..underwriting_policies import format_policies_for_persona

    persona_map = {
        "automotive": "automotive_claims",
        "life_health": "life_health_claims",
        "property_casualty": "habitation_claims",
        "mortgage": "mortgage_underwriting",
    }
    persona = persona_map.get(category, "underwriting")
    return format_policies_for_persona(settings.app.prompts_root, persona)


@tool
def get_application_summary(application_id: str) -> str:
    """Retrieve a summary of the insurance application or claim.

    Use this tool when the user asks about a specific application's
    status, extracted data, or analysis results.

    Args:
        application_id: The application ID (e.g. 'a1b2c3d4').

    Returns:
        Formatted summary of the application including extracted fields,
        analysis status, and key findings.
    """
    from ..config import load_settings
    from ..storage import load_application

    settings = load_settings()
    app_md = load_application(settings.app.storage_root, application_id)
    if not app_md:
        return f"Application {application_id} introuvable."

    parts = [f"## Application {application_id}"]
    parts.append(f"- **Statut** : {app_md.status}")
    parts.append(f"- **Persona** : {app_md.persona}")
    parts.append(f"- **Fichiers** : {len(app_md.files)}")

    if app_md.extracted_fields:
        parts.append("\n### Champs extraits")
        for key, val in list(app_md.extracted_fields.items())[:15]:
            if isinstance(val, dict):
                parts.append(f"- {val.get('field_name', key)}: {val.get('value', '')}")

    if app_md.llm_outputs:
        parts.append("\n### Résultats d'analyse")
        for section, subs in app_md.llm_outputs.items():
            if not subs:
                continue
            for sub, output in subs.items():
                if output and isinstance(output, dict) and output.get("parsed"):
                    summary = output["parsed"].get("summary", "")
                    if summary:
                        parts.append(f"- **{section}.{sub}** : {summary[:200]}")

    return "\n".join(parts)


@tool
def get_glossary(term: str = "") -> str:
    """Look up insurance domain terminology in the Groupama glossary.

    Use this tool when the user asks about the meaning of a specific
    insurance term, medical code, or abbreviation.

    Args:
        term: Optional specific term to look up. If empty, returns
              the full glossary.

    Returns:
        Definition(s) from the Groupama domain glossary.
    """
    from ..config import load_settings
    from ..glossary import format_glossary_for_prompt

    settings = load_settings()
    glossary_text = format_glossary_for_prompt(
        settings.app.prompts_root,
        "underwriting",
        max_terms=100,
        format_type="list",
    )
    if not glossary_text:
        return "Glossaire non disponible."

    if term:
        term_lower = term.lower()
        lines = glossary_text.split("\n")
        matches = [ln for ln in lines if term_lower in ln.lower()]
        if matches:
            return "\n".join(matches)
        return f"Terme '{term}' non trouvé dans le glossaire."

    return glossary_text


# ---------------------------------------------------------------------------
# Phase 2 tools — Analysis
# ---------------------------------------------------------------------------

@tool
def analyze_section(
    application_id: str,
    section: str,
    subsection: str,
) -> str:
    """Run a specific prompt-based analysis section on an application.

    Use this tool to re-run or run a specific analysis section. Each
    section/subsection corresponds to a prompt template that will be
    executed against the application's extracted documents.

    Args:
        application_id: The application ID.
        section: Analysis section (e.g. 'medical_summary',
                 'damage_assessment', 'liability_assessment').
        subsection: Analysis subsection (e.g. 'hypertension',
                    'visual_damage_analysis', 'fault_determination').

    Returns:
        JSON analysis result from the LLM.
    """
    from ..config import load_settings
    from ..storage import load_application, save_application_metadata
    from ..processing import _run_single_prompt
    from ..prompts import load_prompts
    from ..underwriting_policies import format_all_policies_for_prompt

    settings = load_settings()
    app_md = load_application(settings.app.storage_root, application_id)
    if not app_md:
        return f"Application {application_id} introuvable."

    persona = app_md.persona or "underwriting"
    prompts = load_prompts(settings.app.prompts_root, persona)

    if section not in prompts or subsection not in prompts.get(section, {}):
        available = []
        for s, subs in prompts.items():
            if isinstance(subs, dict):
                for ss in subs:
                    available.append(f"{s}.{ss}")
        return (
            f"Section '{section}.{subsection}' non trouvée. "
            f"Disponibles : {', '.join(available[:10])}"
        )

    template = prompts[section][subsection]
    policies = format_all_policies_for_prompt(settings.app.prompts_root, persona)
    doc_md = app_md.document_markdown or ""

    result = _run_single_prompt(
        settings, section, subsection, template, doc_md,
        underwriting_policies=policies,
    )

    # Store result
    if not app_md.llm_outputs:
        app_md.llm_outputs = {}
    if section not in app_md.llm_outputs:
        app_md.llm_outputs[section] = {}
    app_md.llm_outputs[section][subsection] = result
    save_application_metadata(settings.app.storage_root, app_md)

    parsed = result.get("parsed", {})
    return json.dumps(parsed, ensure_ascii=False, indent=2) if parsed else result.get("raw", "Pas de résultat")


@tool
def list_available_analyses(persona: str = "underwriting") -> str:
    """List all available analysis sections and subsections for a persona.

    Use this tool to discover what analyses can be run for a given
    insurance persona.

    Args:
        persona: The persona ID (underwriting, life_health_claims,
                 automotive_claims, habitation_claims, mortgage).

    Returns:
        Formatted list of section.subsection combinations.
    """
    from ..config import load_settings
    from ..prompts import load_prompts

    settings = load_settings()
    prompts = load_prompts(settings.app.prompts_root, persona)

    lines = [f"## Analyses disponibles — {persona}\n"]
    for section, subs in prompts.items():
        if isinstance(subs, dict):
            for sub in subs:
                lines.append(f"- `{section}.{sub}`")
        else:
            lines.append(f"- `{section}` (prompt unique)")

    return "\n".join(lines)


# ---------------------------------------------------------------------------
# Phase 3 tools — Content Understanding
# ---------------------------------------------------------------------------

@tool
def extract_document(
    application_id: str,
    filename: str = "",
    analyzer_id: str = "prebuilt-documentSearch",
) -> str:
    """Extract structured data from a document using Azure Content Understanding.

    Use this tool to re-extract or extract data from a specific file
    in an application. Supports PDF, images, and other document formats.

    Args:
        application_id: The application ID.
        filename: Specific filename to extract (if empty, extracts all files).
        analyzer_id: CU analyzer ID to use (default: prebuilt-documentSearch).

    Returns:
        Extraction summary with field counts and confidence scores.
    """
    from ..config import load_settings
    from ..storage import load_application, save_application_metadata
    from ..processing import run_content_understanding_for_files

    settings = load_settings()
    app_md = load_application(settings.app.storage_root, application_id)
    if not app_md:
        return f"Application {application_id} introuvable."

    if filename:
        matching = [f for f in app_md.files if f.get("filename") == filename]
        if not matching:
            available = [f.get("filename", "?") for f in app_md.files]
            return f"Fichier '{filename}' non trouvé. Disponibles : {', '.join(available)}"

    app_md = run_content_understanding_for_files(settings, app_md)
    save_application_metadata(settings.app.storage_root, app_md)

    parts = [f"## Extraction terminée — {application_id}"]
    parts.append(f"- **Fichiers traités** : {len(app_md.files)}")

    if app_md.extracted_fields:
        parts.append(f"- **Champs extraits** : {len(app_md.extracted_fields)}")

    if app_md.confidence_summary:
        cs = app_md.confidence_summary
        parts.append(f"- **Confiance moyenne** : {cs.get('average_confidence', 0):.0%}")
        parts.append(f"- **Haute confiance** : {cs.get('high_confidence_count', 0)}")
        parts.append(f"- **Confiance moyenne** : {cs.get('medium_confidence_count', 0)}")
        parts.append(f"- **Basse confiance** : {cs.get('low_confidence_count', 0)}")

    if app_md.document_markdown:
        parts.append(f"- **Markdown** : {len(app_md.document_markdown)} caractères")

    return "\n".join(parts)


@tool
def get_extracted_fields(application_id: str) -> str:
    """Get all extracted fields from an application's documents.

    Use this tool to see the structured data that Content Understanding
    extracted from the uploaded files.

    Args:
        application_id: The application ID.

    Returns:
        Formatted list of extracted fields with values and confidence scores.
    """
    from ..config import load_settings
    from ..storage import load_application

    settings = load_settings()
    app_md = load_application(settings.app.storage_root, application_id)
    if not app_md:
        return f"Application {application_id} introuvable."

    if not app_md.extracted_fields:
        return "Aucun champ extrait. Lancez l'extraction d'abord."

    lines = ["## Champs extraits\n"]
    for key, val in app_md.extracted_fields.items():
        if isinstance(val, dict):
            name = val.get("field_name", key)
            value = val.get("value", "")
            conf = val.get("confidence", 0)
            source = val.get("source_file", "")
            conf_icon = "🟢" if conf >= 0.9 else "🟡" if conf >= 0.7 else "🔴"
            lines.append(f"- {conf_icon} **{name}** : {value} ({conf:.0%}) — {source}")

    return "\n".join(lines)


# ---------------------------------------------------------------------------
# Phase 4 tools — Workflow orchestration
# ---------------------------------------------------------------------------

@tool
def process_application(
    application_id: str,
    processing_mode: str = "auto",
) -> str:
    """Run the full processing pipeline on an application.

    This triggers the complete workflow: Content Understanding extraction
    followed by prompt-based analysis. Use this tool when the user wants
    to process or reprocess an entire application.

    Args:
        application_id: The application ID.
        processing_mode: Processing mode — 'auto' (detect), 'standard',
                         or 'large_document'.

    Returns:
        Processing status summary.
    """
    from ..config import load_settings
    from ..storage import load_application, save_application_metadata
    from ..processing import run_content_understanding_for_files, run_underwriting_prompts

    settings = load_settings()
    app_md = load_application(settings.app.storage_root, application_id)
    if not app_md:
        return f"Application {application_id} introuvable."

    # Step 1: Extract
    app_md.processing_status = "extracting"
    save_application_metadata(settings.app.storage_root, app_md)

    app_md = run_content_understanding_for_files(settings, app_md)

    if not app_md.document_markdown:
        app_md.processing_status = "error"
        app_md.processing_error = "Extraction n'a produit aucun contenu"
        save_application_metadata(settings.app.storage_root, app_md)
        return "Erreur : l'extraction n'a produit aucun contenu markdown."

    # Step 2: Analyze
    app_md.processing_status = "analyzing"
    save_application_metadata(settings.app.storage_root, app_md)

    mode_override = processing_mode if processing_mode != "auto" else None
    app_md = run_underwriting_prompts(
        settings, app_md,
        max_workers_per_section=4,
        processing_mode_override=mode_override,
    )

    app_md.processing_status = None
    app_md.processing_error = None
    save_application_metadata(settings.app.storage_root, app_md)

    sections_done = len(app_md.llm_outputs) if app_md.llm_outputs else 0
    fields_count = len(app_md.extracted_fields) if app_md.extracted_fields else 0
    return (
        f"Traitement terminé pour {application_id}.\n"
        f"- Mode : {app_md.processing_mode}\n"
        f"- Champs extraits : {fields_count}\n"
        f"- Sections analysées : {sections_done}\n"
        f"- Statut : complété"
    )
