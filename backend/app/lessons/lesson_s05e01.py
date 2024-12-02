import sys
import logging
import os
from flask import Blueprint, request, jsonify, current_app

sys.stdout.reconfigure(encoding="utf-8")

lesson_s05e01_bp = Blueprint("lesson_s05e01_bp", __name__)


@lesson_s05e01_bp.route("/fetch-json", methods=["POST"])
def fetch_json():
    try:
        data = request.get_json()
        url = data.get("url")

        if not url:
            return jsonify({"error": "No URL provided"}), 400

        # Fetch data from the given URL
        import requests

        response = requests.get(url)
        if response.status_code == 200:
            json_data = response.json()
            return jsonify(json_data), 200
        else:
            return (
                jsonify(
                    {
                        "error": f"Failed to fetch data from {url}",
                        "status_code": response.status_code,
                    }
                ),
                400,
            )

    except Exception as e:
        logging.error(f"Exception in fetch_json: {e}")
        return jsonify({"error": "Internal server error", "details": str(e)}), 500


@lesson_s05e01_bp.route("/read-facts", methods=["GET"])
def read_facts():
    try:
        base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../.."))
        mixed_folder = os.path.join(base_dir, "files", "mixed")
        files = os.listdir(mixed_folder)
        facts = ""

        for file_name in files:
            if (
                file_name.startswith("f")
                and file_name[1:3].isdigit()
                and file_name.endswith(".txt")
            ):
                file_path = os.path.join(mixed_folder, file_name)
                with open(file_path, "r", encoding="utf-8") as f:
                    facts += f.read() + "\n"

        return jsonify({"facts": facts}), 200

    except Exception as e:
        logging.error(f"Exception in read_facts: {e}")
        return jsonify({"error": "Internal server error", "details": str(e)}), 500
