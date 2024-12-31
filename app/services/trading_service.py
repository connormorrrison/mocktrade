# app/services/trading_service.py

from fastapi import HTTPException
from sqlalchemy.orm import Session
from typing import Dict, Any, List
from app.services.stock_service import StockService
from app.crud.trading import TradingCRUD
from app.models import User, Position, Transaction

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

            # Calculate total amount
            total_amount = shares * current_price

            # Get user's current cash balance
            user = db.query(User).filter(User.id == user_id).first()
            if not user:
                raise HTTPException(status_code=404, detail="User not found")

            if transaction_type == "BUY":
                # Check if user has enough cash
                if user.cash_balance < total_amount:
                    raise HTTPException(status_code=400, detail="Insufficient funds")
                
                # Create/update position
                position = await self.crud.create_position(
                    db, user_id, symbol, shares, current_price
                )
                
                # Update cash balance
                await self.crud.update_user_balance(db, user_id, -total_amount)

            else:  # SELL
                # Check if user has enough shares
                position = db.query(Position).filter(
                    Position.user_id == user_id,
                    Position.symbol == symbol
                ).first()

                if not position or position.shares < shares:
                    raise HTTPException(status_code=400, detail="Insufficient shares")

                # Update position
                position.shares -= shares
                if position.shares == 0:
                    db.delete(position)
                
                # Update cash balance
                await self.crud.update_user_balance(db, user_id, total_amount)

            # Record transaction
            transaction = await self.crud.record_transaction(
                db, user_id, position.id, symbol, transaction_type, shares, current_price
            )

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
            raise HTTPException(status_code=400, detail=str(e))

    async def get_portfolio_summary(self, db: Session, user_id: int) -> Dict[str, Any]:
        """
        Get user's portfolio with current values
        """
        try:
            positions = await self.crud.get_user_portfolio(db, user_id)
            
            # Get current user
            user = db.query(User).filter(User.id == user_id).first()
            if not user:
                raise HTTPException(status_code=404, detail="User not found")

            portfolio_value = 0
            position_details = []

            for position in positions:
                # Get current price
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
                    "unrealized_pl_percent": ((current_price - position.average_price) / position.average_price) * 100
                })
                
                portfolio_value += current_value

            return {
                "cash_balance": user.cash_balance,
                "portfolio_value": portfolio_value,
                "total_value": portfolio_value + user.cash_balance,
                "total_pl": portfolio_value - sum(p["shares"] * p["average_price"] for p in position_details),
                "positions": position_details
            }
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))

    async def get_user_transactions(self, db: Session, user_id: int) -> List[Dict[str, Any]]:
        """
        Get user's transaction history
        """
        try:
            transactions = await self.crud.get_user_transactions(db, user_id)
            return [
                {
                    "id": t.id,
                    "symbol": t.symbol,
                    "transaction_type": t.transaction_type,
                    "shares": t.shares,
                    "price": t.price,
                    "total_amount": t.total_amount,
                    "created_at": t.created_at
                }
                for t in transactions
            ]
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))

# # Test functions
# async def setup_test_db():
#     """Create tables and test user"""
#     Base.metadata.create_all(bind=engine)
    
#     db = SessionLocal()
#     # Create test user if doesn't exist
#     test_user = db.query(User).filter(User.email == "test@example.com").first()
#     if not test_user:
#         test_user = User(
#             email="test@example.com",
#             hashed_password="test_password",
#             cash_balance=100000.0  # $100,000 starting balance
#         )
#         db.add(test_user)
#         db.commit()
#         db.refresh(test_user)
#     db.close()
#     return test_user.id

# async def print_portfolio(db: Session, user_id: int):
#     """Print current portfolio status"""
#     user = db.query(User).filter(User.id == user_id).first()
#     positions = db.query(Position).filter(Position.user_id == user_id).all()
    
#     print("\n=== Portfolio Status ===")
#     print(f"Cash Balance: ${user.cash_balance:.2f}")
#     print("\nPositions:")
#     for pos in positions:
#         print(f"- {pos.symbol}: {pos.shares} shares @ ${pos.average_price:.2f}")

# # Main test function
# if __name__ == "__main__":
#     import asyncio
    
#     async def main():
#         try:
#             # Setup
#             user_id = await setup_test_db()
#             trading_service = TradingService()
#             db = SessionLocal()
            
#             print("Starting test trading sequence...")
            
#             # Initial portfolio status
#             await print_portfolio(db, user_id)
            
#             # Test 1: Buy AAPL shares
#             print("\nTest 1: Buying 10 shares of AAPL")
#             buy_result = await trading_service.execute_trade(
#                 db=db,
#                 user_id=user_id,
#                 symbol="AAPL",
#                 shares=10,
#                 transaction_type="BUY"
#             )
#             print(f"Buy Result: {buy_result}")
#             await print_portfolio(db, user_id)
            
#             # Test 2: Sell half of AAPL shares
#             print("\nTest 2: Selling 5 shares of AAPL")
#             sell_result = await trading_service.execute_trade(
#                 db=db,
#                 user_id=user_id,
#                 symbol="AAPL",
#                 shares=5,
#                 transaction_type="SELL"
#             )
#             print(f"Sell Result: {sell_result}")
#             await print_portfolio(db, user_id)
            
#             # Print transaction history
#             transactions = await TradingCRUD.get_user_transactions(db, user_id)
#             print("\n=== Transaction History ===")
#             for t in transactions:
#                 print(f"{t.created_at}: {t.transaction_type} {t.shares} {t.symbol} @ ${t.price:.2f}")
            
#         except Exception as e:
#             print(f"Error during test: {str(e)}")
#         finally:
#             db.close()
    
#     asyncio.run(main())