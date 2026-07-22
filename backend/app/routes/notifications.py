from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity

from app.extensions import db
from app.models.user import User
from app.models.notification import Notification

notifications_bp = Blueprint("notifications", __name__)


@notifications_bp.get("")
@jwt_required()
def list_notifications():
    user_id = int(get_jwt_identity())
    notifications = (
        Notification.query.filter_by(user_id=user_id).order_by(Notification.sent_at.desc()).limit(100).all()
    )
    return jsonify({"notifications": [n.to_dict() for n in notifications]})


@notifications_bp.get("/preferences")
@jwt_required()
def get_preferences():
    user = User.query.get_or_404(int(get_jwt_identity()))
    return jsonify(
        {"sms_notifications": user.sms_notifications, "email_notifications": user.email_notifications}
    )


@notifications_bp.put("/preferences")
@jwt_required()
def update_preferences():
    user = User.query.get_or_404(int(get_jwt_identity()))
    data = request.get_json(silent=True) or {}

    if "sms_notifications" in data:
        user.sms_notifications = bool(data["sms_notifications"])
    if "email_notifications" in data:
        user.email_notifications = bool(data["email_notifications"])

    db.session.commit()
    return jsonify(
        {"sms_notifications": user.sms_notifications, "email_notifications": user.email_notifications}
    )
