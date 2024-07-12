from flask import Flask, send_file, request
from flask_cors import CORS
import os


def create_app():
    app = Flask(__name__)
    CORS(
        app, resources={r"/api/*": {"origins": "http://localhost:4200"}}
    )  # Dodano konfigurację CORS

    app.config.from_object("app.ai_agents.config.Config")

    # Files paths
    base_dir = os.path.abspath(os.path.join(app.root_path, "..", ".."))
    app.config["TEXTS_FOLDER"] = os.path.join(base_dir, "files", "texts")
    app.config["IMAGES_FOLDER"] = os.path.join(base_dir, "files", "images")
    app.config["SOUNDS_FOLDER"] = os.path.join(base_dir, "files", "sounds")
    app.config["MOVIES_FOLDER"] = os.path.join(base_dir, "files", "movies")

    from app.ai_agents.openai_agent import ai_agents_openai_agent_bp
    from app.databases.text_database import databases_text_database_bp

    app.register_blueprint(
        ai_agents_openai_agent_bp, url_prefix="/api/ai_agents/openai_agent"
    )
    app.register_blueprint(
        databases_text_database_bp, url_prefix="/api/databases/text_database"
    )

    @app.route("/serve-file", methods=["GET"])
    def serve_file():
        file_path = request.args.get("file_path")
        if file_path and os.path.exists(file_path):
            return send_file(file_path, as_attachment=True)
        return {"error": "File not found"}, 404

    return app
