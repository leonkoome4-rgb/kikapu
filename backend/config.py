import os
from datetime import timedelta
from dotenv import load_dotenv

basedir = os.path.abspath(os.path.dirname(__file__))
load_dotenv(os.path.join(basedir, ".env"))


class Config:
    SECRET_KEY = os.environ.get("SECRET_KEY", "dev-secret-key")

    database_url = os.environ.get("DATABASE_URL", f"sqlite:///{os.path.join(basedir, 'kikapu.db')}")
    if database_url.startswith("postgres://"):
        database_url = database_url.replace("postgres://", "postgresql+psycopg://", 1)
    elif database_url.startswith("postgresql://"):
        database_url = database_url.replace("postgresql://", "postgresql+psycopg://", 1)
    SQLALCHEMY_DATABASE_URI = database_url
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    JWT_SECRET_KEY = os.environ.get("JWT_SECRET_KEY", "dev-jwt-secret")
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(minutes=30)
    JWT_REFRESH_TOKEN_EXPIRES = timedelta(days=30)
    JWT_TOKEN_LOCATION = ["headers"]

    _frontend_origin = os.environ.get("FRONTEND_ORIGIN", "http://localhost:5173")
    FRONTEND_ORIGIN = [o.strip() for o in _frontend_origin.split(",")]

    MPESA_ENV = os.environ.get("MPESA_ENV", "sandbox")
    MPESA_CONSUMER_KEY = os.environ.get("MPESA_CONSUMER_KEY", "")
    MPESA_CONSUMER_SECRET = os.environ.get("MPESA_CONSUMER_SECRET", "")
    MPESA_SHORTCODE = os.environ.get("MPESA_SHORTCODE", "174379")
    MPESA_PASSKEY = os.environ.get("MPESA_PASSKEY", "")
    MPESA_CALLBACK_URL = os.environ.get("MPESA_CALLBACK_URL", "")

    # Shortcode users dial (e.g. *384*100#). Displayed in the UI/docs; the
    # code itself is issued and routed by the USSD aggregator (Africa's Talking).
    USSD_CODE = os.environ.get("USSD_CODE", "*384*100#")

    SMS_PROVIDER = os.environ.get("SMS_PROVIDER", "console")
    EMAIL_PROVIDER = os.environ.get("EMAIL_PROVIDER", "console")

    AT_USERNAME = os.environ.get("AT_USERNAME", "sandbox")
    AT_API_KEY = os.environ.get("AT_API_KEY", "")

    TWILIO_ACCOUNT_SID = os.environ.get("TWILIO_ACCOUNT_SID", "")
    TWILIO_AUTH_TOKEN = os.environ.get("TWILIO_AUTH_TOKEN", "")
    TWILIO_FROM_NUMBER = os.environ.get("TWILIO_FROM_NUMBER", "")

    SMTP_HOST = os.environ.get("SMTP_HOST", "")
    SMTP_PORT = int(os.environ.get("SMTP_PORT", "587"))
    SMTP_USER = os.environ.get("SMTP_USER", "")
    SMTP_PASSWORD = os.environ.get("SMTP_PASSWORD", "")
    SMTP_FROM = os.environ.get("SMTP_FROM", "notifications@kikapu.app")
