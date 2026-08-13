from datetime import datetime, timezone
from app.extensions import db

FUND_TYPES = ["chama", "emergency", "matanga", "wedding", "trip", "harambee"]

# Fund types where claims are fast-tracked (auto-approved) instead of waiting
# on manual admin review, per the product spec.
FAST_TRACKED_FUND_TYPES = {"matanga", "emergency"}


class Group(db.Model):
    __tablename__ = "groups"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(150), nullable=False)
    fund_type = db.Column(db.String(20), nullable=False)  # see FUND_TYPES
    goal_amount = db.Column(db.Numeric(12, 2), nullable=True)
    is_public = db.Column(db.Boolean, nullable=False, default=False)
    admin_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    description = db.Column(db.Text, nullable=True)
    balance = db.Column(db.Numeric(12, 2), nullable=False, default=0)
    public_slug = db.Column(db.String(40), unique=True, nullable=True)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    admin = db.relationship("User", back_populates="groups_administered", foreign_keys=[admin_id])
    memberships = db.relationship("Membership", back_populates="group", cascade="all, delete-orphan")
    members = db.relationship("User", secondary="memberships", back_populates="groups", viewonly=True)
    contributions = db.relationship("Contribution", back_populates="group", cascade="all, delete-orphan")
    claims = db.relationship("Claim", back_populates="group", cascade="all, delete-orphan")

    def to_dict(self, include_admin=False):
        data = {
            "id": self.id,
            "name": self.name,
            "fund_type": self.fund_type,
            "goal_amount": float(self.goal_amount) if self.goal_amount is not None else None,
            "is_public": self.is_public,
            "admin_id": self.admin_id,
            "description": self.description,
            "balance": float(self.balance) if self.balance is not None else 0,
            "public_slug": self.public_slug,
            "member_count": len(self.memberships),
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
        if include_admin and self.admin:
            data["admin"] = {"id": self.admin.id, "name": self.admin.name}
        return data
