from datetime import datetime, timezone
from app.extensions import db


class Membership(db.Model):
    """Join table for the many-to-many relationship between User and Group."""

    __tablename__ = "memberships"
    __table_args__ = (db.UniqueConstraint("user_id", "group_id", name="uq_user_group"),)

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    group_id = db.Column(db.Integer, db.ForeignKey("groups.id"), nullable=False)
    joined_date = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    role = db.Column(db.String(20), nullable=False, default="member")  # member | admin
    is_active = db.Column(db.Boolean, nullable=False, default=True)

    user = db.relationship("User", back_populates="memberships")
    group = db.relationship("Group", back_populates="memberships")

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "group_id": self.group_id,
            "joined_date": self.joined_date.isoformat() if self.joined_date else None,
            "role": self.role,
            "is_active": self.is_active,
        }
