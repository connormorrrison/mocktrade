# app/domains/portfolio/models.py

from sqlalchemy import Column, Integer, Float, Date, ForeignKey, DateTime, func
from sqlalchemy.orm import relationship

from app.infrastructure.database import Base

class PortfolioSnapshot(Base):
    __tablename__ = "portfolio_snapshots"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    snapshot_date = Column(Date, index=True)
    portfolio_value = Column(Float)
    positions_value = Column(Float)
    cash_balance = Column(Float)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
    
    # Relationships
    user = relationship("User", back_populates="portfolio_snapshots")