# app/domains/portfolio/repositories.py

import logging
from datetime import date
from typing import List, Optional

from sqlalchemy import text
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.domains.portfolio.models import PortfolioSnapshot
from app.domains.portfolio.schemas import PortfolioSnapshotCreate

logger = logging.getLogger(__name__)

class PortfolioRepository:
    def __init__(self, db: Session):
        self.db = db

    def create_snapshot(self, snapshot_data: PortfolioSnapshotCreate) -> PortfolioSnapshot:
        """Create a new portfolio snapshot, returning the existing row on conflict."""
        lock_acquired = self._acquire_snapshot_lock(
            snapshot_data.user_id, snapshot_data.snapshot_date
        )

        existing = self.get_snapshot_by_date(snapshot_data.user_id, snapshot_data.snapshot_date)
        if existing:
            if lock_acquired:
                self.db.commit()
            return existing

        snapshot = PortfolioSnapshot(
            user_id=snapshot_data.user_id,
            snapshot_date=snapshot_data.snapshot_date,
            portfolio_value=snapshot_data.portfolio_value,
            positions_value=snapshot_data.positions_value,
            cash_balance=snapshot_data.cash_balance
        )

        try:
            self.db.add(snapshot)
            self.db.commit()
            self.db.refresh(snapshot)
            return snapshot
        except IntegrityError:
            self.db.rollback()
            existing = self.get_snapshot_by_date(
                snapshot_data.user_id, snapshot_data.snapshot_date
            )
            if existing:
                logger.warning(
                    "Snapshot already existed for user %s on %s; returning existing row",
                    snapshot_data.user_id,
                    snapshot_data.snapshot_date,
                )
                return existing
            raise

    def get_latest_snapshot(self, user_id: int) -> Optional[PortfolioSnapshot]:
        """Get the most recent portfolio snapshot for a user"""
        return self.db.query(PortfolioSnapshot).filter(
            PortfolioSnapshot.user_id == user_id
        ).order_by(PortfolioSnapshot.snapshot_date.desc()).first()

    def get_snapshots_by_date_range(self, user_id: int, start_date: date, end_date: date) -> List[PortfolioSnapshot]:
        """Get portfolio snapshots within a date range"""
        return self.db.query(PortfolioSnapshot).filter(
            PortfolioSnapshot.user_id == user_id,
            PortfolioSnapshot.snapshot_date >= start_date,
            PortfolioSnapshot.snapshot_date <= end_date
        ).order_by(PortfolioSnapshot.snapshot_date).all()

    def get_all_snapshots(self, user_id: int) -> List[PortfolioSnapshot]:
        """Get all portfolio snapshots for a user"""
        return self.db.query(PortfolioSnapshot).filter(
            PortfolioSnapshot.user_id == user_id
        ).order_by(PortfolioSnapshot.snapshot_date).all()

    def get_snapshot_by_date(self, user_id: int, snapshot_date: date) -> Optional[PortfolioSnapshot]:
        """Get portfolio snapshot for a specific date"""
        return self.db.query(PortfolioSnapshot).filter(
            PortfolioSnapshot.user_id == user_id,
            PortfolioSnapshot.snapshot_date == snapshot_date
        ).first()

    def get_snapshot_on_or_before(self, user_id: int, target_date: date) -> Optional[PortfolioSnapshot]:
        """Get the most recent snapshot on or before a given date"""
        return self.db.query(PortfolioSnapshot).filter(
            PortfolioSnapshot.user_id == user_id,
            PortfolioSnapshot.snapshot_date <= target_date
        ).order_by(PortfolioSnapshot.snapshot_date.desc()).first()

    def update_snapshot(self, snapshot: PortfolioSnapshot, portfolio_value: float, 
                       positions_value: float, cash_balance: float) -> PortfolioSnapshot:
        """Update an existing portfolio snapshot"""
        snapshot.portfolio_value = portfolio_value
        snapshot.positions_value = positions_value
        snapshot.cash_balance = cash_balance
        self.db.commit()
        self.db.refresh(snapshot)
        return snapshot

    def delete_snapshot(self, snapshot: PortfolioSnapshot) -> None:
        """Delete a portfolio snapshot"""
        self.db.delete(snapshot)
        self.db.commit()

    def _acquire_snapshot_lock(self, user_id: int, snapshot_date: date) -> bool:
        """Serialize concurrent snapshot writes for the same user/date on PostgreSQL."""
        bind = self.db.get_bind()
        if bind is None or bind.dialect.name != "postgresql":
            return False

        lock_key = ((user_id & 0x7FFFFFFF) << 32) | (snapshot_date.toordinal() & 0xFFFFFFFF)
        self.db.execute(
            text("SELECT pg_advisory_xact_lock(:lock_key)"),
            {"lock_key": lock_key},
        )
        return True
