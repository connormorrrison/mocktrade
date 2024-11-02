# app/core/config.py

from pydantic_settings import BaseSettings
import os
from dotenv import load_dotenv

load_dotenv()

class Settings(BaseSettings):
    PROJECT_NAME = "Stock Trading Simulator"
    VERSION = "1.0.0"
    API_V1_STR = "/api/v1"
    ALPHA_VANTAGE_API_KEY = os.getenv("ALPHA_VANTAGE_API_KEY")
    DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./sql_app.db")

settings = Settings()
