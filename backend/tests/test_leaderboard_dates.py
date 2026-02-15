"""Tests for leaderboard timeframe date calculations and snapshot lookup."""

import pytest
from datetime import date, timedelta
from unittest.mock import patch

from app.domains.portfolio.repositories import PortfolioRepository
from app.domains.portfolio.schemas import PortfolioSnapshotCreate


# ---------------------------------------------------------------------------
# pure date-math helpers (mirrors the logic in PortfolioService.get_leaderboard)
# ---------------------------------------------------------------------------

def _leaderboard_target_date(timeframe: str, today: date) -> date:
    """Return the snapshot target date for a given timeframe and 'today'."""
    if timeframe == "day":
        return today - timedelta(days=1)
    elif timeframe == "week":
        # week resets Sunday midnight. Target = Saturday before last Sunday
        days_since_sunday = (today.weekday() + 1) % 7
        return today - timedelta(days=days_since_sunday + 1)
    elif timeframe == "month":
        first_of_month = today.replace(day=1)
        return first_of_month - timedelta(days=1)
    else:
        return today - timedelta(days=1)


class TestLeaderboardTargetDates:
    """Verify the target date calculation for each timeframe."""

    # --- day ---

    def test_day_target_is_yesterday(self):
        today = date(2025, 6, 18)  # wednesday
        assert _leaderboard_target_date("day", today) == date(2025, 6, 17)

    # --- week (resets Sunday midnight, so target = previous Saturday) ---

    def test_week_target_on_sunday(self):
        """On Sunday the period just started; target = yesterday (Saturday)."""
        sunday = date(2025, 6, 15)  # sunday
        assert sunday.weekday() == 6
        assert _leaderboard_target_date("week", sunday) == date(2025, 6, 14)  # saturday

    def test_week_target_on_monday(self):
        monday = date(2025, 6, 16)
        assert monday.weekday() == 0
        assert _leaderboard_target_date("week", monday) == date(2025, 6, 14)  # saturday

    def test_week_target_on_wednesday(self):
        wednesday = date(2025, 6, 18)
        assert wednesday.weekday() == 2
        assert _leaderboard_target_date("week", wednesday) == date(2025, 6, 14)  # saturday

    def test_week_target_on_saturday(self):
        """Saturday is the last day of the period; target still = the Saturday before last Sunday."""
        saturday = date(2025, 6, 21)
        assert saturday.weekday() == 5
        assert _leaderboard_target_date("week", saturday) == date(2025, 6, 14)  # previous saturday

    def test_week_all_days_same_target(self):
        """Every day in the same Sun-Sat week should produce the same target."""
        # week of Sun Jun 15 - Sat Jun 21, 2025
        expected_target = date(2025, 6, 14)  # saturday before the week started
        for offset in range(7):
            day = date(2025, 6, 15) + timedelta(days=offset)
            assert _leaderboard_target_date("week", day) == expected_target, (
                f"Failed for {day} ({day.strftime('%A')})"
            )

    # --- month ---

    def test_month_target_on_first(self):
        """On the 1st, the period just started; target = last day of previous month."""
        first = date(2025, 3, 1)
        assert _leaderboard_target_date("month", first) == date(2025, 2, 28)

    def test_month_target_mid_month(self):
        mid = date(2025, 6, 15)
        assert _leaderboard_target_date("month", mid) == date(2025, 5, 31)

    def test_month_target_last_day(self):
        last = date(2025, 6, 30)
        assert _leaderboard_target_date("month", last) == date(2025, 5, 31)

    def test_month_target_jan_uses_dec(self):
        jan = date(2025, 1, 15)
        assert _leaderboard_target_date("month", jan) == date(2024, 12, 31)

    def test_month_target_leap_year(self):
        """March 1 of a leap year should target Feb 29."""
        march1 = date(2024, 3, 1)
        assert _leaderboard_target_date("month", march1) == date(2024, 2, 29)


class TestGetSnapshotOnOrBefore:
    """Verify the fuzzy snapshot lookup method."""

    @pytest.fixture
    def repo(self, db):
        return PortfolioRepository(db)

    @pytest.fixture
    def test_user(self, db):
        from app.domains.auth.repositories import UserRepository
        from app.domains.auth.schemas import UserCreate
        from app.core.security import get_password_hash

        user_repo = UserRepository(db)
        user_data = UserCreate(
            first_name="Alice",
            last_name="Test",
            email="alice@example.com",
            username="alicetest",
            password="password123",
        )
        return user_repo.create(user_data, get_password_hash("password123"))

    def _create_snapshot(self, repo, user_id: int, snap_date: date, value: float):
        repo.create_snapshot(PortfolioSnapshotCreate(
            user_id=user_id,
            snapshot_date=snap_date,
            portfolio_value=value,
            positions_value=0.0,
            cash_balance=value,
        ))

    def test_exact_match(self, repo, test_user):
        self._create_snapshot(repo, test_user.id, date(2025, 6, 14), 101000.0)
        snap = repo.get_snapshot_on_or_before(test_user.id, date(2025, 6, 14))
        assert snap is not None
        assert snap.portfolio_value == 101000.0

    def test_returns_closest_earlier_date(self, repo, test_user):
        """If target date has no snapshot, return the most recent one before it."""
        self._create_snapshot(repo, test_user.id, date(2025, 6, 12), 100000.0)
        self._create_snapshot(repo, test_user.id, date(2025, 6, 14), 102000.0)
        # ask for Jun 15 - no snapshot exists, should get Jun 14
        snap = repo.get_snapshot_on_or_before(test_user.id, date(2025, 6, 15))
        assert snap is not None
        assert snap.portfolio_value == 102000.0
        assert snap.snapshot_date == date(2025, 6, 14)

    def test_returns_none_when_no_earlier_snapshot(self, repo, test_user):
        """If no snapshot exists on or before the target, return None."""
        self._create_snapshot(repo, test_user.id, date(2025, 6, 20), 100000.0)
        snap = repo.get_snapshot_on_or_before(test_user.id, date(2025, 6, 15))
        assert snap is None

    def test_ignores_other_users(self, repo, test_user, db):
        """Snapshot from another user should not be returned."""
        from app.domains.auth.repositories import UserRepository
        from app.domains.auth.schemas import UserCreate
        from app.core.security import get_password_hash

        user_repo = UserRepository(db)
        other_user = user_repo.create(
            UserCreate(
                first_name="Bob", last_name="Other",
                email="bob@example.com", username="bobother",
                password="password123",
            ),
            get_password_hash("password123"),
        )
        self._create_snapshot(repo, other_user.id, date(2025, 6, 14), 200000.0)
        snap = repo.get_snapshot_on_or_before(test_user.id, date(2025, 6, 14))
        assert snap is None
