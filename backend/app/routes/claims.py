from datetime import datetime, timezone
from decimal import Decimal

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity

from app.extensions import db
from app.models.group import Group, FAST_TRACKED_FUND_TYPES
from app.models.membership import Membership
from app.models.claim import Claim
from app.services.notifications import notify_user

claims_bp = Blueprint("claims", __name__)


def _membership_for(user_id, group_id):
    return Membership.query.filter_by(user_id=user_id, group_id=group_id, is_active=True).first()


@claims_bp.post("")
@jwt_required()
def file_claim():
    user_id = int(get_jwt_identity())
    data = request.get_json(silent=True) or {}
    group_id = data.get("group_id")
    amount_requested = data.get("amount_requested")
    reason = (data.get("reason") or "").strip()

    if not group_id or not amount_requested or not reason:
        return jsonify({"error": "group_id, amount_requested and reason are required"}), 400

    group = Group.query.get_or_404(group_id)
    if not _membership_for(user_id, group_id):
        return jsonify({"error": "You must be a member of this group to file a claim"}), 403

    claim = Claim(group_id=group_id, user_id=user_id, amount_requested=amount_requested, reason=reason)

    if group.fund_type in FAST_TRACKED_FUND_TYPES:
        claim.status = "approved"
        claim.reviewed_at = datetime.now(timezone.utc)
        group.balance = (group.balance or 0) - Decimal(str(amount_requested))

    db.session.add(claim)
    db.session.commit()

    if claim.status == "approved":
        notify_user(
            claim.user,
            f"Kikapu: your claim of KES {amount_requested} on '{group.name}' was fast-tracked and approved.",
            subject="Claim approved",
        )
    notify_user(
        group.admin,
        f"Kikapu: {claim.user.name} filed a claim of KES {amount_requested} on '{group.name}'.",
        subject="New claim filed",
    )

    return jsonify({"claim": claim.to_dict()}), 201


@claims_bp.get("/mine")
@jwt_required()
def my_claims():
    user_id = int(get_jwt_identity())
    claims = Claim.query.filter_by(user_id=user_id).order_by(Claim.created_at.desc()).all()
    return jsonify({"claims": [c.to_dict() for c in claims]})


@claims_bp.get("/group/<int:group_id>")
@jwt_required()
def group_claims(group_id):
    user_id = int(get_jwt_identity())
    if not _membership_for(user_id, group_id):
        return jsonify({"error": "You do not have access to this group"}), 403

    claims = Claim.query.filter_by(group_id=group_id).order_by(Claim.created_at.desc()).all()
    return jsonify({"claims": [c.to_dict() for c in claims]})


@claims_bp.put("/<int:claim_id>")
@jwt_required()
def review_claim(claim_id):
    user_id = int(get_jwt_identity())
    claim = Claim.query.get_or_404(claim_id)
    group = claim.group

    if group.admin_id != user_id:
        return jsonify({"error": "Only the group admin can review claims"}), 403
    if claim.status != "pending":
        return jsonify({"error": "This claim has already been reviewed"}), 409

    data = request.get_json(silent=True) or {}
    decision = data.get("status")
    if decision not in ("approved", "rejected"):
        return jsonify({"error": "status must be 'approved' or 'rejected'"}), 400

    claim.status = decision
    claim.reviewed_at = datetime.now(timezone.utc)
    if decision == "approved":
        group.balance = (group.balance or 0) - claim.amount_requested

    db.session.commit()

    notify_user(
        claim.user,
        f"Kikapu: your claim of KES {claim.amount_requested} on '{group.name}' was {decision}.",
        subject=f"Claim {decision}",
    )

    return jsonify({"claim": claim.to_dict()})


@claims_bp.delete("/<int:claim_id>")
@jwt_required()
def withdraw_claim(claim_id):
    user_id = int(get_jwt_identity())
    claim = Claim.query.get_or_404(claim_id)

    if claim.user_id != user_id:
        return jsonify({"error": "You can only withdraw your own claim"}), 403
    if claim.status != "pending":
        return jsonify({"error": "Only a pending claim can be withdrawn"}), 409

    db.session.delete(claim)
    db.session.commit()
    return jsonify({"message": "Claim withdrawn"})
