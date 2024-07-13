from flask import Blueprint, request, jsonify, current_app, send_file
import requests
import logging
from datetime import datetime
import os
from pathlib import Path

ai_agents_openai_agent_bp = Blueprint("openai_agent", __name__)
logging.basicConfig(level=logging.INFO)


@ai_agents_openai_agent_bp.route("/send-prompt", methods=["POST"])
def send_prompt():
    data = request.json
    openai_model = data.get("openAiModel")
    prompt = data.get("myAIPrompt")

    if not openai_model or not prompt:
        return jsonify({"error": "Invalid input"}), 400

    logging.info(f"Using model: {openai_model}")
    logging.info(f"Prompt: {prompt}")

    headers = {
        "Authorization": f"Bearer {current_app.config['OPENAI_API_KEY']}",
        "Content-Type": "application/json",
    }

    payload = {
        "model": openai_model,
        "messages": [
            {"role": "system", "content": "You are a helpful assistant."},
            {"role": "user", "content": prompt},
        ],
        "max_tokens": 2048,
        "temperature": 0.2,
    }

    try:
        logging.info(f"Payload: {payload}")
        response = requests.post(
            current_app.config["OPENAI_API_URL"], json=payload, headers=headers
        )
        response.raise_for_status()
        response_json = response.json()
        logging.info(f"Response: {response_json}")

        message_content = (
            response_json.get("choices", [])[0].get("message", {}).get("content", "")
        )

        if message_content:
            texts_folder = current_app.config["TEXTS_FOLDER"]
            timestamp = datetime.now().strftime("%Y-%m-%d--%H-%M-%S")
            text_file_path = Path(texts_folder) / f"{timestamp}.txt"
            os.makedirs(text_file_path.parent, exist_ok=True)

            with open(text_file_path, "w", encoding="utf-8") as text_file:
                text_file.write(message_content)

            logging.info(f"Response saved to: {text_file_path}")

        return jsonify(response_json)
    except requests.exceptions.RequestException as e:
        logging.error(f"Error communicating with OpenAI API: {e}")
        return jsonify({"error": str(e)}), 500
