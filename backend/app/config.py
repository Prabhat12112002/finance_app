import os
import secrets
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    DATABASE_URL: str = os.environ.get("DATABASE_URL", "sqlite:///./finance.db")
    # Auto-generate a secret key if not provided (for production, set SECRET_KEY env var)
    SECRET_KEY: str = os.environ.get("SECRET_KEY", secrets.token_hex(32))
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    APP_ENV: str = os.environ.get("APP_ENV", "production" if os.environ.get("VERCEL") else "development")
    # Auto-detect Vercel URL for CORS
    FRONTEND_URL: str = os.environ.get(
        "FRONTEND_URL", 
        f"https://{os.environ.get('VERCEL_URL')}" if os.environ.get("VERCEL_URL") else "http://localhost:3000"
    )

    class Config:
        env_file = ".env"


settings = Settings()
