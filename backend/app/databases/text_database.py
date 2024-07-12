import os
import logging
from flask import Blueprint, request, jsonify

databases_text_database_bp = Blueprint("text_library", __name__)

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


@databases_text_database_bp.route("/list", methods=["POST"])
def list_text():
    data = request.json
    directory = data.get("directory")
    if not directory:
        return jsonify({"error": "Directory not specified"}), 400

    files = list_files(directory)
    return jsonify(files)


@databases_text_database_bp.route("/update", methods=["POST"])
def update_text():
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


@databases_text_database_bp.route("/delete", methods=["POST"])
def delete_text():
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
