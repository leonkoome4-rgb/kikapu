from datetime import datetime, timezone
from app.extensions import db, bcrypt


class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    phone = db.Column(db.String(20), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(20), nullable=False, default="member")  # member | admin
    sms_notifications = db.Column(db.Boolean, nullable=False, default=True)
    email_notifications = db.Column(db.Boolean, nullable=False, default=True)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    groups_administered = db.relationship(
        "Group", back_populates="admin", foreign_keys="Group.admin_id", lazy="dynamic"
    )
    memberships = db.relationship(
        "Membership", back_populates="user", cascade="all, delete-orphan", lazy="dynamic"
    )
    contributions = db.relationship(
        "Contribution", back_populates="user", cascade="all, delete-orphan", lazy="dynamic"
    )
    claims = db.relationship(
        "Claim", back_populates="user", cascade="all, delete-orphan", lazy="dynamic"
    )
    notifications = db.relationship(
        "Notification", back_populates="user", cascade="all, delete-orphan", lazy="dynamic"
    )

    groups = db.relationship(
        "Group",
        secondary="memberships",
        back_populates="members",
        viewonly=True,
    )

    def set_password(self, raw_password):
        self.password_hash = bcrypt.generate_password_hash(raw_password).decode("utf-8")

    def check_password(self, raw_password):
        return bcrypt.check_password_hash(self.password_hash, raw_password)

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "phone": self.phone,
            "email": self.email,
            "role": self.role,
            "sms_notifications": self.sms_notifications,
            "email_notifications": self.email_notifications,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
