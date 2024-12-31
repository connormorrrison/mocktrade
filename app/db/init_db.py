# app/db/init_db.py

from sqlalchemy import create_engine
from app.db.base import Base
from app.core.config import settings
from app.models import User, Position, Transaction

# Create tables
def init_db():
    engine = create_engine(settings.DATABASE_URL)
    Base.metadata.create_all(bind=engine)

if __name__ == "__main__":
    print("Creating database tables...")
    init_db()
    print("Database tables created successfully!")