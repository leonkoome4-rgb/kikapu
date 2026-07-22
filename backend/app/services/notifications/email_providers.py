import logging
import smtplib
from email.mime.text import MIMEText
from app.services.notifications.base import EmailProvider

logger = logging.getLogger("kikapu.notifications")


class ConsoleEmailProvider(EmailProvider):
    """Default no-op provider for local dev: logs instead of sending a real email."""

    def send(self, email: str, subject: str, message: str) -> bool:
        logger.info("[console-email] to=%s subject=%s message=%s", email, subject, message)
        return True


class SMTPEmailProvider(EmailProvider):
    def __init__(self, host: str, port: int, user: str, password: str, sender: str):
        self.host = host
        self.port = port
        self.user = user
        self.password = password
        self.sender = sender

    def send(self, email: str, subject: str, message: str) -> bool:
        if not self.host:
            logger.warning("SMTP host missing; falling back to console log")
            return ConsoleEmailProvider().send(email, subject, message)
        try:
            msg = MIMEText(message)
            msg["Subject"] = subject
            msg["From"] = self.sender
            msg["To"] = email
            with smtplib.SMTP(self.host, self.port, timeout=10) as server:
                server.starttls()
                if self.user:
                    server.login(self.user, self.password)
                server.sendmail(self.sender, [email], msg.as_string())
            return True
        except (smtplib.SMTPException, OSError):
            logger.exception("SMTP email send failed")
            return False


def get_email_provider(provider_name: str, config) -> EmailProvider:
    if provider_name == "smtp":
        return SMTPEmailProvider(config.SMTP_HOST, config.SMTP_PORT, config.SMTP_USER, config.SMTP_PASSWORD, config.SMTP_FROM)
    return ConsoleEmailProvider()
