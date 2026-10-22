"""Shared LangGraph state passed between nodes."""

from typing import Literal, TypedDict


class IncidentState(TypedDict):
    incident_id: str
    alert: dict
    related_events: list[dict]
    mitre_matches: list[dict]
    llm_verdict: dict
    context_requests: int  # loop counter, max 2
    confidence: float  # 0-1 from the gate
    confidence_breakdown: dict
    decision: Literal["auto", "human", "dismiss"]
    action: dict | None
    audit: list[dict]
