from flask import Blueprint, request, jsonify
import logging
import requests

lesson_s01e03_bp = Blueprint("lesson_s01e03_bp", __name__)

robot_api_url = "https://xyz.ag3nts.org/verify"


@lesson_s01e03_bp.route("/start-verification", methods=["POST"])
def start_verification():
    try:
        # Wysłanie komendy "READY" do API robota
        payload = {"text": "READY", "msgID": "0"}
        response = requests.post(robot_api_url, json=payload)

        if response.status_code != 200:
            logging.error("Error starting verification: %s", response.text)
            return (
                jsonify({"error": "Error starting verification"}),
                response.status_code,
            )

        return jsonify(response.json()), 200

    except Exception as e:
        logging.error("Exception in start_verification: %s", e)
        return jsonify({"error": "Internal server error"}), 500


@lesson_s01e03_bp.route("/submit-answer", methods=["POST"])
def submit_answer():
    try:
        # Pobieramy dane z żądania
        data = request.json
        answer_text = data.get("text")
        msgID = data.get("msgID")

        # Logujemy dane wejściowe od frontendu
        logging.info(
            "Received data from frontend: text=%s, msgID=%s", answer_text, msgID
        )

        # Wysyłamy odpowiedź do API robota z zachowaniem msgID
        payload = {"text": answer_text, "msgID": msgID}
        logging.info("Sending payload to robot API: %s", payload)
        response = requests.post(robot_api_url, json=payload)

        # Logujemy odpowiedź otrzymaną od robota
        logging.info(
            "Response from robot API: status_code=%s, response_text=%s",
            response.status_code,
            response.text,
        )

        # Jeśli odpowiedź robota wskazuje na błąd, logujemy i zwracamy odpowiedź
        if response.status_code != 200:
            logging.error("Error submitting answer: %s", response.text)
            return jsonify({"error": "Error submitting answer"}), response.status_code

        # Zwracamy odpowiedź robota do frontendu
        response_data = response.json()
        logging.info("Returning response to frontend: %s", response_data)
        return jsonify(response_data), 200

    except Exception as e:
        logging.error("Exception in submit_answer: %s", e)
        return jsonify({"error": "Internal server error"}), 500
