import sys
import requests
from flask import Blueprint, request, jsonify

sys.stdout.reconfigure(encoding="utf-8")

lesson_s04e01_bp = Blueprint("lesson_s04e01_bp", __name__)


@lesson_s04e01_bp.route("/get-barbara-data", methods=["GET"])
def get_barbara_data():
    """
    Pobiera dane z pliku barbara.txt
    """
    try:
        url = "https://centrala.ag3nts.org/dane/barbara.txt"
        response = requests.get(url)

        response.raise_for_status()
        data = response.text

        return jsonify({"data": data}), 200
    except requests.RequestException as e:
        print("Błąd podczas pobierania pliku barbara.txt:", str(e))
        return (
            jsonify({"error": "Error fetching barbara.txt", "details": str(e)}),
            500,
        )


@lesson_s04e01_bp.route("/check-place", methods=["POST"])
def check_place():
    """
    Proxy dla API /places, sprawdza obecność Barbary w danym mieście.
    """
    try:
        payload = request.json
        headers = {"Content-Type": "application/json"}

        # Wysyłanie zapytania do zewnętrznego API
        url = "https://centrala.ag3nts.org/places"
        response = requests.post(url, json=payload, headers=headers)

        print(f"Zapytanie do {url} z payload: {payload}")  # Debug
        print(f"Odpowiedź: {response.status_code} - {response.text}")  # Debug

        response.raise_for_status()
        return jsonify(response.json()), response.status_code
    except requests.RequestException as e:
        print("Błąd podczas komunikacji z API /places:", str(e))
        return (
            jsonify(
                {"error": "Error communicating with /places API", "details": str(e)}
            ),
            500,
        )


@lesson_s04e01_bp.route("/check-person", methods=["POST"])
def check_person():
    """
    Proxy for API /people, checks the presence of a person.
    """
    try:
        payload = request.json
        headers = {"Content-Type": "application/json"}

        # Send request to external API
        url = "https://centrala.ag3nts.org/people"
        response = requests.post(url, json=payload, headers=headers)

        print(f"Request to {url} with payload: {payload}")  # Debug
        print(f"Response: {response.status_code} - {response.text}")  # Debug

        response.raise_for_status()
        return jsonify(response.json()), response.status_code
    except requests.RequestException as e:
        print("Error communicating with API /people:", str(e))
        return (
            jsonify(
                {"error": "Error communicating with /people API", "details": str(e)}
            ),
            500,
        )
