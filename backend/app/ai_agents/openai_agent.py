from flask import Blueprint, request, jsonify, current_app
import requests
import logging
from datetime import datetime
import os
from pathlib import Path
from openai import RateLimitError
import backoff

ai_agents_openai_agent_bp = Blueprint("openai_agent", __name__)
logging.basicConfig(level=logging.INFO)


@backoff.on_exception(backoff.expo, RateLimitError)
def completions_with_backoff(payload, headers):
    response = requests.post(
        current_app.config["OPENAI_API_URL"], json=payload, headers=headers
    )
    response.raise_for_status()
    return response.json()


def continuous_completion_with_backoff(initial_payload, headers):
    messages = initial_payload["messages"]
    model = initial_payload["model"]
    max_tokens = initial_payload.get("max_tokens", 1024)
    temperature = initial_payload.get("temperature", 0.2)
    full_response = ""
    is_completed = False

    while not is_completed:
        current_payload = {
            "model": model,
            "messages": messages,
            "max_tokens": max_tokens,
            "temperature": temperature,
        }
        logging.info(f"Payload: {current_payload}")
        try:
            response_json = completions_with_backoff(current_payload, headers)
            logging.info(f"Response: {response_json}")
            choice = response_json.get("choices", [])[0]
            message_content = choice.get("message", {}).get("content", "")
            finish_reason = choice.get("finish_reason", "")
            full_response += message_content

            if finish_reason != "length":
                is_completed = True
            else:
                logging.info("Continuing completion...")
                messages.append({"role": "assistant", "content": message_content})
                messages.append(
                    {
                        "role": "user",
                        "content": "[system: Please continue your response to the user's question and finish when you're done from the very next character you were about to write, because you didn't finish your response last time. At the end, your response will be concatenated with the last completion.]",
                    }
                )

        except requests.exceptions.RequestException as e:
            logging.error(f"Error communicating with OpenAI API: {e}")
            raise

    return full_response


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

    initial_messages = [
        {"role": "system", "content": "You are a helpful assistant."},
        {"role": "user", "content": prompt},
    ]

    payload = {
        "model": openai_model,
        "messages": initial_messages,
        "max_tokens": 1024,
        "temperature": 0.2,
    }

    try:
        logging.info(f"Payload: {payload}")
        full_response = continuous_completion_with_backoff(payload, headers)
        logging.info(f"Full response: {full_response}")

        # Construct response_json to mimic OpenAI API response
        response_json = {"choices": [{"message": {"content": full_response}}]}
        message_content = full_response

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
