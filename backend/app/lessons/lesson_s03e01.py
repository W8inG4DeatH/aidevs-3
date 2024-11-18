import logging
import os
import requests
from flask import Blueprint, request, jsonify, current_app

lesson_s03e01_bp = Blueprint("lesson_s03e01_bp", __name__)


# Endpoint to get the list of files in MIXED_FOLDER
@lesson_s03e01_bp.route("/get-mixed-files", methods=["GET"])
def get_mixed_files():
    try:
        mixed_folder = current_app.config["MIXED_FOLDER"]
        files = [
            f
            for f in os.listdir(mixed_folder)
            if os.path.isfile(os.path.join(mixed_folder, f))
        ]
        return jsonify({"files": files}), 200
    except Exception as e:
        logging.error(f"Error in get_mixed_files: {e}")
        return jsonify({"error": "Internal server error"}), 500


# Endpoint to get the content of a text file
@lesson_s03e01_bp.route("/get-text-file-content", methods=["POST"])
def get_text_file_content():
    data = request.json
    file_name = data.get("fileName")
    if not file_name:
        return jsonify({"error": "fileName is required"}), 400
    try:
        mixed_folder = current_app.config["MIXED_FOLDER"]
        file_path = os.path.join(mixed_folder, file_name)
        if not os.path.exists(file_path):
            return jsonify({"error": "File not found"}), 404

        # Read the content of the file
        with open(file_path, "r", encoding="utf-8") as f:
            content = f.read()

        # Return the file content
        return jsonify({"content": content}), 200

    except Exception as e:
        logging.error(f"Error in get_text_file_content: {e}")
        return jsonify({"error": "Internal server error"}), 500

