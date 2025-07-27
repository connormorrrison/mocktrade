# app/tests/test_db.py
import sys
from pathlib import Path
import asyncio
from sqlalchemy.orm import Session
from app.db.base import engine, Base, SessionLocal
from app.models.trading import Position, Activity
from app.models.user import User
from datetime import datetime

def test_database():
    print("Starting database test...")
    
    # Create tables
    print("Creating database tables...")
    Base.metadata.drop_all(bind=engine)  # Clear existing tables
    Base.metadata.create_all(bind=engine)
    
    # Create a database session
    db = SessionLocal()
    
    try:
        # 1. Create a test user
        test_user = User(
            email="test@example.com",
            username="testuser",
            first_name="Test",
            last_name="User",
            hashed_password="testpassword",
            cash_balance=100000.0
        )
        db.add(test_user)
        db.commit()
        db.refresh(test_user)
        print(f"\nCreated test user:")
        print(f"ID: {test_user.id}")
        print(f"Username: {test_user.username}")
        print(f"Initial Balance: ${test_user.cash_balance:,.2f}")

        # 2. Create a position
        test_position = Position(
            user_id=test_user.id,
            symbol="AAPL",
            shares=10.0,
            average_price=150.0
        )
        db.add(test_position)
        db.commit()
        db.refresh(test_position)
        print(f"\nCreated position:")
        print(f"Symbol: {test_position.symbol}")
        print(f"Shares: {test_position.shares}")
        print(f"Average Price: ${test_position.average_price:,.2f}")

        # 3. Create an activity
        test_activity = Activity(
            user_id=test_user.id,
            position_id=test_position.id,
            symbol="AAPL",
            activity_type="BUY",
            shares=10.0,
            price=150.0,
            total_amount=1500.0
        )
        db.add(test_activity)
        db.commit()
        db.refresh(test_activity)
        print(f"\nCreated activity:")
        print(f"Type: {test_activity.activity_type}")
        print(f"Symbol: {test_activity.symbol}")
        print(f"Amount: ${test_activity.total_amount:,.2f}")

        # 4. Verify relationships
        print("\nVerifying relationships:")
        # Check user's positions
        user_positions = db.query(Position).filter(Position.user_id == test_user.id).all()
        print(f"User has {len(user_positions)} position(s)")
        
        # Check user's activities
        user_activities = db.query(Activity).filter(Activity.user_id == test_user.id).all()
        print(f"User has {len(user_activities)} activity(s)")
        
        # Verify position-activity relationship
        position_activities = db.query(Activity).filter(Activity.position_id == test_position.id).all()
        print(f"Position has {len(position_activities)} activity(s)")

        print("\nDatabase test completed successfully!")

    except Exception as e:
        print(f"\nError during test: {str(e)}")
        db.rollback()
        raise
    finally:
        print("\nClosing database connection...")
        db.close()

if __name__ == "__main__":
    test_database()