import sys
import requests
from flask import Blueprint, request, jsonify

sys.stdout.reconfigure(encoding="utf-8")

lesson_s03e03_bp = Blueprint("lesson_s03e03_bp", __name__)

API_URL = "https://centrala.ag3nts.org/apidb"


@lesson_s03e03_bp.route("/proxy-apidb", methods=["POST"])
def proxy_apidb():
    """
    Proxy dla API centrali.
    """
    try:
        payload = request.json
        headers = {"Content-Type": "application/json"}

        print("Payload wysłany do centrali:", payload)  # Log payload
        response = requests.post(API_URL, json=payload, headers=headers)

        print(
            "Odpowiedź z centrali:", response.status_code, response.text
        )  # Log pełnej odpowiedzi

        response.raise_for_status()
        return jsonify(response.json()), response.status_code
    except requests.RequestException as e:
        print("Błąd podczas komunikacji z API:", str(e))
        return (
            jsonify({"error": "Error communicating with the API", "details": str(e)}),
            500,
        )
