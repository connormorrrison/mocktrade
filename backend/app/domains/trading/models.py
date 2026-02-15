# app/domains/trading/models.py

from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, func
from sqlalchemy.orm import relationship
from app.infrastructure.database import Base

class Position(Base):
    __tablename__ = "positions"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    symbol = Column(String, index=True)
    quantity = Column(Float)
    average_price = Column(Float)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # relationships
    user = relationship("User", back_populates="positions")
    activities = relationship("Activity", back_populates="position")

class Activity(Base):
    __tablename__ = "activities"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    position_id = Column(Integer, ForeignKey("positions.id"), nullable=True)
    symbol = Column(String, index=True)
    action = Column(String)  # "buy" or "sell"
    quantity = Column(Float)
    price = Column(Float)
    total_amount = Column(Float)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # relationships
    user = relationship("User", back_populates="activities")
    position = relationship("Position", back_populates="activities")

class Watchlist(Base):
    __tablename__ = "watchlist"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    symbol = Column(String, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # relationships
    user = relationship("User", back_populates="watchlist")