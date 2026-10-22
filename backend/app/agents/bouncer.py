"""Bouncer (DEFEND): executes a controlled response through a mitigation adapter.

Simulated by default. Never blocks localhost, the gateway or allowlisted IPs.
Every action is written to the audit log.
"""

from app.orchestration.state import IncidentState


def respond(state: IncidentState) -> IncidentState:
    """Execute the approved action and record the result in state.action."""
    # TODO: pick adapter from settings, apply allowlist guard, audit.
    raise NotImplementedError
