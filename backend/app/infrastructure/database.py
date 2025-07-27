# app/infrastructure/database.py

from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

from app.core.config import settings

# Create engine
engine = create_engine(
    settings.DATABASE_URL,
    pool_pre_ping=True,  # Verify connections before use
    echo=False  # Set to True for SQL debugging
)

# Create session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create base class for models
Base = declarative_base()

def create_tables():
    """Create all database tables"""
    # Import all models to ensure they're registered
    from app.domains.auth.models import User
    from app.domains.trading.models import Position, Activity, Watchlist
    from app.domains.portfolio.models import PortfolioSnapshot
    
    Base.metadata.create_all(bind=engine)