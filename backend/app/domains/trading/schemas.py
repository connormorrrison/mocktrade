# app/domains/trading/schemas.py

from pydantic import BaseModel, validator
from typing import Optional, List
from datetime import datetime

# request schemas
class OrderCreate(BaseModel):
    symbol: str
    action: str  # "buy" or "sell"
    quantity: float

    @validator('action')
    def validate_action(cls, v):
        if v.lower() not in ['buy', 'sell']:
            raise ValueError('Action must be either "buy" or "sell".')
        return v.lower()

    @validator('quantity')
    def validate_quantity(cls, v):
        if v <= 0:
            raise ValueError('Quantity must be greater than 0.')
        return v

    @validator('symbol')
    def validate_symbol(cls, v):
        if not v or len(v.strip()) == 0:
            raise ValueError('Symbol cannot be empty.')
        return v.upper().strip()

class PositionCreate(BaseModel):
    user_id: int
    symbol: str
    quantity: float
    average_price: float

    @validator('symbol')
    def validate_symbol(cls, v):
        if not v or len(v.strip()) == 0:
            raise ValueError('Symbol cannot be empty.')
        return v.upper().strip()

    @validator('quantity', 'average_price')
    def validate_positive(cls, v):
        if v <= 0:
            raise ValueError('Quantity and price must be greater than 0.')
        return v

class WatchlistCreate(BaseModel):
    symbol: str

    @validator('symbol')
    def validate_symbol(cls, v):
        if not v or len(v.strip()) == 0:
            raise ValueError('Symbol cannot be empty.')
        return v.upper().strip()

# response schemas
class Position(BaseModel):
    id: Optional[int] = None  # none for empty positions (user doesn't own this stock)
    user_id: int
    symbol: str
    quantity: float
    average_price: float
    current_price: Optional[float] = None
    current_value: Optional[float] = None
    unrealized_gain_loss: Optional[float] = None
    unrealized_gain_loss_percent: Optional[float] = None
    company_name: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class Activity(BaseModel):
    id: int
    user_id: int
    position_id: Optional[int] = None
    symbol: str
    action: str
    quantity: float
    price: float
    total_amount: float
    created_at: datetime

    class Config:
        from_attributes = True

class WatchlistItem(BaseModel):
    id: int
    user_id: int
    symbol: str
    created_at: datetime

    class Config:
        from_attributes = True

class WatchlistResponse(BaseModel):
    id: int
    symbol: str
    name: str
    current_price: float
    previous_close: float
    change: float
    change_percent: float
    market_cap: str
    created_at: datetime

    class Config:
        from_attributes = True

class TradeConfirmation(BaseModel):
    id: int
    symbol: str
    action: str
    quantity: float
    price: float
    total_amount: float
    remaining_cash: float
    created_at: datetime

class PortfolioSummary(BaseModel):
    total_value: float
    cash_balance: float
    positions_value: float
    positions: List[Position]

class PositionDetail(BaseModel):
    symbol: str
    company_name: Optional[str] = None
    quantity: float
    average_price: float
    current_price: float
    current_value: float
    unrealized_gain_loss: float
    unrealized_gain_loss_percent: float