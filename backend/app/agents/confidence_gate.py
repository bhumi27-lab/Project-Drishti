"""Confidence Gate (DECIDE): combine evidence into a score and route the incident.

confidence = 0.30*anomaly + 0.30*mitre_similarity + 0.30*llm_confidence + 0.10*history
>= threshold (0.80) and malicious -> auto; 0.40..threshold -> human; else dismiss.
"""

from app.orchestration.state import IncidentState


def decide(state: IncidentState) -> IncidentState:
    """Compute confidence, confidence_breakdown and decision."""
    # TODO: scoring function; threshold comes from settings.
    raise NotImplementedError
