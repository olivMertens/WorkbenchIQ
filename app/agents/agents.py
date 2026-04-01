"""GroupaIQ Agents — Microsoft Agent Framework agent definitions.

Provides 3 specialized agents + 1 orchestration workflow:

- ChatAgent: Interactive Q&A with policy search, glossary, and application context
- AnalysisAgent: Prompt-based document analysis with dynamic section selection
- DocumentAgent: Content Understanding extraction with retry logic
- ProcessingWorkflow: Full pipeline orchestration (extract → analyze)
"""

from __future__ import annotations

import os
from typing import Any

from agent_framework import Agent
from agent_framework.azure import AzureAIClient

from ..config import Settings, load_settings
from ..utils import setup_logging
from .tools import (
    search_policies,
    get_application_summary,
    get_glossary,
    analyze_section,
    list_available_analyses,
    extract_document,
    get_extracted_fields,
    process_application,
)

logger = setup_logging()

# ---------------------------------------------------------------------------
# Agent instruction templates
# ---------------------------------------------------------------------------

CHAT_AGENT_INSTRUCTIONS = """Tu es un assistant expert en assurance pour Groupama, intégré dans le poste de travail GroupaIQ.

**Ton rôle** : Répondre aux questions des gestionnaires de sinistres et souscripteurs en t'appuyant sur les polices d'assurance Groupama, les données extraites des dossiers, et le glossaire du domaine.

**Règles** :
1. Toujours citer les articles de police pertinents avec leurs références exactes.
2. Utiliser l'outil `search_policies` pour trouver les articles applicables avant de répondre à toute question sur la couverture, les exclusions ou les conditions.
3. Utiliser l'outil `get_application_summary` pour obtenir le contexte du dossier en cours.
4. Utiliser l'outil `get_glossary` pour clarifier les termes techniques d'assurance ou médicaux.
5. Répondre en français sauf si l'utilisateur pose sa question en anglais.
6. Si tu n'es pas sûr, dire explicitement ce que tu ne sais pas plutôt que d'inventer.

**Format de réponse** :
- Structurer la réponse avec des titres et puces
- Inclure les citations de police avec score de pertinence
- Terminer par une recommandation claire quand c'est pertinent
"""

ANALYSIS_AGENT_INSTRUCTIONS = """Tu es un agent d'analyse spécialisé dans le traitement des dossiers d'assurance Groupama.

**Ton rôle** : Analyser les documents d'un dossier en exécutant les sections d'analyse pertinentes selon le type de dossier (souscription, sinistre auto, sinistre santé, habitation, hypothécaire).

**Règles** :
1. Utiliser `list_available_analyses` pour découvrir les sections disponibles pour le persona du dossier.
2. Utiliser `analyze_section` pour exécuter une analyse spécifique sur le dossier.
3. Utiliser `get_extracted_fields` pour vérifier les données extraites avant l'analyse.
4. Utiliser `search_policies` pour enrichir l'analyse avec les articles de police pertinents.
5. Ne pas exécuter toutes les sections aveuglément — choisir celles qui sont pertinentes selon le contenu du dossier.
6. Rapporter les résultats de manière structurée avec les scores de confiance.

**Workflow typique** :
1. Vérifier les champs extraits → identifier le type de dossier
2. Lister les analyses disponibles → sélectionner les pertinentes
3. Exécuter les analyses sélectionnées
4. Consolider et résumer les résultats
"""

DOCUMENT_AGENT_INSTRUCTIONS = """Tu es un agent d'extraction documentaire pour GroupaIQ, spécialisé dans le traitement des documents d'assurance.

**Ton rôle** : Extraire les données structurées des documents uploadés (PDF, photos, vidéos) en utilisant Azure Content Understanding.

**Règles** :
1. Utiliser `extract_document` pour lancer l'extraction sur les fichiers d'un dossier.
2. Utiliser `get_extracted_fields` pour vérifier les résultats de l'extraction.
3. Si la confiance d'un champ clé est basse (< 70%), signaler le problème et recommander une vérification manuelle.
4. Adapter l'analyseur selon le type de document (prebuilt-documentSearch pour les PDF, analyseurs customs pour les images auto).
5. Résumer les résultats avec le nombre de champs, les scores de confiance, et les anomalies détectées.

**Types d'analyseurs disponibles** :
- `prebuilt-documentSearch` — Documents génériques (PDF, formulaires)
- `prebuilt-image` — Images génériques
- `autoClaimsDocAnalyzer` — Documents sinistres auto (custom)
- `autoClaimsImageAnalyzer` — Photos dommages auto (custom)
- `autoClaimsVideoAnalyzer` — Vidéos dashcam (custom)
"""


# ---------------------------------------------------------------------------
# Agent factory functions
# ---------------------------------------------------------------------------

def _get_agent_client(settings: Settings) -> AzureAIClient:
    """Create an AzureAIClient from GroupaIQ settings.

    Falls back to AzureOpenAIChatClient if no Foundry project endpoint.
    """
    # Check if we have a Foundry project endpoint
    foundry_endpoint = os.getenv("FOUNDRY_PROJECT_ENDPOINT", "")
    if foundry_endpoint:
        from azure.identity.aio import DefaultAzureCredential
        return AzureAIClient(
            project_endpoint=foundry_endpoint,
            model_deployment_name=settings.openai.deployment_name,
            credential=DefaultAzureCredential(),
        )

    # Fall back to direct Azure OpenAI via the existing REST client
    # We use AzureAIClient with the Azure OpenAI endpoint
    from azure.identity.aio import DefaultAzureCredential

    # AzureAIClient supports Azure OpenAI endpoints directly
    endpoint = settings.openai.endpoint
    if not endpoint:
        raise RuntimeError(
            "No AZURE_OPENAI_ENDPOINT or FOUNDRY_PROJECT_ENDPOINT configured."
        )

    return AzureAIClient(
        project_endpoint=endpoint,
        model_deployment_name=settings.openai.deployment_name,
        credential=DefaultAzureCredential(),
    )


async def create_chat_agent(
    settings: Settings | None = None,
    instructions_override: str | None = None,
) -> Agent:
    """Create the ChatAgent (Phase 1) — interactive Q&A with tool use.

    Args:
        settings: GroupaIQ settings. Loaded from env if None.
        instructions_override: Custom instructions (e.g. from admin UI).

    Returns:
        Configured Agent ready for `.run()`.
    """
    if settings is None:
        settings = load_settings()

    client = _get_agent_client(settings)
    instructions = instructions_override or CHAT_AGENT_INSTRUCTIONS

    return client.as_agent(
        name="ChatAgent",
        instructions=instructions,
        tools=[search_policies, get_application_summary, get_glossary],
    )


async def create_analysis_agent(
    settings: Settings | None = None,
    instructions_override: str | None = None,
) -> Agent:
    """Create the AnalysisAgent (Phase 2) — prompt-based analysis.

    Args:
        settings: GroupaIQ settings. Loaded from env if None.
        instructions_override: Custom instructions (e.g. from admin UI).

    Returns:
        Configured Agent ready for `.run()`.
    """
    if settings is None:
        settings = load_settings()

    client = _get_agent_client(settings)
    instructions = instructions_override or ANALYSIS_AGENT_INSTRUCTIONS

    return client.as_agent(
        name="AnalysisAgent",
        instructions=instructions,
        tools=[
            analyze_section,
            list_available_analyses,
            get_extracted_fields,
            search_policies,
            get_application_summary,
        ],
    )


async def create_document_agent(
    settings: Settings | None = None,
    instructions_override: str | None = None,
) -> Agent:
    """Create the DocumentAgent (Phase 3) — CU extraction.

    Args:
        settings: GroupaIQ settings. Loaded from env if None.
        instructions_override: Custom instructions (e.g. from admin UI).

    Returns:
        Configured Agent ready for `.run()`.
    """
    if settings is None:
        settings = load_settings()

    client = _get_agent_client(settings)
    instructions = instructions_override or DOCUMENT_AGENT_INSTRUCTIONS

    return client.as_agent(
        name="DocumentAgent",
        instructions=instructions,
        tools=[extract_document, get_extracted_fields, get_application_summary],
    )


# ---------------------------------------------------------------------------
# Phase 4 — Workflow orchestration
# ---------------------------------------------------------------------------

async def create_processing_workflow(
    settings: Settings | None = None,
) -> Agent:
    """Create the full processing workflow agent (Phase 4).

    This is a single agent with access to ALL tools from all phases:
    it can extract documents, run analyses, search policies, and
    orchestrate the full pipeline.

    For a true multi-agent workflow with WorkflowBuilder, Foundry hosting
    is required. This simplified version provides the same capabilities
    through a single agent with comprehensive tool access.

    Args:
        settings: GroupaIQ settings. Loaded from env if None.

    Returns:
        Configured Agent with all tools available.
    """
    if settings is None:
        settings = load_settings()

    client = _get_agent_client(settings)

    workflow_instructions = """Tu es l'agent orchestrateur de GroupaIQ. Tu coordonnes le traitement complet des dossiers d'assurance Groupama.

**Workflow complet** :
1. **Extraction** : Utiliser `extract_document` pour extraire les données des fichiers uploadés.
2. **Vérification** : Utiliser `get_extracted_fields` pour vérifier la qualité de l'extraction.
3. **Analyse** : Utiliser `analyze_section` pour exécuter les analyses pertinentes.
4. **Enrichissement** : Utiliser `search_policies` pour citer les articles applicables.
5. **Synthèse** : Consolider tous les résultats en un rapport structuré.

Ou utiliser `process_application` pour exécuter le pipeline complet en une seule commande.

**Règles** :
- Toujours vérifier les résultats d'extraction avant de lancer l'analyse.
- Si un champ clé a une confiance < 70%, le signaler.
- Adapter les analyses au type de dossier (ne pas exécuter d'analyse médicale sur un sinistre auto).
- Résumer les résultats avec recommandations claires.
"""

    return client.as_agent(
        name="WorkflowAgent",
        instructions=workflow_instructions,
        tools=[
            # Phase 1 — Chat tools
            search_policies,
            get_application_summary,
            get_glossary,
            # Phase 2 — Analysis tools
            analyze_section,
            list_available_analyses,
            # Phase 3 — Document tools
            extract_document,
            get_extracted_fields,
            # Phase 4 — Full pipeline
            process_application,
        ],
    )
