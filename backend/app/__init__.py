from flask import Flask, send_file, request, jsonify, make_response
from flask_cors import CORS
import os


def create_app():
    static_folder_path = os.path.abspath(
        os.path.join(os.path.dirname(__file__), "../../frontend/dist/aiworks/browser")
    )
    app = Flask(__name__, static_folder=static_folder_path)
    CORS(
        app,
        resources={
            r"/api/*": {"origins": ["http://localhost:4200", "http://127.0.0.1:4200"]}
        },
    )

    @app.before_request
    def handle_preflight():
        if request.method == "OPTIONS":
            response = make_response()
            response.headers["Access-Control-Allow-Origin"] = request.headers.get(
                "Origin", "*"
            )
            response.headers["Access-Control-Allow-Methods"] = (
                "GET, POST, PUT, DELETE, OPTIONS"
            )
            response.headers["Access-Control-Allow-Headers"] = request.headers.get(
                "Access-Control-Request-Headers", "Authorization, Content-Type"
            )
            return response

    app.config.from_object("app.ai_agents.config.Config")

    # Paths for files
    base_dir = os.path.abspath(os.path.join(app.root_path, "..", ".."))
    app.config["TEXTS_FOLDER"] = os.path.join(base_dir, "files", "texts")
    app.config["IMAGES_FOLDER"] = os.path.join(base_dir, "files", "images")
    app.config["SOUNDS_FOLDER"] = os.path.join(base_dir, "files", "sounds")
    app.config["MOVIES_FOLDER"] = os.path.join(base_dir, "files", "movies")
    app.config["MIXED_FOLDER"] = os.path.join(base_dir, "files", "mixed")

    from app.databases.text_database import databases_text_database_bp
    from app.ai_agents.openai_agent import ai_agents_openai_agent_bp  # Import blueprint

    app.register_blueprint(
        databases_text_database_bp, url_prefix="/api/databases/text_database"
    )
    app.register_blueprint(
        ai_agents_openai_agent_bp, url_prefix="/api/ai_agents/openai_agent"
    )  # Register blueprint

    from app.lessons.lesson_s00e01 import lesson_s00e01_bp
    from app.lessons.lesson_s01e01 import lesson_s01e01_bp
    from app.lessons.lesson_s01e02 import lesson_s01e02_bp
    from app.lessons.lesson_s01e03 import lesson_s01e03_bp
    from app.lessons.lesson_s01e05 import lesson_s01e05_bp
    from app.lessons.lesson_s02e01 import lesson_s02e01_bp
    from app.lessons.lesson_s02e02 import lesson_s02e02_bp
    from app.lessons.lesson_s02e03 import lesson_s02e03_bp
    from app.lessons.lesson_s02e04 import lesson_s02e04_bp
    from app.lessons.lesson_s02e05 import lesson_s02e05_bp
    from app.lessons.lesson_s03e01 import lesson_s03e01_bp
    # from app.lessons.lesson_s03e02 import lesson_s03e02_bp
    from app.lessons.lesson_s03e03 import lesson_s03e03_bp
    from app.lessons.lesson_s03e04 import lesson_s03e04_bp
    from app.lessons.lesson_s03e05 import lesson_s03e05_bp
    from app.lessons.lesson_s04e01 import lesson_s04e01_bp

    app.register_blueprint(lesson_s00e01_bp, url_prefix="/api/lessons/s00e01")
    app.register_blueprint(lesson_s01e01_bp, url_prefix="/api/lessons/s01e01")
    app.register_blueprint(lesson_s01e02_bp, url_prefix="/api/lessons/s01e02")
    app.register_blueprint(lesson_s01e03_bp, url_prefix="/api/lessons/s01e03")
    app.register_blueprint(lesson_s01e05_bp, url_prefix="/api/lessons/s01e05")
    app.register_blueprint(lesson_s02e01_bp, url_prefix="/api/lessons/s02e01")
    app.register_blueprint(lesson_s02e02_bp, url_prefix="/api/lessons/s02e02")
    app.register_blueprint(lesson_s02e03_bp, url_prefix="/api/lessons/s02e03")
    app.register_blueprint(lesson_s02e04_bp, url_prefix="/api/lessons/s02e04")
    app.register_blueprint(lesson_s02e05_bp, url_prefix="/api/lessons/s02e05")
    app.register_blueprint(lesson_s03e01_bp, url_prefix="/api/lessons/s03e01")
    # app.register_blueprint(lesson_s03e02_bp, url_prefix="/api/lessons/s03e02")
    app.register_blueprint(lesson_s03e03_bp, url_prefix="/api/lessons/s03e03")
    app.register_blueprint(lesson_s03e04_bp, url_prefix="/api/lessons/s03e04")
    app.register_blueprint(lesson_s03e05_bp, url_prefix="/api/lessons/s03e05")
    app.register_blueprint(lesson_s04e01_bp, url_prefix="/api/lessons/s04e01")

    @app.route("/serve-file", methods=["GET"])
    def serve_file():
        file_path = request.args.get("file_path")
        if file_path and os.path.exists(file_path):
            return send_file(file_path, as_attachment=True)
        return {"error": "File not found"}, 404

    return app
