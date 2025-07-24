# app/models/trading.py

from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, func, Date, UniqueConstraint
from sqlalchemy.orm import relationship
from app.db.base import Base
from datetime import datetime, timezone

class Position(Base):
    __tablename__ = "positions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    symbol = Column(String, index=True)
    shares = Column(Float)
    average_price = Column(Float)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

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
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    user = relationship("User", back_populates="transactions")
    position = relationship("Position", back_populates="transactions")

class Watchlist(Base):
    __tablename__ = "watchlist"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    symbol = Column(String, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Ensure each user can only have one entry per symbol
    __table_args__ = (UniqueConstraint('user_id', 'symbol', name='unique_user_symbol'),)

    # Relationships
    user = relationship("User", back_populates="watchlist")

class PortfolioSnapshot(Base):
    __tablename__ = "portfolio_snapshots"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    total_value = Column(Float)  # Total portfolio value (cash + positions)
    cash_balance = Column(Float)  # Cash balance at time of snapshot
    positions_value = Column(Float)  # Total value of all positions
    snapshot_date = Column(Date, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Ensure one snapshot per user per day
    __table_args__ = (UniqueConstraint('user_id', 'snapshot_date', name='unique_user_date'),)

    # Relationships
    user = relationship("User", back_populates="portfolio_snapshots")