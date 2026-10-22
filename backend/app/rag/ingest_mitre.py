"""Load MITRE ATT&CK Enterprise (data/mitre/enterprise-attack.json) into ChromaDB."""


def ingest() -> None:
    """Embed technique id, name, tactic and description into the vector store."""
    # TODO: parse STIX bundle, embed, upsert.
    raise NotImplementedError
