import sys
import os

# Add backend to path so Python can find the app module
backend_path = os.path.join(os.path.dirname(__file__), '..', 'backend')
if backend_path not in sys.path:
    sys.path.insert(0, backend_path)

from app.main import app

# Vercel Python runtime exports the FastAPI app directly
# The runtime will handle ASGI conversion automatically
