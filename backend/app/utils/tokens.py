from itsdangerous import URLSafeTimedSerializer
from flask import current_app

RESET_SALT = "kikapu-password-reset"
RESET_MAX_AGE_SECONDS = 60 * 30  # 30 minutes


def generate_reset_token(email: str) -> str:
    serializer = URLSafeTimedSerializer(current_app.config["SECRET_KEY"])
    return serializer.dumps(email, salt=RESET_SALT)


def verify_reset_token(token: str):
    serializer = URLSafeTimedSerializer(current_app.config["SECRET_KEY"])
    try:
        return serializer.loads(token, salt=RESET_SALT, max_age=RESET_MAX_AGE_SECONDS)
    except Exception:
        return None
