import logging
import os
import re
from flask import Blueprint, request, jsonify, current_app
import openai
import chromadb
from chromadb.config import Settings

lesson_s03e02_bp = Blueprint("lesson_s03e02_bp", __name__)
logging.basicConfig(level=logging.INFO)


def extract_date_from_content(content):
    # Try to find a date in the content in format DD-MM-YYYY or similar
    date_patterns = [
        r"(\d{4}-\d{2}-\d{2})",  # YYYY-MM-DD
        r"(\d{2}-\d{2}-\d{4})",  # DD-MM-YYYY
        r"(\d{2}/\d{2}/\d{4})",  # DD/MM/YYYY
        r"(\d{2}\.\d{2}\.\d{4})",  # DD.MM.YYYY
    ]
    for pattern in date_patterns:
        match = re.search(pattern, content)
        if match:
            return match.group(1)
    return None


@lesson_s03e02_bp.route("/index-reports", methods=["POST"])
def index_reports():
    try:
        # Set up ChromaDB client
        client = chromadb.Client(
            Settings(chroma_db_impl="duckdb+parquet", persist_directory="db")
        )
        collection = client.get_or_create_collection(name="reports")

        # Directory where report files are stored
        mixed_folder = current_app.config["MIXED_FOLDER"]
        report_folder = os.path.join(mixed_folder, "do-not-share")

        files = [
            f
            for f in os.listdir(report_folder)
            if os.path.isfile(os.path.join(report_folder, f))
        ]

        openai.api_key = current_app.config["OPENAI_API_KEY"]

        # For each report file
        for idx, file_name in enumerate(files):
            file_path = os.path.join(report_folder, file_name)
            with open(file_path, "r", encoding="utf-8") as f:
                content = f.read()

            # Extract metadata (e.g., date)
            date = extract_date_from_content(content)
            if not date:
                logging.warning(f"Date not found in file {file_name}")
                continue

            # Create embedding
            response = openai.Embedding.create(
                input=content, model="text-embedding-ada-002"
            )
            embedding = response["data"][0]["embedding"]

            # Add to collection
            collection.add(
                documents=[content],
                embeddings=[embedding],
                metadatas=[{"date": date, "file_name": file_name}],
                ids=[str(idx)],
            )

        return jsonify({"message": "Indexing completed"}), 200

    except Exception as e:
        logging.error(f"Error in index_reports: {e}")
        return jsonify({"error": "Internal server error"}), 500


@lesson_s03e02_bp.route("/query-reports", methods=["POST"])
def query_reports():
    try:
        data = request.json
        query_text = data.get("query")
        if not query_text:
            return jsonify({"error": "Query text is required"}), 400

        # Set up ChromaDB client
        client = chromadb.Client(
            Settings(chroma_db_impl="duckdb+parquet", persist_directory="db")
        )
        collection = client.get_or_create_collection(name="reports")

        # Create embedding for the query
        openai.api_key = current_app.config["OPENAI_API_KEY"]
        response = openai.Embedding.create(
            input=query_text, model="text-embedding-ada-002"
        )
        query_embedding = response["data"][0]["embedding"]

        # Query the database
        results = collection.query(
            query_embeddings=[query_embedding], n_results=1, include=["metadatas"]
        )

        # Get the top result
        if results and "metadatas" in results and len(results["metadatas"]) > 0:
            top_metadata = results["metadatas"][0][0]
            date = top_metadata.get("date", "Date not found")
            return jsonify({"date": date}), 200
        else:
            return jsonify({"message": "No matching documents found"}), 200

    except Exception as e:
        logging.error(f"Error in query_reports: {e}")
        return jsonify({"error": "Internal server error"}), 500
