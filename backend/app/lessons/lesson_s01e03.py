from flask import Blueprint, request, jsonify, current_app
import logging
import requests
import json

lesson_s01e03_bp = Blueprint("lesson_s01e03_bp", __name__)

report_url = "https://centrala.ag3nts.org/report"


@lesson_s01e03_bp.route("/download-proxy-file", methods=["GET"])
def download_proxy_file():
    try:
        # Fetch the file from the external URL
        external_file_url = "https://centrala.ag3nts.org/data/5e03d528-a239-488a-83f8-13e443c02c85/json.txt"
        response = requests.get(external_file_url)

        # Check if the response from the external server is successful
        if response.status_code != 200:
            logging.error("Error downloading file from external URL: %s", response.text)
            return (
                jsonify({"error": "Failed to fetch file from external source"}),
                response.status_code,
            )

        # Return the content of the external file to the frontend
        return jsonify(response.json()), 200

    except Exception as e:
        logging.error("Exception in download_proxy_file: %s", e)
        return jsonify({"error": "Internal server error"}), 500


@lesson_s01e03_bp.route("/submit-corrected-file", methods=["POST"])
def submit_corrected_file():
    try:
        data = request.json
        corrected_file = data.get("correctedFile")
        api_key = data.get("apiKey")
        task_identifier = data.get("taskIdentifier")

        if not corrected_file or not api_key or not task_identifier:
            return jsonify({"error": "Missing required fields"}), 400

        # Parse corrected file to get "test-data" and send it as "answer"
        corrected_data = json.loads(corrected_file)

        # Prepare the payload with the extracted test data
        payload = {
            "task": task_identifier,
            "apikey": api_key,
            "answer": corrected_data
        }

        # Log payload details before sending
        logging.info("Payload being sent: %s", json.dumps(payload, indent=2))

        response = requests.post(report_url, json=payload)

        if response.status_code != 200:
            logging.error("Error submitting corrected file: %s", response.text)
            return (
                jsonify({"error": "Error submitting corrected file"}),
                response.status_code,
            )

        logging.info("Corrected file submitted successfully.")

        return (
            jsonify(
                {
                    "message": "Corrected file submitted successfully.",
                    "response": response.json(),
                }
            ),
            200,
        )

    except Exception as e:
        logging.error("Exception in submit_corrected_file: %s", e)
        return jsonify({"error": "Internal server error"}), 500
