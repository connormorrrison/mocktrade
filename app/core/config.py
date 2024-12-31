# app/core/config.py

from pydantic_settings import BaseSettings
import os
from dotenv import load_dotenv

load_dotenv()

class Settings(BaseSettings):
    PROJECT_NAME: str = "Stock Trading Simulator"
    VERSION: str = "0.1.0"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = os.getenv("SECRET_KEY", "your-secret-key-here")  # Change in production
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./stock_trading.db")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    ALGORITHM: str = "HS256"    

settings = Settings()