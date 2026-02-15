import pytest
from fastapi import status
from datetime import date, timedelta
from unittest.mock import patch, AsyncMock

from app.domains.portfolio.services import PortfolioService, PortfolioError
from app.domains.portfolio.schemas import PortfolioSnapshotCreate, PortfolioSummary
from app.domains.portfolio.models import PortfolioSnapshot
from app.domains.auth.models import User
from app.domains.trading.models import Position


class TestPortfolioAPI:
    """Test portfolio API endpoints"""
    
    def test_get_portfolio_summary_unauthorized(self, client):
        """Test getting portfolio summary without auth"""
        response = client.get("/portfolio/summary")
        assert response.status_code == status.HTTP_403_FORBIDDEN

    @patch('app.domains.portfolio.services.PortfolioService.get_portfolio_summary')
    def test_get_portfolio_summary_success(self, mock_get_summary, client, authenticated_user):
        """Test successful portfolio summary retrieval"""
        # mock the service response
        mock_summary = PortfolioSummary(
            portfolio_value=105000.0,
            positions_value=5000.0,
            cash_balance=100000.0,
            positions_count=2,
            day_change=1000.0,
            day_change_percent=0.95
        )
        mock_get_summary.return_value = mock_summary
        
        response = client.get(
            "/portfolio/summary",
            headers=authenticated_user["headers"]
        )
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["portfolio_value"] == 105000.0
        assert data["positions_value"] == 5000.0
        assert data["cash_balance"] == 100000.0
        assert data["positions_count"] == 2
        assert data["day_change"] == 1000.0
        assert data["day_change_percent"] == 0.95

    @patch('app.domains.portfolio.services.PortfolioService.get_portfolio_history')
    def test_get_portfolio_history_success(self, mock_get_history, client, authenticated_user):
        """Test successful portfolio history retrieval"""
        # mock the service response
        mock_history = {
            "history": [
                {
                    "date": "2024-01-01",
                    "portfolio_value": 100000.0,
                    "positions_value": 0.0,
                    "cash_balance": 100000.0
                },
                {
                    "date": "2024-01-02", 
                    "portfolio_value": 105000.0,
                    "positions_value": 5000.0,
                    "cash_balance": 100000.0
                }
            ],
            "period": "1M"
        }
        mock_get_history.return_value = mock_history
        
        response = client.get(
            "/portfolio/history?timeframe=1M",
            headers=authenticated_user["headers"]
        )
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert len(data["history"]) == 2
        assert data["period"] == "1M"

    @patch('app.domains.portfolio.services.PortfolioService.get_portfolio_history')
    def test_get_portfolio_history_different_timeframes(self, mock_get_history, client, authenticated_user):
        """Test portfolio history with different timeframes"""
        mock_history = {"history": [], "period": "1W"}
        mock_get_history.return_value = mock_history
        
        timeframes = ["1D", "1W", "1M", "3M", "1Y", "ALL"]
        
        for timeframe in timeframes:
            response = client.get(
                f"/portfolio/history?timeframe={timeframe}",
                headers=authenticated_user["headers"]
            )
            assert response.status_code == status.HTTP_200_OK


class TestPortfolioService:
    """Test portfolio service business logic"""
    
    @pytest.fixture
    def portfolio_service(self, db):
        """Create portfolio service instance"""
        return PortfolioService(db)
    
    @pytest.fixture 
    def test_user(self, db):
        """Create a test user"""
        from app.domains.auth.repositories import UserRepository
        from app.domains.auth.schemas import UserCreate
        from app.core.security import get_password_hash
        
        user_repo = UserRepository(db)
        user_data = UserCreate(
            first_name="John",
            last_name="Doe",
            email="john@example.com",
            username="johndoe",
            password="password123"
        )
        return user_repo.create(user_data, get_password_hash("password123"))
    
    @pytest.fixture
    def test_positions(self, db, test_user):
        """Create test positions"""
        from app.domains.trading.repositories import PositionRepository
        from app.domains.trading.schemas import PositionCreate
        
        position_repo = PositionRepository(db)
        
        # create test positions
        positions = []
        
        position1 = position_repo.create(
            user_id=test_user.id,
            symbol="AAPL",
            quantity=10,
            average_price=150.0
        )
        positions.append(position1)
        
        position2 = position_repo.create(
            user_id=test_user.id,
            symbol="GOOGL", 
            quantity=5,
            average_price=2500.0
        )
        positions.append(position2)
        
        return positions

    @patch('app.domains.stocks.services.StockService.get_current_price')
    async def test_get_portfolio_summary_success(self, mock_get_price, portfolio_service, test_user, test_positions):
        """Test successful portfolio summary calculation"""
        # mock stock service responses - using async side_effect
        async def side_effect(symbol):
            prices = {
                "AAPL": {"current_price": 160.0},
                "GOOGL": {"current_price": 2600.0}
            }
            return prices[symbol]
        
        mock_get_price.side_effect = side_effect
        
        summary = await portfolio_service.get_portfolio_summary(test_user.id)
        
        assert summary.cash_balance == 100000.0  # default starting balance
        assert summary.positions_value == (10 * 160.0) + (5 * 2600.0)  # 1600 + 13000 = 14600
        assert summary.portfolio_value == summary.cash_balance + summary.positions_value
        assert summary.positions_count == 2

    async def test_get_portfolio_summary_no_positions(self, portfolio_service, test_user):
        """Test portfolio summary with no positions"""
        summary = await portfolio_service.get_portfolio_summary(test_user.id)
        
        assert summary.cash_balance == 100000.0
        assert summary.positions_value == 0.0
        assert summary.portfolio_value == 100000.0
        assert summary.positions_count == 0

    async def test_get_portfolio_summary_user_not_found(self, portfolio_service):
        """Test portfolio summary for nonexistent user"""
        with pytest.raises(PortfolioError):
            await portfolio_service.get_portfolio_summary(999999)

    @patch('app.domains.stocks.services.StockService.get_current_price')
    async def test_get_portfolio_summary_stock_price_error(self, mock_get_price, portfolio_service, test_user, test_positions):
        """Test portfolio summary when stock price fetch fails"""
        # mock stock service to raise exception
        mock_get_price.side_effect = Exception("API Error")

        # should use average price as fallback
        summary = await portfolio_service.get_portfolio_summary(test_user.id)
        
        assert summary.cash_balance == 100000.0
        # should use average prices: (10 * 150.0) + (5 * 2500.0) = 1500 + 12500 = 14000
        assert summary.positions_value == 14000.0
        assert summary.portfolio_value == 114000.0

    @patch('app.domains.portfolio.services.PortfolioService.get_portfolio_summary')
    async def test_create_portfolio_snapshot_success(self, mock_get_summary, portfolio_service, test_user):
        """Test successful portfolio snapshot creation"""
        # mock summary response
        mock_get_summary.return_value = PortfolioSummary(
            portfolio_value=105000.0,
            positions_value=5000.0,
            cash_balance=100000.0,
            positions_count=1,
            day_change=None,
            day_change_percent=None
        )
        
        # should not raise exception
        await portfolio_service.create_portfolio_snapshot(test_user.id)

        # verify snapshot was created
        snapshot = portfolio_service.portfolio_repo.get_snapshot_by_date(test_user.id, date.today())
        assert snapshot is not None
        assert snapshot.portfolio_value == 105000.0

    @patch('app.domains.portfolio.services.PortfolioService.get_portfolio_summary')  
    async def test_create_portfolio_snapshot_update_existing(self, mock_get_summary, portfolio_service, test_user):
        """Test updating existing portfolio snapshot"""
        # create initial snapshot
        initial_summary = PortfolioSummary(
            portfolio_value=100000.0,
            positions_value=0.0,
            cash_balance=100000.0,
            positions_count=0,
            day_change=None,
            day_change_percent=None
        )
        mock_get_summary.return_value = initial_summary
        
        await portfolio_service.create_portfolio_snapshot(test_user.id)
        
        # update with new values
        updated_summary = PortfolioSummary(
            portfolio_value=105000.0,
            positions_value=5000.0,
            cash_balance=100000.0,
            positions_count=1,
            day_change=None,
            day_change_percent=None
        )
        mock_get_summary.return_value = updated_summary
        
        await portfolio_service.create_portfolio_snapshot(test_user.id)
        
        # verify snapshot was updated, not duplicated
        snapshot = portfolio_service.portfolio_repo.get_snapshot_by_date(test_user.id, date.today())
        assert snapshot.portfolio_value == 105000.0

    def test_get_portfolio_history_success(self, portfolio_service, test_user):
        """Test successful portfolio history retrieval"""
        # create some test snapshots
        today = date.today()
        yesterday = today - timedelta(days=1)
        
        from app.domains.portfolio.repositories import PortfolioRepository
        repo = PortfolioRepository(portfolio_service.db)
        
        # create snapshots
        snapshot1_data = PortfolioSnapshotCreate(
            user_id=test_user.id,
            snapshot_date=yesterday,
            portfolio_value=100000.0,
            positions_value=0.0,
            cash_balance=100000.0
        )
        repo.create_snapshot(snapshot1_data)
        
        snapshot2_data = PortfolioSnapshotCreate(
            user_id=test_user.id,
            snapshot_date=today,
            portfolio_value=105000.0,
            positions_value=5000.0,
            cash_balance=100000.0
        )
        repo.create_snapshot(snapshot2_data)
        
        history = portfolio_service.get_portfolio_history(test_user.id, "1W")
        
        assert len(history.history) == 2
        assert history.period == "1W"
        assert history.history[0].portfolio_value == 100000.0
        assert history.history[1].portfolio_value == 105000.0

    def test_get_portfolio_history_different_periods(self, portfolio_service, test_user):
        """Test portfolio history with different periods"""
        periods = ["1D", "1W", "1M", "3M", "1Y", "ALL"]
        
        for period in periods:
            history = portfolio_service.get_portfolio_history(test_user.id, period)
            assert history.period == period
            assert isinstance(history.history, list)

    def test_get_portfolio_history_no_snapshots(self, portfolio_service, test_user):
        """Test portfolio history with no snapshots"""
        history = portfolio_service.get_portfolio_history(test_user.id, "1M")
        
        assert history.period == "1M"
        assert len(history.history) == 0


class TestPortfolioRepository:
    """Test portfolio repository"""
    
    @pytest.fixture
    def portfolio_repo(self, db):
        """Create portfolio repository instance"""
        from app.domains.portfolio.repositories import PortfolioRepository
        return PortfolioRepository(db)
    
    @pytest.fixture
    def test_user(self, db):
        """Create a test user"""
        from app.domains.auth.repositories import UserRepository
        from app.domains.auth.schemas import UserCreate
        from app.core.security import get_password_hash
        
        user_repo = UserRepository(db)
        user_data = UserCreate(
            first_name="John",
            last_name="Doe", 
            email="john@example.com",
            username="johndoe",
            password="password123"
        )
        return user_repo.create(user_data, get_password_hash("password123"))

    def test_create_snapshot_success(self, portfolio_repo, test_user):
        """Test successful snapshot creation"""
        snapshot_data = PortfolioSnapshotCreate(
            user_id=test_user.id,
            snapshot_date=date.today(),
            portfolio_value=105000.0,
            positions_value=5000.0,
            cash_balance=100000.0
        )
        
        snapshot = portfolio_repo.create_snapshot(snapshot_data)
        
        assert snapshot.user_id == test_user.id
        assert snapshot.portfolio_value == 105000.0
        assert snapshot.positions_value == 5000.0
        assert snapshot.cash_balance == 100000.0

    def test_get_snapshot_by_date_success(self, portfolio_repo, test_user):
        """Test getting snapshot by date"""
        today = date.today()
        snapshot_data = PortfolioSnapshotCreate(
            user_id=test_user.id,
            snapshot_date=today,
            portfolio_value=105000.0,
            positions_value=5000.0,
            cash_balance=100000.0
        )
        
        created_snapshot = portfolio_repo.create_snapshot(snapshot_data)
        retrieved_snapshot = portfolio_repo.get_snapshot_by_date(test_user.id, today)
        
        assert retrieved_snapshot is not None
        assert retrieved_snapshot.id == created_snapshot.id

    def test_get_snapshot_by_date_not_found(self, portfolio_repo, test_user):
        """Test getting snapshot for non-existent date"""
        yesterday = date.today() - timedelta(days=1)
        snapshot = portfolio_repo.get_snapshot_by_date(test_user.id, yesterday)
        assert snapshot is None

    def test_get_snapshots_by_date_range(self, portfolio_repo, test_user):
        """Test getting snapshots by date range"""
        today = date.today()
        yesterday = today - timedelta(days=1)
        
        # create snapshots for both days
        snapshot1_data = PortfolioSnapshotCreate(
            user_id=test_user.id,
            snapshot_date=yesterday,
            portfolio_value=100000.0,
            positions_value=0.0,
            cash_balance=100000.0
        )
        portfolio_repo.create_snapshot(snapshot1_data)
        
        snapshot2_data = PortfolioSnapshotCreate(
            user_id=test_user.id,
            snapshot_date=today,
            portfolio_value=105000.0,
            positions_value=5000.0,
            cash_balance=100000.0
        )
        portfolio_repo.create_snapshot(snapshot2_data)
        
        snapshots = portfolio_repo.get_snapshots_by_date_range(test_user.id, yesterday, today)
        
        assert len(snapshots) == 2
        assert snapshots[0].snapshot_date == yesterday
        assert snapshots[1].snapshot_date == today

    def test_update_snapshot_success(self, portfolio_repo, test_user):
        """Test successful snapshot update"""
        snapshot_data = PortfolioSnapshotCreate(
            user_id=test_user.id,
            snapshot_date=date.today(),
            portfolio_value=100000.0,
            positions_value=0.0,
            cash_balance=100000.0
        )
        
        snapshot = portfolio_repo.create_snapshot(snapshot_data)
        
        # update the snapshot
        updated_snapshot = portfolio_repo.update_snapshot(
            snapshot,
            portfolio_value=110000.0,
            positions_value=10000.0,
            cash_balance=100000.0
        )
        
        assert updated_snapshot.portfolio_value == 110000.0
        assert updated_snapshot.positions_value == 10000.0
        assert updated_snapshot.cash_balance == 100000.0

    def test_get_all_snapshots(self, portfolio_repo, test_user):
        """Test getting all snapshots for a user"""
        # create multiple snapshots
        dates = [date.today() - timedelta(days=i) for i in range(3)]
        
        for i, snapshot_date in enumerate(dates):
            snapshot_data = PortfolioSnapshotCreate(
                user_id=test_user.id,
                snapshot_date=snapshot_date,
                portfolio_value=100000.0 + (i * 1000.0),
                positions_value=i * 1000.0,
                cash_balance=100000.0
            )
            portfolio_repo.create_snapshot(snapshot_data)
        
        snapshots = portfolio_repo.get_all_snapshots(test_user.id)
        assert len(snapshots) == 3