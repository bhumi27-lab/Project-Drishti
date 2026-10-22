"""LangGraph wiring.

watcher -> detective -> (needs context & loops < 2 -> watcher.fetch_context)
        -> confidence_gate -> bouncer | human_review (pause) | dismiss
"""


def build_graph():
    """Build and compile the incident graph."""
    # TODO: StateGraph(IncidentState), nodes, conditional edges, checkpointer for human pause.
    raise NotImplementedError
