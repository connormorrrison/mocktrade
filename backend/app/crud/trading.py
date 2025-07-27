# app/crud/trading.py

from sqlalchemy.orm import Session
from sqlalchemy.sql import func
from typing import List, Optional
from fastapi import HTTPException
from app.models import User, Position, Activity
from datetime import datetime

class TradingCRUD:
    @staticmethod
    async def get_user_portfolio(db: Session, user_id: int) -> List[Position]:
        """Get all positions for a user"""
        positions = db.query(Position).filter(Position.user_id == user_id).all()
        return positions

    @staticmethod
    async def get_user_activities(db: Session, user_id: int) -> List[Activity]:
        """Get all activities for a user"""
        activities = (
            db.query(Activity)
            .filter(Activity.user_id == user_id)
            .order_by(Activity.created_at.desc())
            .all()
        )
        return activities

    @staticmethod
    async def create_position(
        db: Session, 
        user_id: int, 
        symbol: str, 
        shares: float, 
        price: float
    ) -> Position:
        try:
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
            
        except Exception as e:
            db.rollback()
            raise HTTPException(status_code=500, detail=str(e))

    @staticmethod
    async def update_user_balance(db: Session, user_id: int, amount: float) -> User:
        """Update user's cash balance"""
        try:
            user = db.query(User).filter(User.id == user_id).first()
            if not user:
                raise HTTPException(status_code=404, detail="User not found")
            
            user.cash_balance += amount
            db.commit()
            db.refresh(user)
            return user
        except Exception as e:
            db.rollback()
            raise HTTPException(status_code=500, detail=str(e))

    @staticmethod
    async def record_activity(
        db: Session,
        user_id: int,
        position_id: int,
        symbol: str,
        activity_type: str,
        shares: float,
        price: float
    ) -> Activity:
        """Record a buy/sell activity"""
        try:
            activity = Activity(
                user_id=user_id,
                position_id=position_id,
                symbol=symbol,
                activity_type=activity_type,
                shares=shares,
                price=price,
                total_amount=shares * price
            )
            db.add(activity)
            db.commit()
            db.refresh(activity)
            return activity
        except Exception as e:
            db.rollback()
            raise HTTPException(status_code=500, detail=str(e))