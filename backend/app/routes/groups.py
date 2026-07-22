import secrets

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity

from app.extensions import db
from app.models.group import Group, FUND_TYPES
from app.models.membership import Membership
from app.models.user import User

groups_bp = Blueprint("groups", __name__)


def _current_user():
    return User.query.get(int(get_jwt_identity()))


def _membership_for(user_id, group_id):
    return Membership.query.filter_by(user_id=user_id, group_id=group_id, is_active=True).first()


@groups_bp.get("")
def list_public_groups():
    """Public directory of harambee/wedding-style groups that accept public contributions."""
    groups = Group.query.filter_by(is_public=True).order_by(Group.created_at.desc()).all()
    return jsonify({"groups": [g.to_dict() for g in groups]})


@groups_bp.get("/mine")
@jwt_required()
def list_my_groups():
    user_id = int(get_jwt_identity())
    memberships = Membership.query.filter_by(user_id=user_id, is_active=True).all()
    groups = [m.group.to_dict(include_admin=True) for m in memberships]
    return jsonify({"groups": groups})


@groups_bp.post("")
@jwt_required()
def create_group():
    user_id = int(get_jwt_identity())
    data = request.get_json(silent=True) or {}

    name = (data.get("name") or "").strip()
    fund_type = (data.get("fund_type") or "").strip().lower()
    goal_amount = data.get("goal_amount")
    is_public = bool(data.get("is_public", False))
    description = (data.get("description") or "").strip() or None

    if not name or fund_type not in FUND_TYPES:
        return jsonify({"error": f"name is required and fund_type must be one of {FUND_TYPES}"}), 400

    group = Group(
        name=name,
        fund_type=fund_type,
        goal_amount=goal_amount,
        is_public=is_public,
        admin_id=user_id,
        description=description,
    )
    if is_public:
        group.public_slug = secrets.token_urlsafe(8)

    db.session.add(group)
    db.session.flush()

    membership = Membership(user_id=user_id, group_id=group.id, role="admin")
    db.session.add(membership)
    db.session.commit()

    return jsonify({"group": group.to_dict(include_admin=True)}), 201


@groups_bp.get("/<int:group_id>")
@jwt_required(optional=True)
def get_group(group_id):
    group = Group.query.get_or_404(group_id)
    identity = get_jwt_identity()

    if not group.is_public:
        if not identity or not _membership_for(int(identity), group_id):
            return jsonify({"error": "You do not have access to this group"}), 403

    return jsonify({"group": group.to_dict(include_admin=True)})


@groups_bp.get("/public/<slug>")
def get_public_group(slug):
    """No-login lookup used by the public harambee contribution page."""
    group = Group.query.filter_by(public_slug=slug, is_public=True).first_or_404()
    return jsonify({"group": group.to_dict(include_admin=True)})


@groups_bp.put("/<int:group_id>")
@jwt_required()
def update_group(group_id):
    user_id = int(get_jwt_identity())
    group = Group.query.get_or_404(group_id)
    if group.admin_id != user_id:
        return jsonify({"error": "Only the group admin can update this group"}), 403

    data = request.get_json(silent=True) or {}
    if "name" in data:
        group.name = (data["name"] or "").strip() or group.name
    if "goal_amount" in data:
        group.goal_amount = data["goal_amount"]
    if "description" in data:
        group.description = data["description"]
    if "is_public" in data:
        group.is_public = bool(data["is_public"])
        if group.is_public and not group.public_slug:
            group.public_slug = secrets.token_urlsafe(8)

    db.session.commit()
    return jsonify({"group": group.to_dict(include_admin=True)})


@groups_bp.delete("/<int:group_id>")
@jwt_required()
def delete_group(group_id):
    user_id = int(get_jwt_identity())
    group = Group.query.get_or_404(group_id)
    if group.admin_id != user_id:
        return jsonify({"error": "Only the group admin can delete this group"}), 403

    db.session.delete(group)
    db.session.commit()
    return jsonify({"message": "Group deleted"})


@groups_bp.post("/<int:group_id>/join")
@jwt_required()
def join_group(group_id):
    user_id = int(get_jwt_identity())
    group = Group.query.get_or_404(group_id)

    existing = Membership.query.filter_by(user_id=user_id, group_id=group_id).first()
    if existing:
        if existing.is_active:
            return jsonify({"error": "Already a member of this group"}), 409
        existing.is_active = True
        db.session.commit()
        return jsonify({"membership": existing.to_dict()})

    membership = Membership(user_id=user_id, group_id=group_id, role="member")
    db.session.add(membership)
    db.session.commit()
    return jsonify({"membership": membership.to_dict()}), 201


@groups_bp.get("/<int:group_id>/members")
@jwt_required()
def list_members(group_id):
    user_id = int(get_jwt_identity())
    if not _membership_for(user_id, group_id):
        return jsonify({"error": "You do not have access to this group"}), 403

    memberships = Membership.query.filter_by(group_id=group_id, is_active=True).all()
    members = [
        {**m.to_dict(), "user": m.user.to_dict()}
        for m in memberships
    ]
    return jsonify({"members": members})
