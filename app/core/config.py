# app/core/config.py

from pydantic_settings import BaseSettings
import os
from dotenv import load_dotenv
from typing import ClassVar

load_dotenv()

class Settings(BaseSettings):
    PROJECT_NAME: ClassVar[str] = "Stock Trading Simulator"
    SECRET_KEY: str = os.getenv("SECRET_KEY")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./sql_app.db")

settings = Settings()
