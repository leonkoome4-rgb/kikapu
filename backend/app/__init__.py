import logging

from flask import Flask, jsonify

from config import Config
from app.extensions import db, migrate, jwt, bcrypt, cors


def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    if not logging.root.handlers:
        logging.basicConfig(level=logging.INFO, format="%(levelname)s %(name)s: %(message)s")

    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    bcrypt.init_app(app)
    cors.init_app(app, resources={r"/api/*": {"origins": app.config["FRONTEND_ORIGIN"]}})

    from app.models import User, Group, Membership, Contribution, Claim, Notification  # noqa: F401

    from app.routes.auth import auth_bp
    from app.routes.groups import groups_bp
    from app.routes.contributions import contributions_bp
    from app.routes.claims import claims_bp
    from app.routes.notifications import notifications_bp

    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(groups_bp, url_prefix="/api/groups")
    app.register_blueprint(contributions_bp, url_prefix="/api/contributions")
    app.register_blueprint(claims_bp, url_prefix="/api/claims")
    app.register_blueprint(notifications_bp, url_prefix="/api/notifications")

    @app.get("/api/health")
    def health():
        return jsonify({"status": "ok", "service": "kikapu-api"})

    @app.errorhandler(404)
    def not_found(_):
        return jsonify({"error": "Not found"}), 404

    @app.errorhandler(500)
    def server_error(_):
        return jsonify({"error": "Internal server error"}), 500

    return app
