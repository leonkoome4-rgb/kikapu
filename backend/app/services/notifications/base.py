from abc import ABC, abstractmethod


class SMSProvider(ABC):
    @abstractmethod
    def send(self, phone: str, message: str) -> bool:
        """Send an SMS. Return True on success."""


class EmailProvider(ABC):
    @abstractmethod
    def send(self, email: str, subject: str, message: str) -> bool:
        """Send an email. Return True on success."""
