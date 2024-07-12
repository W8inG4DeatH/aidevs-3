import sys
import os
import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s"
)

# Ensure the app folder is in the Python path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

logging.info("Python path: %s", sys.path)

try:
    from app import create_app
except ModuleNotFoundError as e:
    logging.error(f"Error importing create_app: {e}")

try:
    app = create_app()
except Exception as e:
    logging.error(f"Error creating app: {e}")
    app = None

if __name__ == "__main__":
    if app:
        app.run(debug=True)
    else:
        logging.error("App could not be created. Check the configuration.")
