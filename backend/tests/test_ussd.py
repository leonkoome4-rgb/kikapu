import sys
from pathlib import Path
from decimal import Decimal

import pytest

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app import create_app
from app.extensions import db
from app.models.contribution import Contribution
from app.models.group import Group
from app.models.membership import Membership
from app.models.user import User


class TestConfig:
    SECRET_KEY = "test-secret"
    SQLALCHEMY_DATABASE_URI = "sqlite:///:memory:"
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    JWT_SECRET_KEY = "test-jwt-secret"
    FRONTEND_ORIGIN = ["http://localhost:5173"]
    MPESA_ENV = "sandbox"
    MPESA_CONSUMER_KEY = ""
    MPESA_CONSUMER_SECRET = ""
    MPESA_SHORTCODE = "174379"
    MPESA_PASSKEY = ""
    MPESA_CALLBACK_URL = ""
    SMS_PROVIDER = "console"
    EMAIL_PROVIDER = "console"


@pytest.fixture()
def app():
    app = create_app(TestConfig)
    app.config.update(TESTING=True)

    with app.app_context():
        db.create_all()
        admin = User(name="Admin", phone="+254700000000", email="admin@example.com")
        admin.set_password("password")
        db.session.add(admin)
        db.session.flush()

        public_group = Group(
            name="Emergency Fund",
            fund_type="emergency",
            goal_amount=1000,
            is_public=True,
            admin_id=admin.id,
            description="Test public fund",
        )
        private_group = Group(
            name="Umoja Chama",
            fund_type="chama",
            goal_amount=None,
            is_public=False,
            admin_id=admin.id,
            description="Test private fund",
        )
        matanga_group = Group(
            name="Matanga Fund",
            fund_type="matanga",
            goal_amount=None,
            is_public=False,
            admin_id=admin.id,
            description="Test fast-tracked funeral fund",
        )
        harambee_group = Group(
            name="Harambee Fund",
            fund_type="harambee",
            goal_amount=500000,
            is_public=True,
            admin_id=admin.id,
            description="Test public fundraiser",
        )
        db.session.add_all([public_group, private_group, matanga_group, harambee_group])
        db.session.flush()

        for group in (public_group, private_group, matanga_group, harambee_group):
            db.session.add(Membership(user_id=admin.id, group_id=group.id, role="admin"))
        db.session.commit()

        app.config["_public_group_id"] = public_group.id
        app.config["_private_group_id"] = private_group.id
        app.config["_matanga_group_id"] = matanga_group.id
        app.config["_harambee_group_id"] = harambee_group.id

    yield app

    with app.app_context():
        db.drop_all()


@pytest.fixture()
def client(app):
    return app.test_client()


def _ussd(client, text, session_id="sess-1", phone="+254712345678"):
    return client.post(
        "/api/ussd",
        data={
            "sessionId": session_id,
            "serviceCode": "*384*100#",
            "phoneNumber": phone,
            "text": text,
        },
    )


def test_ussd_welcome_menu(client):
    response = _ussd(client, "")
    assert response.status_code == 200
    body = response.get_data(as_text=True)
    assert body.startswith("CON ")
    assert "Welcome to Kikapu" in body
    assert "1. Browse public funds" in body
    assert "2. Contribute" in body


def test_ussd_browse_public_funds(client):
    response = _ussd(client, "1")
    body = response.get_data(as_text=True)
    assert "Public funds:" in body
    assert "Emergency Fund" in body
    assert "Umoja Chama" not in body


def test_ussd_invalid_option(client):
    response = _ussd(client, "9")
    assert "Invalid option" in response.get_data(as_text=True)


def test_ussd_contribution_flow(monkeypatch, client):
    def fake_stk_push(phone, amount, account_reference, description="Kikapu contribution"):
        return {
            "simulated": True,
            "CheckoutRequestID": f"SIMULATED-{account_reference}",
            "ResponseCode": "0",
            "ResponseDescription": "Simulated success",
        }

    monkeypatch.setattr("app.services.ussd.stk_push", fake_stk_push)

    first_response = _ussd(client, "")
    assert "1. Browse public funds" in first_response.get_data(as_text=True)

    second_response = _ussd(client, "2")
    assert "Enter the fund ID" in second_response.get_data(as_text=True)

    third_response = _ussd(client, f"2*{client.application.config['_public_group_id']}")
    assert "Enter amount in KES" in third_response.get_data(as_text=True)

    fourth_response = _ussd(client, f"2*{client.application.config['_public_group_id']}*500")
    body = fourth_response.get_data(as_text=True)
    assert fourth_response.status_code == 200
    assert "Contribution received" in body

    with client.application.app_context():
        contribution = Contribution.query.one()
        assert contribution.amount == Decimal("500")
        assert contribution.status == "completed"


def test_ussd_contribution_private_group_requires_membership(client):
    response = _ussd(client, f"2*{client.application.config['_private_group_id']}*500")
    body = response.get_data(as_text=True)
    assert "not a member" in body

    with client.application.app_context():
        assert Contribution.query.count() == 0


def test_ussd_my_funds(client):
    response = _ussd(client, "3", phone="+254700000000")
    body = response.get_data(as_text=True)
    assert "My funds:" in body
    assert "Emergency Fund" in body
    assert "Umoja Chama" in body


def test_ussd_my_funds_single_balance(client):
    response = _ussd(client, f"3*{client.application.config['_private_group_id']}", phone="+254700000000")
    body = response.get_data(as_text=True)
    assert body.startswith("END ")
    assert "Umoja Chama balance: KSH 0" in body


def test_ussd_my_funds_unknown_phone(client):
    response = _ussd(client, "3")
    assert "No Kikapu account" in response.get_data(as_text=True)


def test_ussd_file_claim_fast_tracked(client):
    response = _ussd(
        client,
        f"4*{client.application.config['_public_group_id']}*2000*School fees",
        phone="+254700000000",
    )
    body = response.get_data(as_text=True)
    assert "Claim filed. Status: approved" in body

    with client.application.app_context():
        group = Group.query.get(client.application.config["_public_group_id"])
        assert group.balance == Decimal("-2000")


def test_ussd_file_claim_matanga_fast_tracked(client):
    response = _ussd(
        client,
        f"4*{client.application.config['_matanga_group_id']}*3000*Funeral support",
        phone="+254700000000",
    )
    body = response.get_data(as_text=True)
    assert "Claim filed. Status: approved" in body


def test_ussd_file_claim_harambee_not_fast_tracked(client):
    response = _ussd(
        client,
        f"4*{client.application.config['_harambee_group_id']}*1000*Help",
        phone="+254700000000",
    )
    body = response.get_data(as_text=True)
    assert "Claim filed. Status: pending" in body

    with client.application.app_context():
        group = Group.query.get(client.application.config["_harambee_group_id"])
        assert group.balance == Decimal("0")
