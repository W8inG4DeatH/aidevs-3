import logging
import os
import requests
import openai
from flask import Blueprint, request, jsonify, current_app
from bs4 import BeautifulSoup
import base64

lesson_s02e05_bp = Blueprint("lesson_s02e05_bp", __name__)

@lesson_s02e05_bp.route("/fetch-arxiv-draft", methods=["GET"])
def fetch_arxiv_draft():
    try:
        url = "https://centrala.ag3nts.org/dane/arxiv-draft.html"
        response = requests.get(url)
        response.raise_for_status()
        html_content = response.text

        # Parse the HTML content
        soup = BeautifulSoup(html_content, "html.parser")

        # Extract and replace <img> tags with placeholders
        images = soup.find_all("img")
        image_urls = []
        for i, img in enumerate(images):
            if "src" in img.attrs:
                img_url = img["src"]
                # Resolve relative URLs
                base_url = "https://centrala.ag3nts.org/dane/"
                img_url = base_url + img_url if not img_url.startswith("http") else img_url
                image_urls.append(img_url)
                # Replace <img> tag with placeholder
                img.replace_with(f"[Image: {img_url}]")

        # Extract and replace <audio> tags with placeholders
        audios = soup.find_all("audio")
        audio_urls = []
        for i, audio in enumerate(audios):
            sources = audio.find_all("source")
            for source in sources:
                if "src" in source.attrs:
                    audio_url = source["src"]
                    # Resolve relative URLs
                    base_url = "https://centrala.ag3nts.org/dane/"
                    audio_url = base_url + audio_url if not audio_url.startswith("http") else audio_url
                    audio_urls.append(audio_url)
                    # Replace <audio> tag with placeholder
                    audio.replace_with(f"[Audio: {audio_url}]")

        # Extract the modified text content
        text_content = soup.get_text(separator="\n")

        return (
            jsonify(
                {
                    "text_content": text_content,
                    "image_urls": image_urls,
                    "audio_urls": audio_urls,
                }
            ),
            200,
        )
    except Exception as e:
        logging.error(f"Error in fetch_arxiv_draft: {e}")
        return jsonify({"error": "Internal server error"}), 500

# Endpoint to fetch questions from the external API
@lesson_s02e05_bp.route("/fetch-questions", methods=["GET"])
def fetch_questions():
    try:
        # Construct the URL using the API key
        api_key = request.args.get("apiKey")
        if not api_key:
            return jsonify({"error": "API key is required"}), 400

        questions_url = f"https://centrala.ag3nts.org/data/{api_key}/arxiv.txt"

        # Send GET request to the external API
        response = requests.get(questions_url)
        response.raise_for_status()

        # Return the content as plain text
        return jsonify({"questions": response.text}), 200
    except requests.exceptions.RequestException as e:
        logging.error(f"Error fetching questions: {e}")
        return jsonify({"error": "Failed to fetch questions"}), 500
    except Exception as e:
        logging.error(f"Unexpected error in fetch_questions: {e}")
        return jsonify({"error": "Internal server error"}), 500


# Endpoint to process an image URL
@lesson_s02e05_bp.route("/process-image-url", methods=["POST"])
def process_image_url():
    try:
        data = request.json
        image_url = data.get("imageUrl")
        prompt = data.get("prompt")
        model = data.get("model")

        if not image_url or not prompt or not model:
            return jsonify({"error": "imageUrl, prompt, and model are required"}), 400

        # Download the image
        response = requests.get(image_url)
        response.raise_for_status()
        image_content = response.content

        # Encode the image in base64
        base64_image = base64.b64encode(image_content).decode("utf-8")

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

        # Call the OpenAI chat completions method
        client = openai.OpenAI(api_key=current_app.config["OPENAI_API_KEY"])
        response = client.chat.completions.create(
            model=model,
            messages=messages,
            max_tokens=300,
        )

        # Extract the assistant's reply
        result = response.choices[0].message.content.strip()

        return jsonify({"result": result}), 200

    except Exception as e:
        logging.error(f"Exception in process_image_url: {e}")
        return jsonify({"error": "Internal server error"}), 500


# Endpoint to transcribe an audio URL
@lesson_s02e05_bp.route("/transcribe-audio-url", methods=["POST"])
def transcribe_audio_url():
    data = request.json
    audio_url = data.get("audioUrl")
    model = data.get("model", "whisper-1")  # Default model

    if not audio_url:
        return jsonify({"error": "audioUrl is required"}), 400

    try:
        # Download the audio file
        response = requests.get(audio_url)
        response.raise_for_status()
        audio_content = response.content

        # Save the audio content to a temporary file
        temp_audio_file = "temp_audio.mp3"
        with open(temp_audio_file, "wb") as f:
            f.write(audio_content)

        # Transcribe the audio file
        client = openai.OpenAI(api_key=current_app.config["OPENAI_API_KEY"])
        with open(temp_audio_file, "rb") as audio_file:
            transcription = client.audio.transcriptions.create(
                model=model, file=audio_file, response_format="text"
            )

        # Clean up temporary file
        os.remove(temp_audio_file)

        transcript_text = transcription.strip()

        if not transcript_text:
            raise ValueError("No transcription text from audio")

        return jsonify({"transcription": transcript_text}), 200

    except Exception as e:
        logging.error(f"Error in transcribe_audio_url: {e}")
        return jsonify({"error": "Internal server error"}), 500
