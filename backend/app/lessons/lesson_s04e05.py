import sys
import logging
import os
from flask import Blueprint, request, jsonify, current_app
import openai

sys.stdout.reconfigure(encoding="utf-8")

lesson_s04e05_bp = Blueprint("lesson_s04e05_bp", __name__)

import pdfplumber
import base64
import pytesseract
from PIL import Image
from io import BytesIO


@lesson_s04e05_bp.route("/fetch-questions", methods=["POST"])
def fetch_questions():
    try:
        data = request.get_json()
        url = data.get("url")

        if not url:
            return jsonify({"error": "No URL provided"}), 400

        import requests

        response = requests.get(url)
        if response.status_code == 200:
            questions_data = response.json()
            return jsonify(questions_data), 200
        else:
            return (
                jsonify(
                    {
                        "error": f"Failed to fetch data from {url}",
                        "status_code": response.status_code,
                    }
                ),
                400,
            )

    except Exception as e:
        logging.error(f"Exception in fetch_questions: {e}")
        return jsonify({"error": "Internal server error", "details": str(e)}), 500


@lesson_s04e05_bp.route("/get-pdf-content", methods=["POST"])
def get_pdf_content():
    try:
        data = request.get_json()
        pdf_file_name = data.get("pdfFileName")

        if not pdf_file_name:
            return jsonify({"error": "No PDF file name provided"}), 400

        # Pobranie ścieżki katalogu z konfiguracji aplikacji
        pdf_folder = current_app.config.get("MIXED_FOLDER")

        if not pdf_folder:
            return jsonify({"error": "MIXED_FOLDER is not configured"}), 500

        pdf_file_path = os.path.join(pdf_folder, pdf_file_name)

        if not os.path.exists(pdf_file_path):
            return jsonify({"error": "PDF file not found"}), 404

        # Ekstrakcja tekstu z PDF za pomocą pdfplumber
        text = ""
        with pdfplumber.open(pdf_file_path) as pdf:
            for page in pdf.pages:
                text += page.extract_text()

        return jsonify({"content": text}), 200

    except Exception as e:
        logging.error(f"Exception in get_pdf_content: {e}")
        return jsonify({"error": "Internal server error", "details": str(e)}), 500


@lesson_s04e05_bp.route("/get-pdf-images", methods=["POST"])
def get_pdf_images():
    try:
        data = request.get_json()
        pdf_file_name = data.get("pdfFileName")

        if not pdf_file_name:
            return jsonify({"error": "No PDF file name provided"}), 400

        # Pobranie ścieżki katalogu z konfiguracji aplikacji
        pdf_folder = current_app.config.get("MIXED_FOLDER")

        if not pdf_folder:
            return jsonify({"error": "MIXED_FOLDER is not configured"}), 500

        pdf_file_path = os.path.join(pdf_folder, pdf_file_name)

        if not os.path.exists(pdf_file_path):
            return jsonify({"error": "PDF file not found"}), 404

        image_data_list = []

        with pdfplumber.open(pdf_file_path) as pdf:
            for page in pdf.pages:
                if "images" in page.objects:
                    for img in page.images:
                        # Wyodrębnianie danych obrazu
                        x0, y0, x1, y1 = img["x0"], img["y0"], img["x1"], img["y1"]
                        extracted_image = page.within_bbox((x0, y0, x1, y1)).to_image()
                        image_bytes = extracted_image.stream.getvalue()
                        encoded_image = base64.b64encode(image_bytes).decode("utf-8")
                        image_data = f"data:image/png;base64,{encoded_image}"
                        image_data_list.append(image_data)

        return jsonify({"images": image_data_list}), 200

    except Exception as e:
        logging.error(f"Exception in get_pdf_images: {e}")
        return jsonify({"error": "Internal server error", "details": str(e)}), 500


@lesson_s04e05_bp.route("/process-image", methods=["POST"])
def process_image():
    try:
        data = request.json
        image_file_name = data.get("imageFileName")
        prompt = data.get("prompt")
        model = data.get("model")  # Model AI do użycia

        if not image_file_name or not prompt or not model:
            return jsonify({"error": "Missing required fields"}), 400

        images_folder = current_app.config["MIXED_FOLDER"]  # Katalog mixed
        image_file_path = os.path.join(images_folder, image_file_name)

        if not os.path.exists(image_file_path):
            logging.error(f"Image file not found: {image_file_path}")
            return jsonify({"error": "Image file not found"}), 404

        # Tworzenie instancji klienta OpenAI
        client = openai.OpenAI(api_key=current_app.config["OPENAI_API_KEY"])

        # Wczytanie i zakodowanie obrazu w Base64
        with open(image_file_path, "rb") as image_file:
            base64_image = base64.b64encode(image_file.read()).decode("utf-8")

        # Przygotowanie wiadomości z osadzonym obrazem w formacie Base64
        messages = [
            {
                "role": "user",
                "content": [
                    {"type": "text", "text": prompt},
                    {
                        "type": "image_url",
                        "image_url": {"url": f"data:image/jpeg;base64,{base64_image}"},
                    },
                ],
            }
        ]

        # Wywołanie metody completions API w OpenAI
        response = client.chat.completions.create(
            model=model,
            messages=messages,
            max_tokens=300,
        )

        # Wyodrębnienie odpowiedzi modelu
        result = response.choices[0].message.content.strip()

        return jsonify({"result": result}), 200

    except Exception as e:
        logging.error(f"Exception in process_image: {e}")
        return jsonify({"error": "Internal server error", "details": str(e)}), 500
