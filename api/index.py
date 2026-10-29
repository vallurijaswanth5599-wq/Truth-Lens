import sys
from pathlib import Path

# Ensure backend directory is in sys.path so app... imports resolve correctly
backend_dir = Path(__file__).resolve().parent.parent / "backend"
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

# Import the FastAPI app instance from backend/app/main.py
from app.main import app
