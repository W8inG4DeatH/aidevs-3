from flask import Blueprint, request, jsonify
import logging
import requests

lessons_s01e01_bp = Blueprint("lessons_s01e01_bp", __name__)


@lessons_s01e01_bp.route("/fetch-question", methods=["GET"])
def fetch_question():
    try:
        login_url = "https://xyz.ag3nts.org"
        login_page = requests.get(login_url)
        if login_page.status_code != 200:
            logging.error("Error fetching login page: %s", login_page.text)
            return jsonify({"error": "Error fetching login page"}), 500

        # Zwracamy całą zawartość strony do frontendu
        return jsonify({"page_content": login_page.text}), 200
    except Exception as e:
        logging.error("Exception occurred while fetching question: %s", e)
        return jsonify({"error": "Internal server error"}), 500


@lessons_s01e01_bp.route("/submit-login", methods=["POST"])
def submit_login():
    try:
        # Pobranie danych z żądania
        data = request.json
        username = data.get("username", "tester")
        password = data.get("password", "574e112a")
        answer = data.get("answer")

        login_url = "https://xyz.ag3nts.org"

        # Przygotowanie payloadu do wysłania formularza
        payload = {"username": username, "password": password, "answer": answer}

        # Wysłanie formularza jako POST do strony logowania
        response = requests.post(login_url, data=payload)

        # Logowanie odpowiedzi dla diagnostyki
        logging.info("Response from login form submission: %s", response.text)

        # Zwracamy odpowiedź serwera do frontendu
        return jsonify({"response": response.text}), response.status_code

    except Exception as e:
        logging.error("Exception occurred during form submission: %s", e)
        return jsonify({"error": "Internal server error"}), 500
