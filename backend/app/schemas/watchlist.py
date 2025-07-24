from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class WatchlistCreate(BaseModel):
    symbol: str

class WatchlistItem(BaseModel):
    id: int
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