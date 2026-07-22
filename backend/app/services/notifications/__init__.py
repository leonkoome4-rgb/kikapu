from flask import current_app
from app.extensions import db
from app.models.notification import Notification
from app.services.notifications.sms_providers import get_sms_provider
from app.services.notifications.email_providers import get_email_provider


def notify_user(user, message: str, subject: str = "Kikapu notification", channels=None):
    """
    Send a notification through the user's preferred channels and log each
    attempt as a Notification row. `channels` defaults to whichever of
    sms/email the user has enabled; pass an explicit list to override.
    """
    if channels is None:
        channels = []
        if user.sms_notifications:
            channels.append("sms")
        if user.email_notifications:
            channels.append("email")

    results = []
    for channel in channels:
        if channel == "sms":
            provider = get_sms_provider(current_app.config["SMS_PROVIDER"], current_app.config)
            ok = provider.send(user.phone, message)
        elif channel == "email":
            provider = get_email_provider(current_app.config["EMAIL_PROVIDER"], current_app.config)
            ok = provider.send(user.email, subject, message)
        else:
            continue

        record = Notification(
            user_id=user.id,
            message=message,
            channel=channel,
            status="sent" if ok else "failed",
        )
        db.session.add(record)
        results.append(record)

    db.session.commit()
    return results
