import logging
import requests
import openai
from flask import Blueprint, request, jsonify, current_app
from datetime import datetime

lesson_s02e03_bp = Blueprint("lesson_s02e03_bp", __name__)


# Endpoint do pobrania JSON-a z zewnętrznego serwera
@lesson_s02e03_bp.route("/fetch-remote-json", methods=["POST"])
def fetch_remote_json():
    data = request.json
    api_key = data.get("apiKey")
    if not api_key:
        return jsonify({"error": "apiKey jest wymagany"}), 400

    url = f"https://centrala.ag3nts.org/data/{api_key}/robotid.json"

    try:
        response = requests.get(url)
        response.raise_for_status()
        return jsonify(response.json()), response.status_code
    except requests.RequestException as e:
        logging.error(f"Błąd podczas pobierania danych z zewnętrznego serwera: {e}")
        return (
            jsonify({"error": "Nie udało się pobrać danych z zewnętrznego serwera"}),
            500,
        )


# Funkcja do generowania obrazu z tekstu przy użyciu OpenAI API, zwracająca URL do obrazka
def text_to_image(myText: str, model: str, size: str, quality: str) -> str:
    logging.info(f"Text to image: {myText, model, size, quality}")
    try:
        api_key = current_app.config["OPENAI_API_KEY"]
        client = openai.OpenAI(api_key=api_key)

        response = client.images.generate(
            model=model, prompt=myText, size=size, quality=quality, n=1
        )

        # Zwracamy URL wygenerowanego obrazka
        image_url = response.data[0].url
        logging.info(f"Generated image URL: {image_url}")
        return image_url
    except Exception as e:
        logging.error(f"Error in text_to_image: {e}")
        return ""


# Endpoint do konwersji tekstu na obraz z użyciem OpenAI API, zwracający URL
@lesson_s02e03_bp.route("/openai-text-to-image", methods=["POST"])
def convert_text_to_image():
    data = request.json
    myText = data.get("text")
    model = data.get("model")
    size = data.get("size")
    quality = data.get("quality")

    if not myText:
        return jsonify({"error": "Invalid input"}), 400

    try:
        image_url = text_to_image(myText, model, size, quality)
        if image_url:
            return jsonify({"imageUrl": image_url}), 200
        else:
            return jsonify({"error": "Conversion failed"}), 500
    except Exception as e:
        logging.error(f"Error in convert_text_to_image endpoint: {e}")
        return jsonify({"error": "Internal server error"}), 500
