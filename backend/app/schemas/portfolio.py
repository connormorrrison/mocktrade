from pydantic import BaseModel
from typing import List, Optional
from datetime import date

class PositionDetail(BaseModel):
    symbol: str
    shares: float
    average_price: float
    current_price: float
    current_value: float
    unrealized_gain_loss: float
    unrealized_gain_loss_percent: float

class PortfolioSummary(BaseModel):
    cash_balance: float
    positions_value: float
    total_value: float
    starting_value: float
    total_return: float
    return_percentage: float
    positions: List[PositionDetail]

class PortfolioHistory(BaseModel):
    date: str
    total_value: float
    cash_balance: float
    positions_value: float
    return_amount: float
    return_percentage: float

class LeaderboardEntry(BaseModel):
    rank: int
    username: str
    total_value: float
    return_amount: float
    return_percentage: float