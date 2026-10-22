"""Mitigation adapter interface."""

from abc import ABC, abstractmethod


class FirewallAdapter(ABC):
    @abstractmethod
    def execute(self, action: dict) -> dict:
        """Apply the action and return a result record."""
