# app/crud/trading.py

from sqlalchemy.orm import Session
from sqlalchemy.sql import func
from typing import List, Optional
from fastapi import HTTPException
from app.models.trading import User, Position, Transaction
from datetime import datetime, timezone

class TradingCRUD:
    @staticmethod
    async def create_position(db: Session, user_id: int, symbol: str, shares: float, price: float) -> Position:
        """
        Create or update a position.
        """
        # Check for existing position
        position = db.query(Position).filter(
            Position.user_id == user_id,
            Position.symbol == symbol
        ).first()

        if position:
            # Update existing position
            new_total_shares = position.shares + shares
            new_total_cost = (position.shares * position.average_price) + (shares * price)
            position.shares = new_total_shares
            position.average_price = new_total_cost / new_total_shares
            position.updated_at = datetime.now(timezone.utc)
        else:
            # Create new position
            position = Position(
                user_id = user_id,
                symbol = symbol,
                shares = shares,
                average_price = price
            )
            db.add(position)
        
        db.commit()
        db.refresh(position)
        return position
    
    
        