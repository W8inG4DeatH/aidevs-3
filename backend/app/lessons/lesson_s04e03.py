import sys
import logging
import os
from flask import Blueprint, request, jsonify, current_app

sys.stdout.reconfigure(encoding="utf-8")

lesson_s04e03_bp = Blueprint("lesson_s04e03_bp", __name__)


@lesson_s04e03_bp.route("/get-files-content", methods=["POST"])
def get_files_content():
    """
    Fetch the content of files specified in the request payload.
    """
    try:
        # Extract file names from the request
        requested_files = request.json.get("files", [])
        if not requested_files:
            return jsonify({"error": "No files specified"}), 400

        # Get the directory path
        mixed_folder = current_app.config["MIXED_FOLDER"]
        lab_data_folder = os.path.join(mixed_folder, "lab-data")
        contents = {}

        # Read the specified files
        for filename in requested_files:
            file_path = os.path.join(lab_data_folder, f"{filename}.txt")
            if os.path.exists(file_path):
                with open(file_path, "r") as f:
                    contents[filename] = f.read()
            else:
                contents[filename] = f"Error: File {filename}.txt not found"

        return jsonify(contents), 200
    except Exception as e:
        logging.error(f"Exception in get_files_content: {e}")
        return jsonify({"error": "Internal server error", "details": str(e)}), 500
