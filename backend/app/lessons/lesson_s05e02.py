import sys
import requests
from flask import Blueprint, request, jsonify

sys.stdout.reconfigure(encoding="utf-8")

lesson_s05e02_bp = Blueprint("lesson_s05e02_bp", __name__)


@lesson_s05e02_bp.route("/get-questions", methods=["POST"])
def get_questions():
    """
    Fetches questions from a given URL.
    """
    try:
        data = request.json
        url = data.get("url")
        if not url:
            return jsonify({"error": "No URL provided"}), 400

        response = requests.get(url)
        response.raise_for_status()
        questions = response.json()  # Assuming the response is JSON

        return jsonify({"data": questions}), 200
    except requests.RequestException as e:
        print("Error fetching questions:", str(e))
        return (
            jsonify({"error": "Error fetching questions", "details": str(e)}),
            500,
        )
