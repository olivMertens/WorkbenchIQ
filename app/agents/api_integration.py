"""Agent API integration — connect agents to FastAPI endpoints.

Provides helper functions that the api_server can use to optionally
route requests through the Agent Framework instead of the legacy pipeline.

The agent mode is controlled by the AGENT_FRAMEWORK_ENABLED env var.
When disabled, the existing pipeline is used unchanged.
"""

from __future__ import annotations

import os
from typing import Any, Dict, List, Optional

from ..config import Settings, load_settings
from ..utils import setup_logging

logger = setup_logging()


def is_agent_framework_enabled() -> bool:
    """Check if Agent Framework mode is enabled via env var."""
    return os.getenv("AGENT_FRAMEWORK_ENABLED", "false").lower() in ("true", "1", "yes")


async def agent_chat(
    settings: Settings,
    app_id: str,
    message: str,
    history: List[Dict[str, str]] | None = None,
    persona: str = "underwriting",
) -> Dict[str, Any]:
    """Handle a chat request using the ChatAgent (Phase 1).

    Args:
        settings: Application settings.
        app_id: Application ID for context.
        message: User's chat message.
        history: Optional conversation history.
        persona: Current persona ID.

    Returns:
        Dict with 'response', 'usage', and optional 'agent_trace'.
    """
    from .agents import create_chat_agent

    # Enrich the message with application context
    enriched_message = f"[Dossier: {app_id}, Persona: {persona}]\n\n{message}"

    async with await create_chat_agent(settings) as agent:
        # Build conversation from history
        if history:
            # Run with the last user message; history is already in context via instructions
            context_parts = []
            for msg in history[-6:]:  # Last 6 messages for context
                role = msg.get("role", "user")
                content = msg.get("content", "")
                context_parts.append(f"[{role}]: {content}")
            enriched_message = (
                "Historique récent de la conversation :\n"
                + "\n".join(context_parts)
                + f"\n\nNouvelle question de l'utilisateur : {message}"
            )

        result = await agent.run(enriched_message)
        response_text = result.text if hasattr(result, "text") else str(result)

        return {
            "response": response_text,
            "usage": {},
            "agent": {
                "name": "ChatAgent",
                "tools_available": ["search_policies", "get_application_summary", "get_glossary"],
                "framework": "Microsoft Agent Framework 1.0.0rc3",
            },
        }


async def agent_process(
    settings: Settings,
    app_id: str,
    processing_mode: str = "auto",
) -> Dict[str, Any]:
    """Handle a full processing request using the WorkflowAgent (Phase 4).

    This is an alternative to the legacy run_extract_and_analyze_background.

    Args:
        settings: Application settings.
        app_id: Application ID to process.
        processing_mode: 'auto', 'standard', or 'large_document'.

    Returns:
        Dict with processing result summary.
    """
    from .agents import create_processing_workflow

    async with await create_processing_workflow(settings) as agent:
        prompt = (
            f"Traite le dossier {app_id} en mode '{processing_mode}'.\n"
            f"1. Extraire les documents\n"
            f"2. Vérifier les champs extraits\n"
            f"3. Exécuter les analyses appropriées\n"
            f"4. Résumer les résultats"
        )

        result = await agent.run(prompt)
        response_text = result.text if hasattr(result, "text") else str(result)

        return {
            "status": "completed",
            "summary": response_text,
            "agent": {
                "name": "WorkflowAgent",
                "framework": "Microsoft Agent Framework 1.0.0rc3",
            },
        }


async def agent_extract(
    settings: Settings,
    app_id: str,
) -> Dict[str, Any]:
    """Handle an extraction request using the DocumentAgent (Phase 3).

    Args:
        settings: Application settings.
        app_id: Application ID to extract.

    Returns:
        Dict with extraction result summary.
    """
    from .agents import create_document_agent

    async with await create_document_agent(settings) as agent:
        prompt = (
            f"Extraire les données des documents du dossier {app_id}.\n"
            f"Vérifier la qualité de l'extraction et signaler les anomalies."
        )

        result = await agent.run(prompt)
        response_text = result.text if hasattr(result, "text") else str(result)

        return {
            "status": "completed",
            "summary": response_text,
            "agent": {
                "name": "DocumentAgent",
                "framework": "Microsoft Agent Framework 1.0.0rc3",
            },
        }


async def agent_analyze(
    settings: Settings,
    app_id: str,
    sections: List[str] | None = None,
) -> Dict[str, Any]:
    """Handle an analysis request using the AnalysisAgent (Phase 2).

    Args:
        settings: Application settings.
        app_id: Application ID to analyze.
        sections: Optional list of sections to analyze.

    Returns:
        Dict with analysis result summary.
    """
    from .agents import create_analysis_agent

    async with await create_analysis_agent(settings) as agent:
        if sections:
            section_list = ", ".join(sections)
            prompt = (
                f"Analyser le dossier {app_id}. "
                f"Exécuter uniquement les sections suivantes : {section_list}."
            )
        else:
            prompt = (
                f"Analyser le dossier {app_id}. "
                f"Déterminer les analyses pertinentes selon le type de dossier "
                f"et les exécuter."
            )

        result = await agent.run(prompt)
        response_text = result.text if hasattr(result, "text") else str(result)

        return {
            "status": "completed",
            "summary": response_text,
            "agent": {
                "name": "AnalysisAgent",
                "framework": "Microsoft Agent Framework 1.0.0rc3",
            },
        }
