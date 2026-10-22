"""Top-k MITRE technique retrieval from ChromaDB."""


def retrieve(query: str, k: int = 3) -> list[dict]:
    """Return matches as {id, name, tactic, similarity}."""
    # TODO: query ChromaDB.
    raise NotImplementedError
