# app/domains/portfolio/models.py

from sqlalchemy import Column, Integer, Float, Date, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime

from app.infrastructure.database import Base

class PortfolioSnapshot(Base):
    __tablename__ = "portfolio_snapshots"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    snapshot_date = Column(Date, index=True)
    portfolio_value = Column(Float)
    positions_value = Column(Float)
    cash_balance = Column(Float)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="portfolio_snapshots")