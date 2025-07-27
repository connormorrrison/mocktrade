# app/schemas/trading.py

from pydantic import BaseModel, Field
from typing import Literal, Dict, List
from datetime import datetime

class OrderCreate(BaseModel):
    symbol: str = Field(..., description="Stock symbol (e.g., 'AAPL')")
    shares: float = Field(..., gt=0, description="Number of shares to trade")
    activity_type: Literal["BUY", "SELL"] = Field(..., description="Type of activity")

class Activity(BaseModel):
    id: int
    symbol: str
    activity_type: str
    shares: float
    price: float
    total_amount: float
    created_at: datetime

    class Config:
        from_attributes = True

class Position(BaseModel):
    symbol: str
    shares: float
    average_price: float
    current_price: float
    current_value: float
    unrealized_pl: float
    unrealized_pl_percent: float

    class Config:
        from_attributes = True

class Portfolio(BaseModel):
    positions: List[Position]
    total_value: float
    total_cost: float
    total_pl: float
    total_pl_percent: float
    cash_balance: float
    last_updated: datetime

    class Config:
        from_attributes = True