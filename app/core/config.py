# app/core/config.py

from pydantic_settings import BaseSettings
import os
from dotenv import load_dotenv
from typing import ClassVar

load_dotenv()

class Settings(BaseSettings):
    PROJECT_NAME: ClassVar[str] = "Stock Trading Simulator"
    ALPHA_VANTAGE_API_KEY: str = os.getenv("ALPHA_VANTAGE_API_KEY", "")
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./sql_app.db")

settings = Settings()
