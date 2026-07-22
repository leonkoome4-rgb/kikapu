import secrets
from decimal import Decimal

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity

from app.extensions import db
from app.models.group import Group
from app.models.membership import Membership
from app.models.contribution import Contribution
from app.models.user import User
from app.services.mpesa import stk_push
from app.services.notifications import notify_user

contributions_bp = Blueprint("contributions", __name__)


def _membership_for(user_id, group_id):
    return Membership.query.filter_by(user_id=user_id, group_id=group_id, is_active=True).first()


def _get_or_create_guest(name, phone, email):
    email = (email or "").strip().lower() or f"guest-{phone}@kikapu.local"
    user = User.query.filter((User.phone == phone) | (User.email == email)).first()
    if user:
        return user
    user = User(name=name or "Guest contributor", phone=phone, email=email, role="guest")
    user.set_password(secrets.token_urlsafe(16))
    db.session.add(user)
    db.session.flush()
    return user


@contributions_bp.post("")
@jwt_required(optional=True)
def create_contribution():
    data = request.get_json(silent=True) or {}
    group_id = data.get("group_id")
    amount = data.get("amount")
    phone = (data.get("phone") or "").strip()

    if not group_id or not amount or not phone:
        return jsonify({"error": "group_id, amount and phone are required"}), 400

    group = Group.query.get_or_404(group_id)
    identity = get_jwt_identity()

    if identity:
        user_id = int(identity)
        if not group.is_public and not _membership_for(user_id, group_id):
            return jsonify({"error": "You must join this group before contributing"}), 403
        user = User.query.get(user_id)
    else:
        if not group.is_public:
            return jsonify({"error": "Login is required to contribute to this group"}), 401
        user = _get_or_create_guest(data.get("name"), phone, data.get("email"))
        if not _membership_for(user.id, group_id):
            db.session.add(Membership(user_id=user.id, group_id=group_id, role="member"))

    contribution = Contribution(group_id=group_id, user_id=user.id, amount=amount, status="pending")
    db.session.add(contribution)
    db.session.flush()

    stk_response = stk_push(phone, float(amount), account_reference=f"KIKAPU-{group.id}-{contribution.id}")
    contribution.checkout_request_id = stk_response.get("CheckoutRequestID")

    # Sandbox/demo convenience: without live Daraja credentials the callback
    # never arrives, so mark the contribution completed immediately and
    # update the group balance right away.
    if stk_response.get("simulated"):
        contribution.status = "completed"
        contribution.mpesa_ref = stk_response.get("CheckoutRequestID")
        group.balance = (group.balance or 0) + Decimal(str(amount))

    db.session.commit()

    notify_user(
        user,
        f"Kikapu: your contribution of KES {amount} to '{group.name}' was received. Asante!",
        subject="Contribution received",
    )

    return jsonify({"contribution": contribution.to_dict(), "mpesa": stk_response}), 201


@contributions_bp.post("/mpesa/callback")
def mpesa_callback():
    """Webhook invoked by Safaricom Daraja once the STK push is resolved."""
    payload = request.get_json(silent=True) or {}
    body = payload.get("Body", {}).get("stkCallback", {})
    checkout_request_id = body.get("CheckoutRequestID")
    result_code = body.get("ResultCode")

    contribution = Contribution.query.filter_by(checkout_request_id=checkout_request_id).first()
    if not contribution:
        return jsonify({"message": "No matching contribution"}), 200

    if result_code == 0:
        items = body.get("CallbackMetadata", {}).get("Item", [])
        receipt = next((i.get("Value") for i in items if i.get("Name") == "MpesaReceiptNumber"), None)
        contribution.status = "completed"
        contribution.mpesa_ref = receipt
        contribution.group.balance = (contribution.group.balance or 0) + contribution.amount
    else:
        contribution.status = "failed"

    db.session.commit()
    return jsonify({"message": "Processed"})


@contributions_bp.get("/mine")
@jwt_required()
def my_contributions():
    user_id = int(get_jwt_identity())
    contributions = (
        Contribution.query.filter_by(user_id=user_id).order_by(Contribution.created_at.desc()).all()
    )
    return jsonify({"contributions": [c.to_dict() for c in contributions]})


@contributions_bp.get("/group/<int:group_id>")
@jwt_required()
def group_contributions(group_id):
    user_id = int(get_jwt_identity())
    if not _membership_for(user_id, group_id):
        return jsonify({"error": "You do not have access to this group"}), 403

    contributions = (
        Contribution.query.filter_by(group_id=group_id).order_by(Contribution.created_at.desc()).all()
    )
    return jsonify({"contributions": [c.to_dict() for c in contributions]})


@contributions_bp.put("/<int:contribution_id>")
@jwt_required()
def update_contribution(contribution_id):
    user_id = int(get_jwt_identity())
    contribution = Contribution.query.get_or_404(contribution_id)
    if contribution.group.admin_id != user_id:
        return jsonify({"error": "Only the group admin can update this contribution"}), 403

    data = request.get_json(silent=True) or {}
    new_status = data.get("status")
    if new_status not in ("pending", "completed", "failed"):
        return jsonify({"error": "status must be pending, completed or failed"}), 400

    if contribution.status != "completed" and new_status == "completed":
        contribution.group.balance = (contribution.group.balance or 0) + contribution.amount
    elif contribution.status == "completed" and new_status != "completed":
        contribution.group.balance = (contribution.group.balance or 0) - contribution.amount

    contribution.status = new_status
    db.session.commit()
    return jsonify({"contribution": contribution.to_dict()})


@contributions_bp.delete("/<int:contribution_id>")
@jwt_required()
def delete_contribution(contribution_id):
    user_id = int(get_jwt_identity())
    contribution = Contribution.query.get_or_404(contribution_id)
    if contribution.group.admin_id != user_id:
        return jsonify({"error": "Only the group admin can delete this contribution"}), 403

    if contribution.status == "completed":
        contribution.group.balance = (contribution.group.balance or 0) - contribution.amount

    db.session.delete(contribution)
    db.session.commit()
    return jsonify({"message": "Contribution deleted"})
