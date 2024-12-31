# app/crud/trading.py

from sqlalchemy.orm import Session
from sqlalchemy.sql import func
from typing import List, Optional
from fastapi import HTTPException
from app.models import User, Position, Transaction
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
                user_id=user_id,
                symbol=symbol,
                shares=shares,
                average_price=price
            )
            db.add(position)

        db.commit()
        db.refresh(position)
        return position

    @staticmethod
    async def record_transaction(
        db: Session, 
        user_id: int, 
        position_id: int, 
        symbol: str, 
        transaction_type: str,
        shares: float,
        price: float
    ) -> Transaction:
        """
        Record a buy or sell transaction.
        """
        transaction = Transaction(
            user_id=user_id,
            position_id=position_id,
            symbol=symbol,
            transaction_type=transaction_type,
            shares=shares,
            price=price,
            total_amount=shares * price
        )
        db.add(transaction)
        db.commit()
        db.refresh(transaction)
        return transaction

    @staticmethod
    async def get_user_positions(db: Session, user_id: int) -> List[Position]:
        """
        Get all positions for a user.
        """
        return db.query(Position).filter(Position.user_id == user_id).all()

    @staticmethod
    async def get_user_transactions(
        db: Session, 
        user_id: int, 
        symbol: Optional[str] = None
    ) -> List[Transaction]:
        """
        Get user's transactions, optionally filtered by symbol.
        """
        query = db.query(Transaction).filter(Transaction.user_id == user_id)
        if symbol:
            query = query.filter(Transaction.symbol == symbol)
        return query.order_by(Transaction.created_at.desc()).all()

    @staticmethod
    async def update_user_balance(db: Session, user_id: int, amount: float) -> User:
        """
        Update user's cash balance.
        """
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        user.cash_balance += amount
        db.commit()
        db.refresh(user)
        return user