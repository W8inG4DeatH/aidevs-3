import sys
import logging
import os
from flask import Blueprint, request, jsonify, current_app

sys.stdout.reconfigure(encoding="utf-8")

lesson_s04e05_bp = Blueprint("lesson_s04e05_bp", __name__)


@lesson_s04e05_bp.route("/fetch-questions", methods=["POST"])
def fetch_questions():
    try:
        data = request.get_json()
        url = data.get("url")

        if not url:
            return jsonify({"error": "No URL provided"}), 400

        # Pobieranie danych z zadanego URL
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


@lesson_s04e05_bp.route("/search-urls", methods=["POST"])
def search_urls():
    try:
        data = request.get_json()
        url = data.get("url")

        if not url:
            return jsonify({"error": "No URL provided"}), 400

        # Pobieranie zawartości URL
        import requests
        from urllib.parse import urljoin, urlparse

        response = requests.get(url)
        html_content = response.text

        # Parsowanie HTML i wyodrębnianie URLi
        from bs4 import BeautifulSoup

        soup = BeautifulSoup(html_content, "html.parser")

        # Znajdowanie wszystkich tagów <a>
        anchor_tags = soup.find_all("a", href=True)

        base_url = "{uri.scheme}://{uri.netloc}".format(uri=urlparse(url))

        found_urls = set()

        for tag in anchor_tags:
            href = tag["href"]
            # Rozwiązywanie względnych URLi
            full_url = urljoin(base_url, href)
            # Uwzględnianie tylko URLi zaczynających się od base_url
            if full_url.startswith(base_url):
                found_urls.add(full_url)

        return jsonify({"urls": list(found_urls)}), 200

    except Exception as e:
        logging.error(f"Exception in search_urls: {e}")
        return jsonify({"error": "Internal server error", "details": str(e)}), 500


@lesson_s04e05_bp.route("/scrap-content", methods=["POST"])
def scrap_content():
    try:
        data = request.get_json()
        url = data.get("url")

        if not url:
            return jsonify({"error": "No URL provided"}), 400

        # Pobieranie zawartości URL
        import requests

        response = requests.get(url)
        html_content = response.text

        return jsonify({"content": html_content}), 200

    except Exception as e:
        logging.error(f"Exception in scrap_content: {e}")
        return jsonify({"error": "Internal server error", "details": str(e)}), 500
