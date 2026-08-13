import logging
import secrets
from datetime import datetime, timezone
from decimal import Decimal, InvalidOperation
from typing import Dict

from app.extensions import db
from app.models.claim import Claim
from app.models.contribution import Contribution
from app.models.group import FAST_TRACKED_FUND_TYPES, Group
from app.models.membership import Membership
from app.models.user import User
from app.services.mpesa import stk_push
from app.services.notifications import notify_user
from app.utils.phone import InvalidPhoneNumber, normalize_phone

logger = logging.getLogger("kikapu.ussd")

_USSD_SESSIONS: Dict[str, dict] = {}


def _get_or_create_session(session_id: str, phone_number: str) -> dict:
    session = _USSD_SESSIONS.get(session_id)
    if session is None:
        session = {"phone": phone_number or "", "step": "menu", "group_id": None, "pending_option": None}
        _USSD_SESSIONS[session_id] = session
    else:
        session["phone"] = phone_number or session.get("phone", "")
    return session


def _main_menu() -> str:
    return (
        "CON Welcome to Kikapu. Your shared basket.\n"
        "1. Browse public funds\n"
        "2. Contribute\n"
        "3. My funds\n"
        "4. File a claim"
    )


def _find_user_by_phone(raw: str):
    digits = "".join(ch for ch in (raw or "") if ch.isdigit())
    if not digits:
        return None
    if digits.startswith("254") and len(digits) == 12:
        national = digits[3:]
    elif digits.startswith("0") and len(digits) == 10:
        national = digits[1:]
    elif len(digits) == 9:
        national = digits
    else:
        return None

    for candidate in {f"254{national}", f"+254{national}", f"0{national}", national}:
        user = User.query.filter_by(phone=candidate).first()
        if user:
            return user
    return None


def _get_or_create_guest(phone: str, name: str = "Guest contributor") -> User:
    phone = phone or ""
    existing_user = User.query.filter_by(phone=phone).first()
    if existing_user:
        return existing_user

    email = f"guest-{phone}@kikapu.local"
    user = User(name=name or "Guest contributor", phone=phone, email=email, role="guest")
    user.set_password(secrets.token_urlsafe(16))
    db.session.add(user)
    db.session.flush()
    return user


def _parse_amount(raw):
    try:
        amount = Decimal(str(raw))
    except (InvalidOperation, ValueError):
        return None
    if amount <= 0:
        return None
    return amount


def _browse(session: dict) -> str:
    groups = Group.query.filter_by(is_public=True).order_by(Group.created_at.desc()).all()
    if not groups:
        return "END No public funds right now. Check back soon."

    lines = ["Public funds:"]
    for group in groups:
        lines.append(f"{group.id}. {group.name} - KSH {group.balance}")
    return "CON " + "\n".join(lines)


def _contribute(session: dict, phone: str, parts: list[str]) -> str:
    if len(parts) == 1:
        session["step"] = "await_group"
        session["pending_option"] = "2"
        return "CON Enter the fund ID:"

    try:
        group_id = int(parts[1])
    except (TypeError, ValueError):
        return "END Invalid fund ID."

    group = Group.query.get(group_id)
    if not group:
        return "END Fund not found."

    if len(parts) == 2:
        session["step"] = "await_amount"
        session["group_id"] = group.id
        session["pending_option"] = "2"
        return "CON Enter amount in KES:"

    amount = _parse_amount(parts[2])
    if amount is None:
        return "END Enter a valid amount in KES, e.g. 500"

    try:
        normalized_phone = normalize_phone(phone)
    except InvalidPhoneNumber:
        normalized_phone = phone or ""

    if not group.is_public:
        user = _find_user_by_phone(phone)
        if user is None or not Membership.query.filter_by(user_id=user.id, group_id=group.id, is_active=True).first():
            return "END You are not a member of this fund."
    else:
        user = _find_user_by_phone(phone)
        if user is None:
            user = _get_or_create_guest(normalized_phone)

    contribution = Contribution(group_id=group.id, user_id=user.id, amount=amount, status="pending")
    db.session.add(contribution)
    db.session.flush()

    stk_response = stk_push(
        normalized_phone,
        float(amount),
        account_reference=f"KIKAPU-{group.id}-{contribution.id}",
        description=f"Kikapu USSD contribution to {group.name}",
    )
    contribution.checkout_request_id = stk_response.get("CheckoutRequestID")

    if stk_response.get("simulated"):
        contribution.status = "completed"
        contribution.mpesa_ref = stk_response.get("CheckoutRequestID")
        group.balance = (group.balance or 0) + amount

    db.session.commit()

    notify_user(
        user,
        f"Kikapu: your contribution of KES {amount} to '{group.name}' was received. Asante!",
        subject="Contribution received",
    )

    session["step"] = "menu"
    session["group_id"] = None
    session["pending_option"] = None
    return f"END Contribution received. KES {amount} to '{group.name}'."


def _my_funds(session: dict, phone: str, parts: list[str]) -> str:
    user = _find_user_by_phone(phone)
    if not user:
        return "END No Kikapu account found for this number. Register on the app or web first."

    memberships = Membership.query.filter_by(user_id=user.id, is_active=True).all()
    if not memberships:
        return "END You are not in any fund yet. Join one on the app."

    if len(parts) == 2 and parts[1] == "0":
        return _main_menu()

    if len(parts) == 1:
        lines = ["My funds:"]
        for membership in memberships:
            lines.append(f"{membership.group_id}. {membership.group.name} - KSH {membership.group.balance}")
        lines.append("Enter a fund ID for details, or 0 for the main menu.")
        return "CON " + "\n".join(lines)

    try:
        group_id = int(parts[1])
    except (TypeError, ValueError):
        return "END Invalid fund ID."
    if not Membership.query.filter_by(user_id=user.id, group_id=group_id, is_active=True).first():
        return "END Fund not found or you are not a member."

    group = Group.query.get(group_id)
    return f"END {group.name} balance: KSH {group.balance}"


def _file_claim(session: dict, phone: str, parts: list[str]) -> str:
    if len(parts) < 4:
        return "END Invalid claim details."

    try:
        group_id = int(parts[1])
    except (TypeError, ValueError):
        return "END Invalid fund ID."

    group = Group.query.get(group_id)
    if not group:
        return "END Fund not found."

    user = _find_user_by_phone(phone)
    if not user:
        return "END No Kikapu account found for this number. Register on the app or web first."
    if not Membership.query.filter_by(user_id=user.id, group_id=group_id, is_active=True).first():
        return "END You must be a member of this fund to file a claim."

    amount = _parse_amount(parts[2])
    if amount is None:
        return "END Enter a valid amount in KES, e.g. 500"

    reason = "*".join(parts[3:]).strip()
    if not reason:
        return "END Reason is required."

    claim = Claim(group_id=group.id, user_id=user.id, amount_requested=amount, reason=reason)
    if group.fund_type in FAST_TRACKED_FUND_TYPES:
        claim.status = "approved"
        claim.reviewed_at = datetime.now(timezone.utc)
        group.balance = (group.balance or 0) - amount

    db.session.add(claim)
    db.session.commit()

    notify_user(
        claim.user,
        f"Kikapu: your claim of KES {amount} on '{group.name}' was {claim.status}.",
        subject=f"Claim {claim.status}",
    )
    notify_user(
        group.admin,
        f"Kikapu: {claim.user.name} filed a claim of KES {amount} on '{group.name}'.",
        subject="New claim filed",
    )
    return f"END Claim filed. Status: {claim.status}"


def handle_ussd_request(session_id: str, phone_number: str, text: str, service_code: str | None = None) -> str:
    session = _get_or_create_session(session_id, phone_number)
    phone_number = session["phone"] or phone_number or ""

    if not text or text == "":
        session["step"] = "menu"
        session["pending_option"] = None
        return _main_menu()

    parts = text.split("*")
    option = parts[0]

    if option == "1":
        return _browse(session)
    if option == "2":
        return _contribute(session, phone_number, parts)
    if option == "3":
        return _my_funds(session, phone_number, parts)
    if option == "4":
        return _file_claim(session, phone_number, parts)

    return "END Invalid option. Please try again."
