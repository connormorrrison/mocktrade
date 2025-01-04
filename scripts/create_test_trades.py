# scripts/create_test_trades.py
import asyncio
from sqlalchemy.orm import Session
from app.db.base import SessionLocal
from app.models.user import User
from app.models.trading import Position, Transaction
from datetime import datetime, timedelta

async def create_test_trades():
    db = SessionLocal()
    try:
        # Get John Smith's user record
        user = db.query(User).filter(User.email == "johnsmith@email.com").first()
        if not user:
            print("User johnsmith@email.com not found")
            return

        # Create some test positions and transactions
        trades_data = [
            {
                "symbol": "AAPL",
                "shares": 50,
                "price": 185.50,
                "type": "BUY",
                "days_ago": 30
            },
            {
                "symbol": "MSFT",
                "shares": 25,
                "price": 375.20,
                "type": "BUY",
                "days_ago": 20
            },
            {
                "symbol": "GOOGL",
                "shares": 15,
                "price": 142.75,
                "type": "BUY",
                "days_ago": 15
            },
            {
                "symbol": "AAPL",
                "shares": 20,
                "price": 192.25,
                "type": "SELL",
                "days_ago": 5
            }
        ]

        for trade in trades_data:
            # Calculate transaction timestamp
            timestamp = datetime.now() - timedelta(days=trade['days_ago'])
            
            # Get or create position
            position = db.query(Position).filter(
                Position.user_id == user.id,
                Position.symbol == trade['symbol']
            ).first()

            if trade['type'] == "BUY":
                if position:
                    # Update existing position
                    total_cost = (position.shares * position.average_price) + (trade['shares'] * trade['price'])
                    total_shares = position.shares + trade['shares']
                    position.average_price = total_cost / total_shares
                    position.shares = total_shares
                else:
                    # Create new position
                    position = Position(
                        user_id=user.id,
                        symbol=trade['symbol'],
                        shares=trade['shares'],
                        average_price=trade['price'],
                        created_at=timestamp
                    )
                    db.add(position)
                db.flush()  # Get position.id for transaction

            elif trade['type'] == "SELL" and position:
                position.shares -= trade['shares']
                if position.shares <= 0:
                    db.delete(position)
                db.flush()

            # Create transaction record
            transaction = Transaction(
                user_id=user.id,
                position_id=position.id if position else None,
                symbol=trade['symbol'],
                transaction_type=trade['type'],
                shares=trade['shares'],
                price=trade['price'],
                total_amount=trade['shares'] * trade['price'],
                created_at=timestamp
            )
            db.add(transaction)

            # Update user's cash balance
            amount = trade['shares'] * trade['price']
            if trade['type'] == "BUY":
                user.cash_balance -= amount
            else:
                user.cash_balance += amount

        db.commit()
        print(f"Created test trades for {user.email}")

        # Print summary
        positions = db.query(Position).filter(Position.user_id == user.id).all()
        print("\nCurrent Positions:")
        for pos in positions:
            print(f"{pos.symbol}: {pos.shares} shares @ ${pos.average_price:.2f}")

        transactions = db.query(Transaction).filter(Transaction.user_id == user.id).all()
        print("\nTransaction History:")
        for trans in transactions:
            print(f"{trans.created_at}: {trans.transaction_type} {trans.shares} {trans.symbol} @ ${trans.price:.2f}")

        print(f"\nCurrent Cash Balance: ${user.cash_balance:.2f}")

    except Exception as e:
        print(f"Error creating test trades: {str(e)}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    asyncio.run(create_test_trades())