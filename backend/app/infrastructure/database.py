# app/infrastructure/database.py

import logging

from sqlalchemy import create_engine, inspect, text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

from app.core.config import settings

logger = logging.getLogger(__name__)


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

    # postgreSQL (Supabase)
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

# create session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# create base class for models
Base = declarative_base()


def _has_snapshot_uniqueness() -> bool:
    """Check whether portfolio snapshots are already protected against duplicates."""
    inspector = inspect(engine)
    target_columns = {"user_id", "snapshot_date"}

    for constraint in inspector.get_unique_constraints("portfolio_snapshots"):
        if set(constraint.get("column_names") or []) == target_columns:
            return True

    for index in inspector.get_indexes("portfolio_snapshots"):
        if index.get("unique") and set(index.get("column_names") or []) == target_columns:
            return True

    return False


def _ensure_snapshot_uniqueness():
    """Create a unique index for existing databases that predate the model constraint."""
    try:
        if _has_snapshot_uniqueness():
            return

        with engine.begin() as conn:
            duplicate = conn.execute(text(
                """
                SELECT user_id, snapshot_date, COUNT(*) AS row_count
                FROM portfolio_snapshots
                GROUP BY user_id, snapshot_date
                HAVING COUNT(*) > 1
                LIMIT 1
                """
            )).first()

            if duplicate:
                logger.warning(
                    "Skipping unique snapshot index creation because duplicate "
                    "portfolio snapshots already exist for user_id=%s on %s",
                    duplicate.user_id,
                    duplicate.snapshot_date,
                )
                return

            conn.execute(text(
                """
                CREATE UNIQUE INDEX IF NOT EXISTS uq_portfolio_snapshots_user_date
                ON portfolio_snapshots (user_id, snapshot_date)
                """
            ))
    except Exception as e:
        logger.warning(f"Could not ensure snapshot uniqueness: {e}")

def create_tables():
    """Create all database tables"""
    # import all models to ensure they're registered
    from app.domains.auth.models import User
    from app.domains.trading.models import Position, Activity, Watchlist
    from app.domains.portfolio.models import PortfolioSnapshot
    from app.domains.bugs.models import BugReport

    Base.metadata.create_all(bind=engine)
    _ensure_snapshot_uniqueness()
