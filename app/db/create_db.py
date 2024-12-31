# app/db/create_db.py

import sys
from pathlib import Path
project_root = str(Path(__file__).parent.parent.parent)
sys.path.append(project_root)

from sqlalchemy import create_engine
from app.db.base import Base
from app.core.config import settings
from app.models.user import User
from app.models.trading import Position, Transaction

def init_db():
    """Initialize the database, creating all tables."""
    print("Creating database engine...")
    engine = create_engine(settings.DATABASE_URL)
    
    print("Creating all database tables...")
    Base.metadata.create_all(bind=engine)
    print("Database initialization completed!")

if __name__ == "__main__":
    print("Starting database initialization...")
    init_db()