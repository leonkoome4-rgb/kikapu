from datetime import datetime, timezone
from app.extensions import db


class Contribution(db.Model):
    __tablename__ = "contributions"

    id = db.Column(db.Integer, primary_key=True)
    group_id = db.Column(db.Integer, db.ForeignKey("groups.id"), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    amount = db.Column(db.Numeric(12, 2), nullable=False)
    mpesa_ref = db.Column(db.String(60), nullable=True)
    status = db.Column(db.String(20), nullable=False, default="pending")  # pending | completed | failed
    checkout_request_id = db.Column(db.String(80), nullable=True)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    group = db.relationship("Group", back_populates="contributions")
    user = db.relationship("User", back_populates="contributions")

    def to_dict(self):
        return {
            "id": self.id,
            "group_id": self.group_id,
            "user_id": self.user_id,
            "amount": float(self.amount) if self.amount is not None else 0,
            "mpesa_ref": self.mpesa_ref,
            "status": self.status,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
