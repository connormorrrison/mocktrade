# app/domains/auth/models.py

from sqlalchemy import Boolean, Column, Integer, String, Float, DateTime, func
from sqlalchemy.orm import relationship
from app.infrastructure.database import Base
from datetime import datetime, timezone

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    first_name = Column(String)
    last_name = Column(String)
    email = Column(String, unique=True, index=True)
    username = Column(String, unique=True, index=True)
    hashed_password = Column(String, nullable=True)
    auth_provider = Column(String, default="local")
    cash_balance = Column(Float, default=100000.0)  # Start with $100k
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    is_active = Column(Boolean, default=True)

    # Relationships - using string names to avoid circular imports
    positions = relationship("Position", back_populates="user", lazy="dynamic")
    activities = relationship("Activity", back_populates="user", lazy="dynamic")
    watchlist = relationship("Watchlist", back_populates="user", lazy="dynamic")
    portfolio_snapshots = relationship("PortfolioSnapshot", back_populates="user", lazy="dynamic")