import pytest
from datetime import date, timedelta
from unittest.mock import patch, AsyncMock

from app.domains.portfolio.services import PortfolioService
from app.domains.portfolio.schemas import PortfolioSnapshotCreate, PortfolioSummary
from app.domains.portfolio.repositories import PortfolioRepository
from app.domains.auth.repositories import UserRepository
from app.domains.auth.schemas import UserCreate
from app.core.security import get_password_hash


@pytest.fixture
def portfolio_service(db):
    return PortfolioService(db)


@pytest.fixture
def portfolio_repo(db):
    return PortfolioRepository(db)


@pytest.fixture
def user_repo(db):
    return UserRepository(db)


def create_user(user_repo, username, email):
    user_data = UserCreate(
        first_name="Test",
        last_name="User",
        email=email,
        username=username,
        password="password123"
    )
    return user_repo.create(user_data, get_password_hash("password123"))


def create_snapshot(portfolio_repo, user_id, snapshot_date, portfolio_value):
    snapshot_data = PortfolioSnapshotCreate(
        user_id=user_id,
        snapshot_date=snapshot_date,
        portfolio_value=portfolio_value,
        positions_value=portfolio_value - 100000.0,
        cash_balance=100000.0
    )
    return portfolio_repo.create_snapshot(snapshot_data)


class TestLeaderboardService:
    """Test leaderboard filtering and sorting logic"""

    @pytest.mark.asyncio
    @patch('app.domains.portfolio.services.PortfolioService.get_portfolio_summary')
    async def test_day_excludes_users_without_baseline(self, mock_summary, portfolio_service, portfolio_repo, user_repo):
        """User with no snapshot for yesterday is excluded from Day leaderboard"""
        user_with = create_user(user_repo, "withsnap", "with@test.com")
        user_without = create_user(user_repo, "nosnap", "no@test.com")

        yesterday = date.today() - timedelta(days=1)
        create_snapshot(portfolio_repo, user_with.id, yesterday, 105000.0)
        # user_without has no snapshot

        mock_summary.return_value = PortfolioSummary(
            portfolio_value=110000.0,
            positions_value=10000.0,
            cash_balance=100000.0,
            positions_count=1,
            day_change=0.0,
            day_change_percent=0.0
        )

        result = await portfolio_service.get_leaderboard("day")

        usernames = [e["username"] for e in result]
        assert "withsnap" in usernames
        assert "nosnap" not in usernames

    @pytest.mark.asyncio
    @patch('app.domains.portfolio.services.PortfolioService.get_portfolio_summary')
    async def test_day_includes_user_with_baseline(self, mock_summary, portfolio_service, portfolio_repo, user_repo):
        """User with valid yesterday snapshot appears correctly"""
        user = create_user(user_repo, "validuser", "valid@test.com")

        yesterday = date.today() - timedelta(days=1)
        create_snapshot(portfolio_repo, user.id, yesterday, 100000.0)

        mock_summary.return_value = PortfolioSummary(
            portfolio_value=105000.0,
            positions_value=5000.0,
            cash_balance=100000.0,
            positions_count=1,
            day_change=0.0,
            day_change_percent=0.0
        )

        result = await portfolio_service.get_leaderboard("day")

        assert len(result) == 1
        assert result[0]["username"] == "validuser"
        assert result[0]["return_amount"] == 5000.0
        assert result[0]["rank"] == 1

    @pytest.mark.asyncio
    @patch('app.domains.portfolio.services.PortfolioService.get_portfolio_summary')
    async def test_all_timeframe_includes_everyone(self, mock_summary, portfolio_service, portfolio_repo, user_repo):
        """All users appear in 'all' timeframe regardless of snapshot history"""
        user1 = create_user(user_repo, "user1", "u1@test.com")
        user2 = create_user(user_repo, "user2", "u2@test.com")
        # No snapshots for either user

        mock_summary.return_value = PortfolioSummary(
            portfolio_value=110000.0,
            positions_value=10000.0,
            cash_balance=100000.0,
            positions_count=1,
            day_change=0.0,
            day_change_percent=0.0
        )

        result = await portfolio_service.get_leaderboard("all")

        usernames = [e["username"] for e in result]
        assert "user1" in usernames
        assert "user2" in usernames

    @pytest.mark.asyncio
    @patch('app.domains.portfolio.services.PortfolioService.get_portfolio_summary')
    async def test_day_sorts_by_return_amount(self, mock_summary, portfolio_service, portfolio_repo, user_repo):
        """Day leaderboard sorted by period profit, not total value"""
        user_a = create_user(user_repo, "usera", "a@test.com")
        user_b = create_user(user_repo, "userb", "b@test.com")

        yesterday = date.today() - timedelta(days=1)
        # user_a started at 200k (high total value but lower gain)
        create_snapshot(portfolio_repo, user_a.id, yesterday, 200000.0)
        # user_b started at 100k (lower total value but higher gain)
        create_snapshot(portfolio_repo, user_b.id, yesterday, 100000.0)

        async def mock_get_summary(user_id):
            if user_id == user_a.id:
                return PortfolioSummary(
                    portfolio_value=201000.0,  # gained 1k
                    positions_value=101000.0,
                    cash_balance=100000.0,
                    positions_count=1,
                    day_change=0.0,
                    day_change_percent=0.0
                )
            else:
                return PortfolioSummary(
                    portfolio_value=110000.0,  # gained 10k
                    positions_value=10000.0,
                    cash_balance=100000.0,
                    positions_count=1,
                    day_change=0.0,
                    day_change_percent=0.0
                )

        mock_summary.side_effect = mock_get_summary

        result = await portfolio_service.get_leaderboard("day")

        assert result[0]["username"] == "userb"  # higher return_amount
        assert result[1]["username"] == "usera"

    @pytest.mark.asyncio
    @patch('app.domains.portfolio.services.PortfolioService.get_portfolio_summary')
    async def test_all_sorts_by_total_value(self, mock_summary, portfolio_service, portfolio_repo, user_repo):
        """All leaderboard sorted by total portfolio value"""
        user_a = create_user(user_repo, "usera", "a@test.com")
        user_b = create_user(user_repo, "userb", "b@test.com")

        async def mock_get_summary(user_id):
            if user_id == user_a.id:
                return PortfolioSummary(
                    portfolio_value=200000.0,
                    positions_value=100000.0,
                    cash_balance=100000.0,
                    positions_count=1,
                    day_change=0.0,
                    day_change_percent=0.0
                )
            else:
                return PortfolioSummary(
                    portfolio_value=150000.0,
                    positions_value=50000.0,
                    cash_balance=100000.0,
                    positions_count=1,
                    day_change=0.0,
                    day_change_percent=0.0
                )

        mock_summary.side_effect = mock_get_summary

        result = await portfolio_service.get_leaderboard("all")

        assert result[0]["username"] == "usera"  # higher total_value
        assert result[1]["username"] == "userb"

    @pytest.mark.asyncio
    @patch('app.domains.portfolio.services.PortfolioService.get_portfolio_summary')
    async def test_all_users_missing_baseline_returns_empty(self, mock_summary, portfolio_service, portfolio_repo, user_repo):
        """Day/Week/Month returns empty list when no user has a baseline"""
        create_user(user_repo, "user1", "u1@test.com")
        create_user(user_repo, "user2", "u2@test.com")
        # No snapshots

        mock_summary.return_value = PortfolioSummary(
            portfolio_value=110000.0,
            positions_value=10000.0,
            cash_balance=100000.0,
            positions_count=1,
            day_change=0.0,
            day_change_percent=0.0
        )

        result = await portfolio_service.get_leaderboard("day")
        assert result == []

    @pytest.mark.asyncio
    @patch('app.domains.portfolio.services.PortfolioService.get_portfolio_summary')
    async def test_lower_total_value_user_appears_if_valid(self, mock_summary, portfolio_service, portfolio_repo, user_repo):
        """User with lower total portfolio but valid baseline is included (P1 fix)"""
        # Create 21 users - first 20 have high total_value but no baseline
        high_value_users = []
        for i in range(20):
            u = create_user(user_repo, f"rich{i}", f"rich{i}@test.com")
            high_value_users.append(u)

        # 21st user has lower total value but a valid baseline
        valid_user = create_user(user_repo, "validlow", "validlow@test.com")
        yesterday = date.today() - timedelta(days=1)
        create_snapshot(portfolio_repo, valid_user.id, yesterday, 100000.0)

        async def mock_get_summary(user_id):
            if user_id == valid_user.id:
                return PortfolioSummary(
                    portfolio_value=105000.0,  # lower total value
                    positions_value=5000.0,
                    cash_balance=100000.0,
                    positions_count=1,
                    day_change=0.0,
                    day_change_percent=0.0
                )
            else:
                return PortfolioSummary(
                    portfolio_value=500000.0,  # much higher total value
                    positions_value=400000.0,
                    cash_balance=100000.0,
                    positions_count=1,
                    day_change=0.0,
                    day_change_percent=0.0
                )

        mock_summary.side_effect = mock_get_summary

        result = await portfolio_service.get_leaderboard("day")

        # Only the valid user should appear (all others lack baselines)
        assert len(result) == 1
        assert result[0]["username"] == "validlow"

    @pytest.mark.asyncio
    @patch('app.domains.portfolio.services.PortfolioService.get_portfolio_summary')
    async def test_stale_snapshot_treated_as_baseline_missing(self, mock_summary, portfolio_service, portfolio_repo, user_repo):
        """A snapshot older than 2 days before target_date is treated as missing (staleness check)"""
        user = create_user(user_repo, "staleuser", "stale@test.com")

        # Create a snapshot from 10 days ago — too old for "day" baseline
        old_date = date.today() - timedelta(days=10)
        create_snapshot(portfolio_repo, user.id, old_date, 100000.0)

        mock_summary.return_value = PortfolioSummary(
            portfolio_value=112000.0,
            positions_value=12000.0,
            cash_balance=100000.0,
            positions_count=1,
            day_change=0.0,
            day_change_percent=0.0
        )

        result = await portfolio_service.get_leaderboard("day")

        # User should be excluded because their snapshot is too stale
        assert result == []
