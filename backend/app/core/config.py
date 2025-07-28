# app/core/config.py

from pydantic_settings import BaseSettings
import os
from dotenv import load_dotenv
from typing import List

load_dotenv()

class Settings(BaseSettings):
    # Project info
    PROJECT_NAME: str = "MockTrade"
    VERSION: str = "0.1.0"
    
    # Security
    SECRET_KEY: str = os.getenv("SECRET_KEY", "your-secret-key-here")  # Change in production
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440  # 24 hours
    
    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./development.db")
    
    # CORS
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:5173",  # Vite default
        "https://www.mocktrade.ca",
        "https://mocktrade.ca",
        "https://mocktrade-frontend.vercel.app"
    ]
    
    # Cache
    REDIS_URL: str = os.getenv("REDIS_URL", "")
    
    # Logging
    LOG_LEVEL: str = os.getenv("LOG_LEVEL", "INFO")

settings = Settings()