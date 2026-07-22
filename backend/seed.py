"""
Seed the Kikapu database with demo users, groups, contributions, claims and
notifications so the app can be explored immediately after setup.

Usage:
    python seed.py
"""
from datetime import datetime, timedelta, timezone
from decimal import Decimal

from app import create_app
from app.extensions import db
from app.models import User, Group, Membership, Contribution, Claim, Notification

app = create_app()

DEMO_USERS = [
    {"name": "Leon Koome", "phone": "254700000001", "email": "leon.koome@student.moringaschool.com", "role": "admin"},
    {"name": "Tracy Mboya", "phone": "254700000002", "email": "tracy.mboya@student.moringaschool.com", "role": "admin"},
    {"name": "Densinela Chepngetich", "phone": "254700000003", "email": "densinela.chepngetich@student.moringaschool.com", "role": "member"},
    {"name": "Allan Kimani", "phone": "254700000004", "email": "allan.kimani@student.moringaschool.com", "role": "member"},
    {"name": "Wanjiku Mwangi", "phone": "254700000005", "email": "wanjiku.mwangi@example.com", "role": "member"},
]
DEMO_PASSWORD = "kikapu123"

FUND_GROUPS = [
    {
        "name": "Umoja Chama",
        "fund_type": "chama",
        "is_public": False,
        "goal_amount": None,
        "description": "Monthly table-banking chama for the Moringa cohort.",
        "admin_idx": 0,
        "member_idxs": [1, 2, 3],
        "balance": Decimal("48500.00"),
    },
    {
        "name": "Family Emergency Fund",
        "fund_type": "emergency",
        "is_public": False,
        "goal_amount": None,
        "description": "Ongoing emergency reserve for the extended family.",
        "admin_idx": 1,
        "member_idxs": [0, 2, 4],
        "balance": Decimal("15250.00"),
    },
    {
        "name": "Mzee Otieno Matanga Fund",
        "fund_type": "matanga",
        "is_public": False,
        "goal_amount": None,
        "description": "Funeral contribution fund with fast-tracked claim approval.",
        "admin_idx": 2,
        "member_idxs": [0, 1, 3, 4],
        "balance": Decimal("62000.00"),
    },
    {
        "name": "Tracy & James Wedding",
        "fund_type": "wedding",
        "is_public": True,
        "goal_amount": Decimal("300000.00"),
        "description": "Help us celebrate our big day!",
        "admin_idx": 1,
        "member_idxs": [0, 3],
        "balance": Decimal("112500.00"),
    },
    {
        "name": "Maasai Mara Squad Trip",
        "fund_type": "trip",
        "is_public": False,
        "goal_amount": Decimal("80000.00"),
        "description": "Weekend group trip savings goal.",
        "admin_idx": 3,
        "member_idxs": [0, 1, 2, 4],
        "balance": Decimal("32000.00"),
    },
    {
        "name": "Rebuild Kibra Library Harambee",
        "fund_type": "harambee",
        "is_public": True,
        "goal_amount": Decimal("500000.00"),
        "description": "Community harambee to rebuild the local library after the fire.",
        "admin_idx": 0,
        "member_idxs": [1, 2, 3, 4],
        "balance": Decimal("187300.00"),
    },
]


def run():
    with app.app_context():
        db.drop_all()
        db.create_all()

        users = []
        for u in DEMO_USERS:
            user = User(name=u["name"], phone=u["phone"], email=u["email"], role=u["role"])
            user.set_password(DEMO_PASSWORD)
            db.session.add(user)
            users.append(user)
        db.session.flush()

        groups = []
        for g in FUND_GROUPS:
            group = Group(
                name=g["name"],
                fund_type=g["fund_type"],
                goal_amount=g["goal_amount"],
                is_public=g["is_public"],
                admin_id=users[g["admin_idx"]].id,
                description=g["description"],
                balance=g["balance"],
            )
            if group.is_public:
                import secrets

                group.public_slug = secrets.token_urlsafe(8)
            db.session.add(group)
            db.session.flush()
            groups.append(group)

            db.session.add(Membership(user_id=users[g["admin_idx"]].id, group_id=group.id, role="admin"))
            for idx in g["member_idxs"]:
                db.session.add(Membership(user_id=users[idx].id, group_id=group.id, role="member"))

        db.session.flush()

        now = datetime.now(timezone.utc)
        for i, group in enumerate(groups):
            for j, member_idx in enumerate(FUND_GROUPS[i]["member_idxs"][:2]):
                db.session.add(
                    Contribution(
                        group_id=group.id,
                        user_id=users[member_idx].id,
                        amount=Decimal("1000.00") * (j + 1),
                        mpesa_ref=f"SEED{i}{j}REF",
                        status="completed",
                        created_at=now - timedelta(days=j + 1),
                    )
                )

        claim_targets = [(0, 0, "chama"), (1, 2, "emergency"), (2, 0, "matanga")]
        for group_idx, member_idx, _label in claim_targets:
            group = groups[group_idx]
            db.session.add(
                Claim(
                    group_id=group.id,
                    user_id=users[member_idx].id,
                    amount_requested=Decimal("5000.00"),
                    reason="School fees emergency" if group.fund_type == "emergency" else "Funeral expense support",
                    status="approved" if group.fund_type in ("matanga", "emergency") else "pending",
                    reviewed_at=now if group.fund_type in ("matanga", "emergency") else None,
                )
            )

        for user in users[:3]:
            db.session.add(
                Notification(
                    user_id=user.id,
                    message="Welcome to Kikapu! Your basket is ready.",
                    channel="email",
                    status="sent",
                )
            )

        db.session.commit()
        print(f"Seeded {len(users)} users, {len(groups)} groups.")
        print(f"Demo login password for all seeded users: {DEMO_PASSWORD}")
        for u in users:
            print(f"  - {u.email} / {u.phone}")


if __name__ == "__main__":
    run()
