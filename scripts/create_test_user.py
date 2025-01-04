# scripts/create_test_user.py
import asyncio
from sqlalchemy.orm import Session
from app.db.base import SessionLocal
from app.models.user import User
from app.core.security import get_password_hash

async def create_test_user():
    db = SessionLocal()
    try:
        # Check if user exists
        test_user = db.query(User).filter(User.email == "test4@email.com").first()
        if not test_user:
            test_user = User(
                email="test4@email.com",
                username="test4",
                first_name="Test4",
                last_name="User",
                hashed_password=get_password_hash("password123"),
                cash_balance=100000.0,
                is_active=True
            )
            db.add(test_user)
            db.commit()
            db.refresh(test_user)
            print(f"Created test user: {test_user.email}")
        else:
            print("Test user already exists")
            
    except Exception as e:
        print(f"Error creating test user: {str(e)}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    asyncio.run(create_test_user())