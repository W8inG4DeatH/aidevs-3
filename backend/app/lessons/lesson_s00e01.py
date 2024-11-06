from flask import Blueprint, request, jsonify
import logging
import requests

lesson_s00e01_bp = Blueprint("lesson_s00e01_bp", __name__)


@lesson_s00e01_bp.route("/s00e01", methods=["POST"])
def process_lesson_s00e01():
    try:
        # Log the incoming request
        logging.info("Received request: %s", request.json)

        # Pobranie danych z URL
        data_url = "https://poligon.aidevs.pl/dane.txt"
        response = requests.get(data_url)
        if response.status_code != 200:
            logging.error("Error fetching data from URL: %s", response.text)
            return jsonify({"code": -1, "message": "Error fetching data from URL"}), 500

        data = response.text.strip().split("\n")
        logging.info("Data fetched: %s", data)

        # Przygotowanie payloadu do API
        api_payload = {
            "task": "POLIGON",
            "apikey": "api.keys",
            "answer": data,
        }

        # Wysłanie danych do API
        api_url = "https://poligon.aidevs.pl/verify"
        api_response = requests.post(api_url, json=api_payload)
        if api_response.status_code != 200:
            logging.error("Error sending data to API: %s", api_response.text)
            return jsonify({"code": -2, "message": "Error sending data to API"}), 500

        api_result = api_response.json()
        logging.info("API Response: %s", api_result)

        return jsonify(api_result), 200

    except Exception as e:
        logging.error("Exception occurred: %s", e)
        return jsonify({"code": -3, "message": "Internal server error"}), 500
