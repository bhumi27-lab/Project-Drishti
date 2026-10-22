"""Watcher (SEE): ingests logs, filters noise, detects anomalies, fetches history.

Tier 1: cheap rules (brute force, port sweep, SQLi/XSS, odd-hour login, known-bad IP).
Tier 2: Isolation Forest over per-IP feature windows.
Also serves Detective's context requests via fetch_context().
"""

from app.orchestration.state import IncidentState


def watch(state: IncidentState) -> IncidentState:
    """Turn parsed logs into an alert plus initial related_events."""
    # TODO: rules, anomaly scoring, dedup/correlation.
    raise NotImplementedError


def fetch_context(state: IncidentState) -> IncidentState:
    """Return historical events for the IP/user/host in llm_verdict.context_query."""
    # TODO: query PostgreSQL for past events.
    raise NotImplementedError
