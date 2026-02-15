# app/core/config.py

from pydantic_settings import BaseSettings
import os
from dotenv import load_dotenv
from typing import List

load_dotenv()

class Settings(BaseSettings):
    # project info
    PROJECT_NAME: str = "MockTrade"
    VERSION: str = "0.1.0"
    
    # security
    SECRET_KEY: str = os.getenv("SECRET_KEY", "your-secret-key-here")  # change in production
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440  # 24 hours
    
    # database
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./development.db")
    
    # cors
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:5173",  # vite default
        "https://www.mocktrade.ca",
        "https://mocktrade.ca",
        "https://mocktrade-frontend.vercel.app"
    ]
    
    # google OAuth
    GOOGLE_CLIENT_ID: str = os.getenv("GOOGLE_CLIENT_ID", "")

    # cache
    REDIS_URL: str = os.getenv("REDIS_URL", "")
    
    # logging
    LOG_LEVEL: str = os.getenv("LOG_LEVEL", "INFO")

settings = Settings()