import openai
import logging
from flask import Blueprint, request, jsonify, current_app
from datetime import datetime
from pathlib import Path
import os
import requests  # Dodane do obsługi zapytań HTTP

lesson_s02e01_bp = Blueprint("lesson_s02e01_bp", __name__)


@lesson_s02e01_bp.route("/transcribe-audio-files", methods=["POST"])
def transcribe_audio_files():
    try:
        data = request.json
        audio_files_names = data.get("audioFilesNames")
        model = data.get("model", "whisper-1")  # Domyślnie ustawiony model whisper-1

        if not audio_files_names:
            return jsonify({"error": "Brak wymaganych pól"}), 400

        transcriptions = []
        sounds_folder = current_app.config["SOUNDS_FOLDER"]

        # Utworzenie instancji klienta OpenAI
        client = openai.OpenAI(api_key=current_app.config["OPENAI_API_KEY"])

        for audio_file_name in audio_files_names:
            audio_file_path = os.path.join(sounds_folder, audio_file_name)
            if not os.path.exists(audio_file_path):
                logging.error(f"Plik audio nie znaleziony: {audio_file_path}")
                continue  # Pomija brakujące pliki

            transcription_text = speech_to_text(client, audio_file_path, model)
            if transcription_text:
                transcriptions.append(transcription_text)
            else:
                logging.error(f"Nie udało się transkrybować: {audio_file_name}")

        return jsonify({"transcriptions": transcriptions}), 200

    except Exception as e:
        logging.error(f"Wyjątek w transcribe_audio_files: {e}")
        return jsonify({"error": "Błąd wewnętrzny serwera"}), 500


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
