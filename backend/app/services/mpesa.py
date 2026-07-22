import base64
import logging
from datetime import datetime

import requests
from flask import current_app

logger = logging.getLogger("kikapu.mpesa")

SANDBOX_BASE_URL = "https://sandbox.safaricom.co.ke"
PRODUCTION_BASE_URL = "https://api.safaricom.co.ke"


def _base_url():
    return PRODUCTION_BASE_URL if current_app.config["MPESA_ENV"] == "production" else SANDBOX_BASE_URL


def get_access_token():
    key = current_app.config["MPESA_CONSUMER_KEY"]
    secret = current_app.config["MPESA_CONSUMER_SECRET"]
    if not key or not secret:
        return None
    url = f"{_base_url()}/oauth/v1/generate?grant_type=client_credentials"
    try:
        resp = requests.get(url, auth=(key, secret), timeout=10)
        resp.raise_for_status()
        return resp.json().get("access_token")
    except requests.RequestException:
        logger.exception("Failed to fetch M-Pesa access token")
        return None


def _password_and_timestamp():
    shortcode = current_app.config["MPESA_SHORTCODE"]
    passkey = current_app.config["MPESA_PASSKEY"]
    timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
    raw = f"{shortcode}{passkey}{timestamp}"
    password = base64.b64encode(raw.encode()).decode()
    return password, timestamp


def stk_push(phone: str, amount: float, account_reference: str, description: str = "Kikapu contribution"):
    """
    Trigger an M-Pesa Daraja STK Push (sandbox by default).
    Falls back to a simulated successful checkout when sandbox credentials
    are not configured, so the flow can be demoed without real credentials.
    """
    token = get_access_token()
    if not token:
        logger.info("No M-Pesa credentials configured; simulating STK push for demo purposes")
        return {
            "simulated": True,
            "CheckoutRequestID": f"SIMULATED-{account_reference}",
            "ResponseCode": "0",
            "ResponseDescription": "Simulated success (sandbox credentials not configured)",
        }

    password, timestamp = _password_and_timestamp()
    url = f"{_base_url()}/mpesa/stkpush/v1/processrequest"
    payload = {
        "BusinessShortCode": current_app.config["MPESA_SHORTCODE"],
        "Password": password,
        "Timestamp": timestamp,
        "TransactionType": "CustomerPayBillOnline",
        "Amount": int(amount),
        "PartyA": phone,
        "PartyB": current_app.config["MPESA_SHORTCODE"],
        "PhoneNumber": phone,
        "CallBackURL": current_app.config["MPESA_CALLBACK_URL"],
        "AccountReference": account_reference,
        "TransactionDesc": description,
    }
    headers = {"Authorization": f"Bearer {token}"}
    try:
        resp = requests.post(url, json=payload, headers=headers, timeout=15)
        resp.raise_for_status()
        return resp.json()
    except requests.RequestException:
        logger.exception("M-Pesa STK push request failed")
        return {"simulated": False, "ResponseCode": "1", "ResponseDescription": "STK push request failed"}
