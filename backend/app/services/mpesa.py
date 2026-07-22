import base64
import logging
from datetime import datetime

import requests
from flask import current_app

from app.utils.phone import normalize_phone

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
    Accepts any common Kenyan phone format (0791234567, +254791234567,
    254791234567, 791234567, with spaces/dashes) and normalizes it to the
    2547XXXXXXXX format Daraja requires.
    """
    phone = normalize_phone(phone)

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


def stk_push_query(checkout_request_id: str):
    """
    Ask Daraja directly whether a CheckoutRequestID has succeeded, failed, or
    is still awaiting the customer's PIN entry. This is what lets the app
    resolve a contribution's final status even when the callback can't reach
    a local/dev server.

    Returns a dict: {"state": "completed" | "failed" | "pending", "detail": str}
    """
    if checkout_request_id.startswith("SIMULATED-"):
        return {"state": "completed", "detail": "Simulated transaction (no real Daraja credentials configured)."}

    token = get_access_token()
    if not token:
        return {"state": "pending", "detail": "M-Pesa credentials not configured."}

    password, timestamp = _password_and_timestamp()
    url = f"{_base_url()}/mpesa/stkpushquery/v1/query"
    payload = {
        "BusinessShortCode": current_app.config["MPESA_SHORTCODE"],
        "Password": password,
        "Timestamp": timestamp,
        "CheckoutRequestID": checkout_request_id,
    }
    headers = {"Authorization": f"Bearer {token}"}
    try:
        resp = requests.post(url, json=payload, headers=headers, timeout=15)
        data = resp.json()
    except (requests.RequestException, ValueError):
        logger.exception("M-Pesa STK push query failed")
        return {"state": "pending", "detail": "Could not reach M-Pesa to confirm status; will retry."}

    # Only a well-formed 200 response with a ResultCode is a confident,
    # final answer. Anything else — rate limiting, auth hiccups, malformed
    # bodies — is transient and must NOT be treated as a failure, or a
    # temporary infrastructure error would incorrectly mark a contribution
    # as failed in the database.
    if not (resp.ok and "ResultCode" in data):
        detail = data.get("errorMessage") or data.get("fault", {}).get("faultstring") or "Could not confirm status yet"
        logger.info("STK query gave a non-final response (%s): %s", resp.status_code, data)
        return {"state": "pending", "detail": detail}

    result_code = str(data["ResultCode"])
    if result_code == "0":
        return {"state": "completed", "detail": data.get("ResultDesc", "Success")}
    if result_code == "4999":
        # Verified against live sandbox: 4999 means the push is still
        # awaiting the customer's PIN entry, not a final failure.
        return {"state": "pending", "detail": data.get("ResultDesc", "Still awaiting customer action")}
    return {"state": "failed", "detail": data.get("ResultDesc", "Transaction failed")}
