"""Detective (UNDERSTAND): RAG over MITRE ATT&CK + local Llama 3.2 3B reasoning.

Must return strict JSON validated by Pydantic (retry once, else fall back to human).
May set needs_more_context to ask Watcher for more history (max 2 loops).
"""

from app.orchestration.state import IncidentState


def investigate(state: IncidentState) -> IncidentState:
    """Retrieve top-k MITRE techniques, prompt the LLM, and set llm_verdict."""
    # TODO: retriever + ollama client + prompt + validation.
    raise NotImplementedError
