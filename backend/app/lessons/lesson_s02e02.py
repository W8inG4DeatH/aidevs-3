import openai
import logging
from flask import Blueprint, request, jsonify, current_app, send_from_directory
import os
import base64

lesson_s02e02_bp = Blueprint("lesson_s02e02_bp", __name__)


@lesson_s02e02_bp.route("/get-map-image", methods=["GET"])
def get_map_image():
    filename = request.args.get("filename")
    images_folder = current_app.config["IMAGES_FOLDER"]
    if filename:
        try:
            return send_from_directory(images_folder, filename)
        except Exception as e:
            logging.error(f"Error sending image file: {e}")
            return jsonify({"error": "File not found"}), 404
    else:
        return jsonify({"error": "Filename not provided"}), 400


@lesson_s02e02_bp.route("/process-image", methods=["POST"])
def process_image():
    try:
        data = request.json
        image_file_name = data.get("imageFileName")
        prompt = data.get("prompt")
        model = data.get("model")  # Retrieve model from request

        if not image_file_name or not prompt or not model:
            return jsonify({"error": "Missing required fields"}), 400

        images_folder = current_app.config["IMAGES_FOLDER"]
        image_file_path = os.path.join(images_folder, image_file_name)

        if not os.path.exists(image_file_path):
            logging.error(f"Image file not found: {image_file_path}")
            return jsonify({"error": "Image file not found"}), 404

        # Create OpenAI client instance
        client = openai.OpenAI(api_key=current_app.config["OPENAI_API_KEY"])

        # Read and encode the image in base64
        with open(image_file_path, "rb") as image_file:
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
