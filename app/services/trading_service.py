# app/services/trading_service.py
from fastapi import HTTPException
from sqlalchemy.orm import Session
from typing import Dict, Any, List
from app.services.stock_service import StockService
from app.crud.trading import TradingCRUD
from app.models.user import User
from app.models.trading import Position, Transaction

class TradingService:
    def __init__(self):
        self.stock_service = StockService()
        self.crud = TradingCRUD()

    async def execute_trade(
        self,
        db: Session,
        user_id: int,
        symbol: str,
        shares: float,
        transaction_type: str
    ) -> Dict[str, Any]:
        """
        Execute a buy or sell trade
        """
        try:
            # Get current stock price
            stock_data = await self.stock_service.get_stock_price(symbol)
            current_price = stock_data["current_price"]

            # Get user
            user = db.query(User).filter(User.id == user_id).first()
            if not user:
                raise ValueError("User not found")

            total_amount = shares * current_price

            if transaction_type == "BUY":
                if user.cash_balance < total_amount:
                    raise ValueError("Insufficient funds")
                
                # Get or create position
                position = db.query(Position).filter(
                    Position.user_id == user_id,
                    Position.symbol == symbol
                ).first()

                if position:
                    # Update existing position
                    total_cost = (position.shares * position.average_price) + total_amount
                    total_shares = position.shares + shares
                    position.average_price = total_cost / total_shares
                    position.shares = total_shares
                else:
                    # Create new position
                    position = Position(
                        user_id=user_id,
                        symbol=symbol,
                        shares=shares,
                        average_price=current_price
                    )
                    db.add(position)
                
                # Update cash balance
                user.cash_balance -= total_amount

            else:  # SELL
                position = db.query(Position).filter(
                    Position.user_id == user_id,
                    Position.symbol == symbol
                ).first()

                if not position or position.shares < shares:
                    raise ValueError("Insufficient shares")

                # Update position
                position.shares -= shares
                if position.shares == 0:
                    db.delete(position)
                
                # Update cash balance
                user.cash_balance += total_amount

            # Record transaction
            transaction = Transaction(
                user_id=user_id,
                position_id=position.id if position else None,
                symbol=symbol,
                transaction_type=transaction_type,
                shares=shares,
                price=current_price,
                total_amount=total_amount
            )
            db.add(transaction)
            db.commit()
            db.refresh(transaction)

            return {
                "status": "success",
                "transaction_id": transaction.id,
                "symbol": symbol,
                "shares": shares,
                "price": current_price,
                "total_amount": total_amount,
                "transaction_type": transaction_type
            }

        except Exception as e:
            db.rollback()
            raise e

    async def get_portfolio_summary(self, db: Session, user_id: int) -> Dict[str, Any]:
        """
        Get user's portfolio with current values
        """
        try:
            positions = db.query(Position).filter(Position.user_id == user_id).all()
            user = db.query(User).filter(User.id == user_id).first()
            if not user:
                raise ValueError("User not found")

            portfolio_value = 0
            position_details = []

            for position in positions:
                quote = await self.stock_service.get_stock_price(position.symbol)
                current_price = quote["current_price"]
                current_value = current_price * position.shares

                position_details.append({
                    "symbol": position.symbol,
                    "shares": position.shares,
                    "average_price": position.average_price,
                    "current_price": current_price,
                    "current_value": current_value,
                    "unrealized_pl": current_value - (position.average_price * position.shares),
                    "unrealized_pl_percent": (
                        ((current_price - position.average_price) / position.average_price) * 100
                        if position.average_price > 0 else 0
                    )
                })

                portfolio_value += current_value

            return {
                "cash_balance": user.cash_balance,
                "portfolio_value": portfolio_value,
                "total_value": portfolio_value + user.cash_balance,
                "positions": position_details
            }

        except Exception as e:
            raise e

    async def get_user_transactions(self, db: Session, user_id: int) -> List[Dict[str, Any]]:
        """
        Get user's transaction history
        """
        try:
            transactions = db.query(Transaction).filter(
                Transaction.user_id == user_id
            ).order_by(Transaction.created_at.desc()).all()

            return [{
                "id": t.id,
                "symbol": t.symbol,
                "transaction_type": t.transaction_type,
                "shares": t.shares,
                "price": t.price,
                "total_amount": t.total_amount,
                "created_at": t.created_at
            } for t in transactions]

        except Exception as e:
            raise e