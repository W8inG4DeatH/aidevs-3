import logging
import os
import requests
import openai
from flask import Blueprint, request, jsonify, current_app
from datetime import datetime
import base64
from pathlib import Path

lesson_s02e04_bp = Blueprint("lesson_s02e04_bp", __name__)


# Endpoint to get the list of files in MIXED_FOLDER
@lesson_s02e04_bp.route("/get-mixed-files", methods=["GET"])
def get_mixed_files():
    try:
        mixed_folder = current_app.config["MIXED_FOLDER"]
        files = [
            f
            for f in os.listdir(mixed_folder)
            if os.path.isfile(os.path.join(mixed_folder, f))
        ]
        return jsonify({"files": files}), 200
    except Exception as e:
        logging.error(f"Error in get_mixed_files: {e}")
        return jsonify({"error": "Internal server error"}), 500


@lesson_s02e04_bp.route("/get-text-file-content", methods=["POST"])
def get_text_file_content():
    data = request.json
    file_name = data.get("fileName")
    if not file_name:
        return jsonify({"error": "fileName is required"}), 400
    try:
        mixed_folder = current_app.config["MIXED_FOLDER"]
        file_path = os.path.join(mixed_folder, file_name)
        if not os.path.exists(file_path):
            return jsonify({"error": "File not found"}), 404

        # Read the content of the file
        with open(file_path, "r", encoding="utf-8") as f:
            content = f.read()

        # Return the file content
        return jsonify({"content": content}), 200

    except Exception as e:
        logging.error(f"Error in get_text_file_content: {e}")
        return jsonify({"error": "Internal server error"}), 500


# Endpoint to get the content of a text file
@lesson_s02e04_bp.route("/classify-text", methods=["POST"])
def classify_text():
    data = request.json
    prompt = data.get("myAIPrompt")
    if not prompt:
        return jsonify({"error": "myAIPrompt is required"}), 400

    try:
        # Ustawienie klucza API do OpenAI
        api_key = current_app.config["OPENAI_API_KEY"]
        openai.api_key = api_key

        # Wywołanie modelu OpenAI z przekazanym promptem
        response = openai.ChatCompletion.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=1024,
            temperature=0.2,
        )

        # Wyodrębnienie contentu z odpowiedzi modelu
        category_response = response.choices[0].message.content

        # Zwróć pełny content jako odpowiedź do frontendu
        return jsonify({"content": category_response}), 200

    except Exception as e:
        logging.error(f"Error in classify_text: {e}")
        return jsonify({"error": "Internal server error"}), 500


# Endpoint to transcribe an audio file
@lesson_s02e04_bp.route("/transcribe-audio-file", methods=["POST"])
def transcribe_audio_file():
    data = request.json
    file_name = data.get("audioFileName")
    model = data.get("model", "whisper-1")  # Domyślnie ustawiony model whisper-1

    if not file_name:
        return jsonify({"error": "audioFileName is required"}), 400

    try:
        mixed_folder = current_app.config["MIXED_FOLDER"]
        file_path = os.path.join(mixed_folder, file_name)
        if not os.path.exists(file_path):
            return jsonify({"error": "File not found"}), 404

        # Utworzenie instancji klienta OpenAI
        client = openai.OpenAI(api_key=current_app.config["OPENAI_API_KEY"])

        # Transkrypcja pliku audio za pomocą funkcji `speech_to_text`
        transcription_text = speech_to_text(client, file_path, model)

        if transcription_text:
            return jsonify({"transcription": transcription_text}), 200
        else:
            logging.error(f"Failed to transcribe: {file_name}")
            return jsonify({"error": "Transcription failed"}), 500

    except Exception as e:
        logging.error(f"Error in transcribe_audio_file: {e}")
        return jsonify({"error": "Internal server error"}), 500


def speech_to_text(client, audio_file_path: str, model: str) -> str:
    try:
        with open(audio_file_path, "rb") as audio_file:
            # Użycie metody transkrypcji
            transcription = client.audio.transcriptions.create(
                model=model, file=audio_file, response_format="text"
            )

        # Zakładając, że odpowiedź jest ciągiem tekstowym
        transcript_text = transcription.strip()

        if not transcript_text:
            raise ValueError("Brak transkrybowanego tekstu z audio")

        # Opcjonalnie zapisanie transkrypcji z sygnaturą czasową
        timestamp = datetime.now().strftime("%Y-%m-%d--%H-%M-%S")
        text_file_path = Path(current_app.config["TEXTS_FOLDER"]) / f"{timestamp}.txt"
        os.makedirs(text_file_path.parent, exist_ok=True)

        with open(text_file_path, "w", encoding="utf-8") as text_file:
            text_file.write(transcript_text)

        logging.info(f"Transkrypcja zapisana do: {text_file_path}")
        return transcript_text
    except Exception as e:
        logging.error(f"Błąd w speech_to_text: {e}")
        return ""


# Endpoint to process an image file
@lesson_s02e04_bp.route("/process-image", methods=["POST"])
def process_image():
    try:
        data = request.json
        file_name = data.get("imageFileName")
        prompt = data.get("prompt")
        model = data.get("model")  # Retrieve model from request

        if not file_name or not prompt or not model:
            return (
                jsonify({"error": "imageFileName, prompt, and model are required"}),
                400,
            )

        mixed_folder = current_app.config["MIXED_FOLDER"]
        file_path = os.path.join(mixed_folder, file_name)

        if not os.path.exists(file_path):
            logging.error(f"Image file not found: {file_path}")
            return jsonify({"error": "File not found"}), 404

        # Create OpenAI client instance
        client = openai.OpenAI(api_key=current_app.config["OPENAI_API_KEY"])

        # Read and encode the image in base64
        with open(file_path, "rb") as image_file:
            base64_image = base64.b64encode(image_file.read()).decode("utf-8")

        # Prepare messages for OpenAI API with embedded image in base64 format
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
                        "image_url": {"url": f"data:image/jpeg;base64,{base64_image}"},
                    },
                ],
            }
        ]

        # Call the OpenAI chat completions method using the new client instance
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
        return jsonify({"error": "Internal server error"}), 500
