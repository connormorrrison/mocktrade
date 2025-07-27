# app/domains/portfolio/schemas.py

from pydantic import BaseModel
from typing import List, Optional
from datetime import date, datetime

# Portfolio snapshot schemas
class PortfolioSnapshotCreate(BaseModel):
    user_id: int
    snapshot_date: date
    portfolio_value: float
    positions_value: float
    cash_balance: float

class PortfolioSnapshot(BaseModel):
    id: int
    user_id: int
    snapshot_date: date
    portfolio_value: float
    positions_value: float
    cash_balance: float
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# Portfolio summary schemas
class PortfolioSummary(BaseModel):
    portfolio_value: float
    positions_value: float
    cash_balance: float
    positions_count: int
    day_change: Optional[float] = None
    day_change_percent: Optional[float] = None

class PortfolioHistoryPoint(BaseModel):
    date: str
    portfolio_value: float
    positions_value: float
    cash_balance: float

class PortfolioHistory(BaseModel):
    history: List[PortfolioHistoryPoint]
    period: str  # "1D", "1W", "1M", "3M", "1Y", "ALL"