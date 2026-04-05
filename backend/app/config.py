import os
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    DATABASE_URL: str = os.environ.get("DATABASE_URL", "sqlite:///./finance.db")
    SECRET_KEY: str = os.environ.get("SECRET_KEY", "supersecretkey-change-in-production-please")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    APP_ENV: str = os.environ.get("APP_ENV", "development")
    FRONTEND_URL: str = os.environ.get("FRONTEND_URL", "http://localhost:3000")

    class Config:
        env_file = ".env"


settings = Settings()
