# app/domains/stocks/schemas.py

from pydantic import BaseModel, validator
from typing import List

# Core stock data - contains everything we might need
class StockData(BaseModel):
    symbol: str
    company_name: str
    current_price: float
    previous_close_price: float
    market_capitalization: str
    timestamp: str

# Market data schemas
class MarketIndex(BaseModel):
    symbol: str
    ticker: str
    value: float
    change: float
    percent: float

class MarketMover(BaseModel):
    symbol: str
    name: str
    price: float
    change: float
    change_percent: float

# Response containers
class MarketIndicesResponse(BaseModel):
    indices: List[MarketIndex]

class MarketMoversResponse(BaseModel):
    gainers: List[MarketMover]
    losers: List[MarketMover]

# Simple request validation
class SymbolRequest(BaseModel):
    symbol: str

    @validator('symbol')
    def validate_symbol(cls, v):
        if not v or len(v.strip()) == 0:
            raise ValueError('Symbol cannot be empty')
        return v.upper().strip()