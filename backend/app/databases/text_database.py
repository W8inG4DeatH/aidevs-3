import os
import logging
from flask import Blueprint, request, jsonify, make_response
from flask_cors import CORS

databases_text_database_bp = Blueprint("databases_text_database_bp", __name__)
CORS(
    databases_text_database_bp,
    origins=["http://localhost:4200", "http://127.0.0.1:4200"],
)

# Login config
logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s"
)


def list_files(directory):
    try:
        files = []
        for filename in os.listdir(directory):
            if filename.endswith(".txt"):
                path = os.path.join(directory, filename)
                with open(path, "r", encoding="utf-8") as file:
                    content = file.read()
                update_time = os.path.getmtime(path)
                files.append(
                    {
                        "Name": filename,
                        "FullPath": path.replace("\\", "/"),
                        "Content": content,
                        "UpdateTime": update_time,
                        "Selected": False,
                        "Processed": False,
                        "Done": False,
                    }
                )
        return files
    except Exception as e:
        logging.error(f"Error listing files: {e}")
        return []


@databases_text_database_bp.route("/list", methods=["POST", "OPTIONS"])
def list_text():
    if request.method == "OPTIONS":
        response = make_response()
        response.headers["Access-Control-Allow-Origin"] = "*"
        response.headers["Access-Control-Allow-Methods"] = "POST, OPTIONS"
        response.headers["Access-Control-Allow-Headers"] = "Content-Type"
        return response

    data = request.json
    directory = data.get("directory")
    if not directory:
        return jsonify({"error": "Directory not specified"}), 400

    files = list_files(directory)
    return jsonify(files)


@databases_text_database_bp.route("/update", methods=["POST", "OPTIONS"])
def update_text():
    if request.method == "OPTIONS":
        response = make_response()
        response.headers["Access-Control-Allow-Origin"] = "*"
        response.headers["Access-Control-Allow-Methods"] = "POST, OPTIONS"
        response.headers["Access-Control-Allow-Headers"] = "Content-Type"
        return response

    data = request.json
    filename = data.get("Name")
    content = data.get("Content")
    directory = data.get("directory")
    if not filename or content is None or not directory:
        return jsonify({"error": "Invalid data"}), 400

    try:
        path = os.path.join(directory, filename)
        with open(path, "w", encoding="utf-8") as file:
            file.write(content)
        return jsonify({"message": "File updated successfully"}), 200
    except Exception as e:
        logging.error(f"Error updating file: {e}")
        return jsonify({"error": "Could not update file"}), 500


@databases_text_database_bp.route("/delete", methods=["POST", "OPTIONS"])
def delete_text():
    if request.method == "OPTIONS":
        response = make_response()
        response.headers["Access-Control-Allow-Origin"] = "*"
        response.headers["Access-Control-Allow-Methods"] = "POST, OPTIONS"
        response.headers["Access-Control-Allow-Headers"] = "Content-Type"
        return response

    data = request.json
    filename = data.get("Name")
    directory = data.get("directory")
    if not filename or not directory:
        return jsonify({"error": "Invalid data"}), 400

    try:
        path = os.path.join(directory, filename)
        if os.path.exists(path):
            os.remove(path)
            return jsonify({"message": "File deleted successfully"}), 200
        else:
            return jsonify({"error": "File not found"}), 404
    except Exception as e:
        logging.error(f"Error deleting file: {e}")
        return jsonify({"error": "Could not delete file"}), 500
