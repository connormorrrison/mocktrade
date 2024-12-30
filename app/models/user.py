# app/models/user.py

from sqlalchemy import Boolean, Column, Integer, String, Float, DateTime, func
from app.db.base import Base
from datetime import datetime, timezone

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    username = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    first_name = Column(String)
    last_name = Column(String)
    cash_balance = Column(Float, default=100000.0)  # Start with $100k
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
