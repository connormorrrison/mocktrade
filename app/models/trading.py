# app/models/trading.py
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.db.base import Base
from datetime import datetime

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    cash_balance = Column(Float, default=100000.0)  # Start with $100k
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    positions = relationship("Position", back_populates="user")
    transactions = relationship("Transaction", back_populates="user")

class Position(Base):
    __tablename__ = "positions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    symbol = Column(String, index=True)
    shares = Column(Float)
    average_price = Column(Float)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="positions")
    transactions = relationship("Transaction", back_populates="position")

class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    position_id = Column(Integer, ForeignKey("positions.id"))
    symbol = Column(String, index=True)
    transaction_type = Column(String)  # "BUY" or "SELL"
    shares = Column(Float)
    price = Column(Float)
    total_amount = Column(Float)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="transactions")
    position = relationship("Position", back_populates="transactions")