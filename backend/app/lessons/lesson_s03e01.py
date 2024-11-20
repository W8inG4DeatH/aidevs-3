import logging
import os
from flask import Blueprint, request, jsonify, current_app

lesson_s03e01_bp = Blueprint("lesson_s03e01_bp", __name__)


@lesson_s03e01_bp.route("/get-mixed-files", methods=["GET"])
def get_mixed_files():
    try:
        # Pobranie opcjonalnego parametru 'subfolder' z zapytania
        subfolder = request.args.get("subfolder", "").strip()

        # Bazowy folder
        mixed_folder = current_app.config["MIXED_FOLDER"]

        # Utworzenie ścieżki do podkatalogu (jeśli podany)
        target_folder = (
            os.path.join(mixed_folder, subfolder) if subfolder else mixed_folder
        )

        # Sprawdzenie, czy folder istnieje
        if not os.path.exists(target_folder) or not os.path.isdir(target_folder):
            return jsonify({"error": f"Folder '{target_folder}' does not exist"}), 404

        # Pobranie plików z docelowego folderu
        files = [
            f
            for f in os.listdir(target_folder)
            if os.path.isfile(os.path.join(target_folder, f))
        ]
        return jsonify({"files": files}), 200

    except Exception as e:
        logging.error(f"Error in get_mixed_files: {e}")
        return jsonify({"error": "Internal server error"}), 500


@lesson_s03e01_bp.route("/get-text-file-content", methods=["POST"])
def get_text_file_content():
    data = request.json
    file_name = data.get("fileName")
    subfolder = request.args.get(
        "subfolder", ""
    ).strip()  # Pobranie parametru subfolder (jeśli istnieje)

    if not file_name:
        return jsonify({"error": "fileName is required"}), 400

    try:
        mixed_folder = current_app.config["MIXED_FOLDER"]

        # Jeśli podano subfolder, dołącz go do ścieżki bazowej
        target_folder = (
            os.path.join(mixed_folder, subfolder) if subfolder else mixed_folder
        )
        file_path = os.path.join(target_folder, file_name)

        # Sprawdzenie, czy plik istnieje
        if not os.path.exists(file_path):
            return jsonify({"error": "File not found"}), 404

        # Odczyt zawartości pliku
        with open(file_path, "r", encoding="utf-8") as f:
            content = f.read()

        return jsonify({"content": content}), 200

    except Exception as e:
        logging.error(f"Error in get_text_file_content: {e}")
        return jsonify({"error": "Internal server error"}), 500


@lesson_s03e01_bp.route("/save-text-file-content", methods=["POST"])
def save_text_file_content():
    data = request.json
    file_name = data.get("fileName")
    content = data.get("content")
    if not file_name or content is None:
        return jsonify({"error": "fileName and content are required"}), 400
    try:
        mixed_folder = current_app.config["MIXED_FOLDER"]
        file_path = os.path.join(mixed_folder, file_name)
        with open(file_path, "w", encoding="utf-8") as f:
            f.write(content)
        return jsonify({"message": "File saved successfully"}), 200
    except Exception as e:
        logging.error(f"Error in save_text_file_content: {e}")
        return jsonify({"error": "Internal server error"}), 500
