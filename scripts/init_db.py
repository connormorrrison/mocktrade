# scripts/init_db.py
import asyncio
from sqlalchemy.orm import Session
from app.db.base import SessionLocal, Base, engine
from app.models.user import User
from app.core.security import get_password_hash
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def init_db():
    logger.info("Creating tables...")
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    try:
        # Create test user if doesn't exist
        test_user = db.query(User).filter(User.email == "test3@email.com").first()
        if not test_user:
            test_user = User(
                email="test3@email.com",
                username="test3",
                first_name="Test",
                last_name="User",
                hashed_password=get_password_hash("password123"),
                cash_balance=100000.0,  # $100,000 starting balance
                is_active=True
            )
            db.add(test_user)
            db.commit()
            logger.info("Created test user test3@email.com")
        else:
            logger.info("Test user already exists")
            
    except Exception as e:
        logger.error(f"Error initializing database: {str(e)}")
        db.rollback()
        raise
    finally:
        db.close()

if __name__ == "__main__":
    init_db()