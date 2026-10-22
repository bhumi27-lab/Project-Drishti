"""Default adapter: records blocks in the blocklist table, touches nothing real."""

from app.mitigation.base import FirewallAdapter


class SimulatedFirewall(FirewallAdapter):
    def execute(self, action: dict) -> dict:
        # TODO: write to blocklist + audit.
        raise NotImplementedError
