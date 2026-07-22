import logging
import requests
from app.services.notifications.base import SMSProvider

logger = logging.getLogger("kikapu.notifications")


class ConsoleSMSProvider(SMSProvider):
    """Default no-op provider for local dev: logs instead of sending a real SMS."""

    def send(self, phone: str, message: str) -> bool:
        logger.info("[console-sms] to=%s message=%s", phone, message)
        return True


class AfricasTalkingSMSProvider(SMSProvider):
    def __init__(self, username: str, api_key: str):
        self.username = username
        self.api_key = api_key

    def send(self, phone: str, message: str) -> bool:
        if not self.api_key:
            logger.warning("Africa's Talking API key missing; falling back to console log")
            return ConsoleSMSProvider().send(phone, message)
        url = (
            "https://api.sandbox.africastalking.com/version1/messaging"
            if self.username == "sandbox"
            else "https://api.africastalking.com/version1/messaging"
        )
        headers = {
            "apiKey": self.api_key,
            "Content-Type": "application/x-www-form-urlencoded",
            "Accept": "application/json",
        }
        data = {"username": self.username, "to": phone, "message": message}
        try:
            resp = requests.post(url, headers=headers, data=data, timeout=10)
            return resp.ok
        except requests.RequestException:
            logger.exception("Africa's Talking SMS send failed")
            return False


class TwilioSMSProvider(SMSProvider):
    def __init__(self, account_sid: str, auth_token: str, from_number: str):
        self.account_sid = account_sid
        self.auth_token = auth_token
        self.from_number = from_number

    def send(self, phone: str, message: str) -> bool:
        if not (self.account_sid and self.auth_token and self.from_number):
            logger.warning("Twilio credentials missing; falling back to console log")
            return ConsoleSMSProvider().send(phone, message)
        url = f"https://api.twilio.com/2010-04-01/Accounts/{self.account_sid}/Messages.json"
        try:
            resp = requests.post(
                url,
                auth=(self.account_sid, self.auth_token),
                data={"To": phone, "From": self.from_number, "Body": message},
                timeout=10,
            )
            return resp.ok
        except requests.RequestException:
            logger.exception("Twilio SMS send failed")
            return False


def get_sms_provider(provider_name: str, config) -> SMSProvider:
    if provider_name == "africastalking":
        return AfricasTalkingSMSProvider(config.AT_USERNAME, config.AT_API_KEY)
    if provider_name == "twilio":
        return TwilioSMSProvider(config.TWILIO_ACCOUNT_SID, config.TWILIO_AUTH_TOKEN, config.TWILIO_FROM_NUMBER)
    return ConsoleSMSProvider()
