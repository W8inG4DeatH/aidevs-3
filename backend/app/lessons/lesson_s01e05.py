from flask import Blueprint, request, jsonify
import logging
import requests

lesson_s01e05_bp = Blueprint("lesson_s01e05_bp", __name__)

# URL do wysyłania raportu
report_url = "https://centrala.ag3nts.org/report"


@lesson_s01e05_bp.route("/download-proxy-file", methods=["GET"])
def download_proxy_file():
    try:
        # Pobranie klucza API z parametru zapytania
        api_key = request.args.get("apiKey")
        if not api_key:
            return jsonify({"error": "Brak parametru apiKey"}), 400

        # Użycie klucza API w URL pliku
        file_url = f"https://centrala.ag3nts.org/data/{api_key}/cenzura.txt"

        # Pobranie pliku z podanego adresu URL
        response = requests.get(file_url)
        if response.status_code != 200:
            logging.error(
                "Błąd podczas pobierania pliku z zewnętrznego URL: %s", response.text
            )
            return (
                jsonify({"error": "Nie udało się pobrać pliku ze źródła zewnętrznego"}),
                response.status_code,
            )

        content = response.text  # Zawartość pobranego pliku

        # Zwrot zawartości pliku do frontendu
        return jsonify({"content": content}), 200

    except Exception as e:
        logging.error("Wyjątek w download_proxy_file: %s", e)
        return jsonify({"error": "Błąd wewnętrzny serwera"}), 500


@lesson_s01e05_bp.route("/submit-processed-file", methods=["POST"])
def submit_processed_file():
    try:
        # Pobranie danych JSON z zapytania
        data = request.json
        task = data.get("task")
        api_key = data.get("apikey")
        answer = data.get("answer")

        if not task or not api_key or not answer:
            return jsonify({"error": "Brak wymaganych pól"}), 400

        # Przygotowanie payload do wysłania na adres raportu
        payload = {"task": task, "apikey": api_key, "answer": answer}

        logging.info("Payload wysyłany: %s", payload)

        # Wysłanie przetworzonego pliku do zewnętrznego adresu URL
        response = requests.post(report_url, json=payload)

        if response.status_code != 200:
            logging.error(
                "Błąd podczas wysyłania przetworzonego pliku: %s", response.text
            )
            return (
                jsonify({"error": "Błąd podczas wysyłania przetworzonego pliku"}),
                response.status_code,
            )

        logging.info("Przetworzony plik wysłany pomyślnie.")

        # Zwrot odpowiedzi do frontendu
        return (
            jsonify(
                {
                    "message": "Przetworzony plik wysłany pomyślnie.",
                    "response": response.json(),
                }
            ),
            200,
        )

    except Exception as e:
        logging.error("Wyjątek w submit_processed_file: %s", e)
        return jsonify({"error": "Błąd wewnętrzny serwera"}), 500
