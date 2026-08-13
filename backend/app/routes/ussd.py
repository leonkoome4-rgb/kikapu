from flask import Blueprint, request

from app.services.ussd import handle_ussd_request

ussd_bp = Blueprint("ussd", __name__)


def _read_value(payload, *names):
    for name in names:
        value = payload.get(name)
        if value not in (None, ""):
            return value
    return None


@ussd_bp.post("")
def ussd_callback():
    """Africa's Talking USSD callback."""
    payload = request.form.to_dict() if request.form else {}
    if not payload and request.is_json:
        payload = request.get_json(silent=True) or {}

    session_id = _read_value(payload, "sessionId", "session_id")
    phone_number = _read_value(payload, "phoneNumber", "phone_number")
    text = _read_value(payload, "text") or ""
    service_code = _read_value(payload, "serviceCode", "service_code")

    response_text = handle_ussd_request(session_id or "default", phone_number or "", text, service_code)
    return response_text, 200, {"Content-Type": "text/plain; charset=utf-8"}
