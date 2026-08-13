import logging
import os

import ngrok

from wsgi import app

PORT = 5000
NGROK_AUTHTOKEN = os.environ.get("NGROK_AUTHTOKEN", "")

logger = logging.getLogger("kikapu.ngrok")


def connect_ngrok():
    """Start an ngrok tunnel to the local Flask server; print the public URL."""
    forwarder = ngrok.forward(
        f"localhost:{PORT}",
        authtoken_from_env=True,
        domain="briskness-stingily-stowaway.ngrok-free.dev",
    )
    public_url = forwarder.url()
    app.config["MPESA_CALLBACK_URL"] = f"{public_url}/api/contributions/mpesa/callback"
    print(f"\n[ngrok] Available at: {public_url}")
    print(f"[ngrok] M-Pesa callback: {app.config['MPESA_CALLBACK_URL']}")
    print(f"[ngrok] USSD callback: {public_url}/api/ussd\n")
    return forwarder


if __name__ == "__main__":
    if NGROK_AUTHTOKEN and os.environ.get("WERKZEUG_RUN_MAIN") != "true":
        try:
            connect_ngrok()
        except Exception:
            logger.exception("Failed to start ngrok tunnel")
            print("[ngrok] Tunnel not started — callbacks won't reach this machine.\n")
    elif not NGROK_AUTHTOKEN:
        print("[ngrok] Set NGROK_AUTHTOKEN in backend/.env or the shell to expose callbacks via an ngrok tunnel.\n")

    app.run(debug=True, port=PORT)
