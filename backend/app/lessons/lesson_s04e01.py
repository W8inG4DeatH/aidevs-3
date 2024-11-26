import sys
import logging
import os
import requests
import openai
from flask import Blueprint, request, jsonify, current_app
from datetime import datetime
import base64
from pathlib import Path

sys.stdout.reconfigure(encoding="utf-8")

lesson_s04e01_bp = Blueprint("lesson_s04e01_bp", __name__)


@lesson_s04e01_bp.route("/start-conversation", methods=["POST"])
def start_conversation():
    """
    Initiate conversation with the automaton by sending 'START' and get the photos.
    """
    try:
        payload = request.json
        headers = {"Content-Type": "application/json"}

        # Send request to Central
        url = "https://centrala.ag3nts.org/report"
        response = requests.post(url, json=payload, headers=headers)
        print(f"Request to {url} with payload: {payload}")  # Debug
        print(f"Response: {response.status_code} - {response.text}")  # Debug

        response.raise_for_status()
        data = response.json()

        # Assuming the response contains image URLs in 'images' key
        return jsonify(data), response.status_code
    except requests.RequestException as e:
        print("Error communicating with Central:", str(e))
        return (
            jsonify({"error": "Error communicating with Central", "details": str(e)}),
            500,
        )


@lesson_s04e01_bp.route("/send-command", methods=["POST"])
def send_command():
    """
    Send a command to the automaton and get the response.
    """
    try:
        payload = request.json
        headers = {"Content-Type": "application/json"}

        # Send request to Central
        url = "https://centrala.ag3nts.org/report"
        response = requests.post(url, json=payload, headers=headers)
        print(f"Request to {url} with payload: {payload}")  # Debug
        print(f"Response: {response.status_code} - {response.text}")  # Debug

        response.raise_for_status()
        data = response.json()

        # Return the response data to the frontend
        return jsonify(data), response.status_code
    except requests.RequestException as e:
        print("Error communicating with Central:", str(e))
        return (
            jsonify({"error": "Error communicating with Central", "details": str(e)}),
            500,
        )

# Endpoint to process an image file
@lesson_s04e01_bp.route("/process-image", methods=["POST"])
def process_image():
    """
    Process the image using OpenAI API and return the analysis result.
    """
    try:
        data = request.json
        file_name = data.get("imageFileName")
        prompt = data.get("prompt")
        model = data.get("model")  # Retrieve model from request
        base_url = data.get("baseUrl")  # Retrieve baseUrl from request

        if not file_name or not prompt or not model or not base_url:
            return (
                jsonify(
                    {"error": "imageFileName, prompt, model, and baseUrl are required"}
                ),
                400,
            )

        # Construct the full URL of the image
        image_url = f"{base_url}{file_name}"

        # Log the constructed URL for debugging
        logging.info(f"Image URL constructed: {image_url}")

        # Prepare messages for OpenAI API with embedded image URL
        messages = [
            {
                "role": "user",
                "content": [
                    {
                        "type": "text",
                        "text": prompt,
                    },
                    {
                        "type": "image_url",
                        "image_url": {"url": image_url},
                    },
                ],
            }
        ]

        # Create OpenAI client instance
        client = openai.OpenAI(api_key=current_app.config["OPENAI_API_KEY"])

        # Call the OpenAI chat completions method
        response = client.chat.completions.create(
            model=model,
            messages=messages,
            max_tokens=300,
        )

        # Extract the assistant's reply
        result = response.choices[0].message.content.strip()

        return jsonify({"result": result}), 200

    except Exception as e:
        logging.error(f"Exception in process_image: {e}")
        return jsonify({"error": "Internal server error", "details": str(e)}), 500

