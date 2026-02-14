# app/infrastructure/database.py

from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

from app.core.config import settings


def _build_engine():
    """Create SQLAlchemy engine with settings appropriate for the database backend."""
    url = settings.DATABASE_URL

    if url.startswith("sqlite"):
        return create_engine(
            url,
            pool_pre_ping=True,
            echo=False,
            connect_args={"check_same_thread": False},
        )

    # PostgreSQL (Supabase)
    return create_engine(
        url,
        pool_pre_ping=True,
        echo=False,
        pool_size=5,
        max_overflow=10,
        pool_recycle=300,
        pool_timeout=30,
        connect_args={"sslmode": "require", "connect_timeout": 10},
    )


engine = _build_engine()

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
    from app.domains.bugs.models import BugReport

    Base.metadata.create_all(bind=engine)