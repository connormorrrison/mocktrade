import pytest
from fastapi import status
from unittest.mock import patch, AsyncMock

from app.domains.trading.services import TradingService, TradingError, InsufficientFundsError, InsufficientSharesError
from app.domains.trading.schemas import OrderCreate, WatchlistCreate, TradeConfirmation
from app.domains.trading.models import Position, Activity, Watchlist
from app.domains.auth.models import User


class TestTradingAPI:
    """Test trading API endpoints"""
    
    def test_execute_order_unauthorized(self, client):
        """Test executing order without auth"""
        order_data = {
            "symbol": "AAPL",
            "action": "buy",
            "quantity": 10
        }
        response = client.post("/trading/orders", json=order_data)
        assert response.status_code == status.HTTP_403_FORBIDDEN

    @patch('app.domains.stocks.services.StockService.get_current_price')
    @patch('app.domains.trading.services.TradingService.execute_order')
    def test_execute_buy_order_success(self, mock_execute_order, mock_get_price, client, authenticated_user):
        """Test successful buy order execution"""
        # Mock stock price
        mock_get_price.return_value = {"current_price": 150.0}
        
        # Mock trading service response
        from datetime import datetime
        mock_confirmation = TradeConfirmation(
            id=1,
            symbol="AAPL",
            action="buy",
            quantity=10,
            price=150.0,
            total_amount=1500.0,
            remaining_cash=98500.0,
            created_at=datetime.now()
        )
        mock_execute_order.return_value = mock_confirmation
        
        order_data = {
            "symbol": "AAPL",
            "action": "buy", 
            "quantity": 10
        }
        
        response = client.post(
            "/trading/orders",
            json=order_data,
            headers=authenticated_user["headers"]
        )
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["symbol"] == "AAPL"
        assert data["action"] == "buy"
        assert data["quantity"] == 10
        assert data["price"] == 150.0
        assert data["total_amount"] == 1500.0

    @patch('app.domains.stocks.services.StockService.get_current_price')
    @patch('app.domains.trading.services.TradingService.execute_order')
    def test_execute_sell_order_success(self, mock_execute_order, mock_get_price, client, authenticated_user):
        """Test successful sell order execution"""
        # Mock stock price
        mock_get_price.return_value = {"current_price": 160.0}
        
        # Mock trading service response
        from datetime import datetime
        mock_confirmation = TradeConfirmation(
            id=2,
            symbol="AAPL",
            action="sell",
            quantity=5,
            price=160.0,
            total_amount=800.0,
            remaining_cash=100800.0,
            created_at=datetime.now()
        )
        mock_execute_order.return_value = mock_confirmation
        
        order_data = {
            "symbol": "AAPL",
            "action": "sell",
            "quantity": 5
        }
        
        response = client.post(
            "/trading/orders",
            json=order_data,
            headers=authenticated_user["headers"]
        )
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["action"] == "sell"
        assert data["quantity"] == 5

    @patch('app.domains.stocks.services.StockService.get_current_price')
    def test_execute_order_insufficient_funds(self, mock_get_price, client, authenticated_user):
        """Test order execution with insufficient funds"""
        # Mock very high stock price
        mock_get_price.return_value = {"current_price": 50000.0}
        
        order_data = {
            "symbol": "AAPL",
            "action": "buy",
            "quantity": 10
        }
        
        response = client.post(
            "/trading/orders",
            json=order_data,
            headers=authenticated_user["headers"]
        )
        
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_get_activities_success(self, client, authenticated_user):
        """Test getting user activities"""
        response = client.get(
            "/trading/activities",
            headers=authenticated_user["headers"]
        )
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert isinstance(data, list)

    def test_get_watchlist_success(self, client, authenticated_user):
        """Test getting user watchlist"""
        response = client.get(
            "/trading/watchlist",
            headers=authenticated_user["headers"]
        )
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert isinstance(data, list)

    def test_add_to_watchlist_success(self, client, authenticated_user):
        """Test adding stock to watchlist"""
        watchlist_data = {"symbol": "AAPL"}
        
        response = client.post(
            "/trading/watchlist",
            json=watchlist_data,
            headers=authenticated_user["headers"]
        )
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["symbol"] == "AAPL"

    def test_remove_from_watchlist_success(self, client, authenticated_user):
        """Test removing stock from watchlist"""
        # First add to watchlist
        watchlist_data = {"symbol": "AAPL"}
        client.post(
            "/trading/watchlist",
            json=watchlist_data,
            headers=authenticated_user["headers"]
        )
        
        # Then remove
        response = client.delete(
            "/trading/watchlist/AAPL",
            headers=authenticated_user["headers"]
        )
        
        assert response.status_code == status.HTTP_200_OK


class TestTradingService:
    """Test trading service business logic"""
    
    @pytest.fixture
    def trading_service(self, db):
        """Create trading service instance"""
        return TradingService(db)
    
    @pytest.fixture
    def test_user(self, db):
        """Create a test user with cash"""
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
    def test_user_with_position(self, db, test_user):
        """Create user with existing position"""
        from app.domains.trading.repositories import PositionRepository
        from app.domains.trading.schemas import PositionCreate
        
        position_repo = PositionRepository(db)
        position_repo.create(
            user_id=test_user.id,
            symbol="AAPL",
            quantity=10,
            average_price=150.0
        )
        return test_user

    async def test_execute_buy_order_success(self, trading_service, test_user):
        """Test successful buy order execution"""
        order = OrderCreate(
            symbol="AAPL",
            action="buy",
            quantity=10
        )
        
        confirmation = await trading_service.execute_order(test_user, order, 150.0)
        
        assert confirmation.symbol == "AAPL"
        assert confirmation.action == "buy"
        assert confirmation.quantity == 10
        assert confirmation.price == 150.0
        assert confirmation.total_amount == 1500.0
        assert confirmation.remaining_cash == 98500.0  # 100000 - 1500

    async def test_execute_buy_order_insufficient_funds(self, trading_service, test_user):
        """Test buy order with insufficient funds"""
        order = OrderCreate(
            symbol="AAPL",
            action="buy",
            quantity=1000  # Way too many shares
        )
        
        with pytest.raises(InsufficientFundsError):
            await trading_service.execute_order(test_user, order, 150.0)

    async def test_execute_sell_order_success(self, trading_service, test_user_with_position):
        """Test successful sell order execution"""
        order = OrderCreate(
            symbol="AAPL",
            action="sell", 
            quantity=5
        )
        
        confirmation = await trading_service.execute_order(test_user_with_position, order, 160.0)
        
        assert confirmation.symbol == "AAPL"
        assert confirmation.action == "sell"
        assert confirmation.quantity == 5
        assert confirmation.price == 160.0
        assert confirmation.total_amount == 800.0
        assert confirmation.remaining_cash == 100800.0  # 100000 + 800

    async def test_execute_sell_order_insufficient_shares(self, trading_service, test_user_with_position):
        """Test sell order with insufficient shares"""
        order = OrderCreate(
            symbol="AAPL",
            action="sell",
            quantity=20  # More than owned (10)
        )
        
        with pytest.raises(InsufficientSharesError):
            await trading_service.execute_order(test_user_with_position, order, 160.0)

    async def test_execute_sell_order_no_position(self, trading_service, test_user):
        """Test sell order when user has no position"""
        order = OrderCreate(
            symbol="AAPL", 
            action="sell",
            quantity=5
        )
        
        with pytest.raises(InsufficientSharesError):
            await trading_service.execute_order(test_user, order, 160.0)

    async def test_execute_buy_order_creates_position(self, trading_service, test_user):
        """Test that buy order creates new position"""
        order = OrderCreate(
            symbol="GOOGL",
            action="buy",
            quantity=2
        )
        
        await trading_service.execute_order(test_user, order, 2500.0)
        
        # Verify position was created
        position = trading_service.position_repo.get_by_user_and_symbol(test_user.id, "GOOGL")
        assert position is not None
        assert position.quantity == 2
        assert position.average_price == 2500.0

    async def test_execute_buy_order_updates_existing_position(self, trading_service, test_user_with_position):
        """Test that buy order updates existing position"""
        # Initial position: 10 shares at $150
        order = OrderCreate(
            symbol="AAPL",
            action="buy",
            quantity=5  # Buy 5 more
        )
        
        await trading_service.execute_order(test_user_with_position, order, 160.0)
        
        # Verify position was updated
        position = trading_service.position_repo.get_by_user_and_symbol(test_user_with_position.id, "AAPL")
        assert position.quantity == 15  # 10 + 5
        # Average price should be weighted: (10*150 + 5*160) / 15 = 153.33
        expected_avg = (10 * 150.0 + 5 * 160.0) / 15
        assert abs(position.average_price - expected_avg) < 0.01

    async def test_execute_sell_order_updates_position(self, trading_service, test_user_with_position):
        """Test that sell order updates position quantity"""
        order = OrderCreate(
            symbol="AAPL",
            action="sell",
            quantity=3
        )
        
        await trading_service.execute_order(test_user_with_position, order, 160.0)
        
        # Verify position quantity was reduced
        position = trading_service.position_repo.get_by_user_and_symbol(test_user_with_position.id, "AAPL")
        assert position.quantity == 7  # 10 - 3
        assert position.average_price == 150.0  # Should remain unchanged

    async def test_execute_sell_all_shares_removes_position(self, trading_service, test_user_with_position):
        """Test that selling all shares removes the position"""
        order = OrderCreate(
            symbol="AAPL",
            action="sell",
            quantity=10  # Sell all
        )
        
        await trading_service.execute_order(test_user_with_position, order, 160.0)
        
        # Verify position was removed
        position = trading_service.position_repo.get_by_user_and_symbol(test_user_with_position.id, "AAPL")
        assert position is None

    async def test_execute_order_creates_activity(self, trading_service, test_user):
        """Test that orders create activity records"""
        order = OrderCreate(
            symbol="AAPL",
            action="buy",
            quantity=10
        )
        
        await trading_service.execute_order(test_user, order, 150.0)
        
        # Verify activity was created
        activities = trading_service.activity_repo.get_by_user(test_user.id)
        assert len(activities) == 1
        activity = activities[0]
        assert activity.symbol == "AAPL"
        assert activity.action == "buy"
        assert activity.quantity == 10
        assert activity.price == 150.0
        assert activity.total_amount == 1500.0

    def test_get_user_activities(self, trading_service, test_user):
        """Test getting user activities"""
        activities = trading_service.get_user_activities(test_user.id)
        assert isinstance(activities, list)
        # Initially should be empty
        assert len(activities) == 0

    def test_add_to_watchlist_success(self, trading_service, test_user):
        """Test adding stock to watchlist"""
        watchlist_data = WatchlistCreate(symbol="AAPL")
        
        watchlist_item = trading_service.add_to_watchlist(test_user.id, watchlist_data)
        
        assert watchlist_item.symbol == "AAPL"
        assert watchlist_item.user_id == test_user.id

    def test_add_to_watchlist_duplicate(self, trading_service, test_user):
        """Test adding duplicate stock to watchlist"""
        watchlist_data = WatchlistCreate(symbol="AAPL")
        
        # Add first time
        trading_service.add_to_watchlist(test_user.id, watchlist_data)
        
        # Try to add again - should raise error
        with pytest.raises(TradingError):
            trading_service.add_to_watchlist(test_user.id, watchlist_data)

    def test_remove_from_watchlist_success(self, trading_service, test_user):
        """Test removing stock from watchlist"""
        watchlist_data = WatchlistCreate(symbol="AAPL")
        trading_service.add_to_watchlist(test_user.id, watchlist_data)
        
        # Remove from watchlist
        result = trading_service.remove_from_watchlist(test_user.id, "AAPL")
        assert result is None  # Method returns None on success
        
        # Verify it was removed
        watchlist = trading_service.get_user_watchlist(test_user.id)
        aapl_items = [item for item in watchlist if item.symbol == "AAPL"]
        assert len(aapl_items) == 0

    def test_remove_from_watchlist_not_found(self, trading_service, test_user):
        """Test removing non-existent stock from watchlist"""
        with pytest.raises(TradingError):
            trading_service.remove_from_watchlist(test_user.id, "NONEXISTENT")

    def test_get_user_watchlist(self, trading_service, test_user):
        """Test getting user watchlist"""
        # Add multiple stocks
        symbols = ["AAPL", "GOOGL", "MSFT"]
        for symbol in symbols:
            watchlist_data = WatchlistCreate(symbol=symbol)
            trading_service.add_to_watchlist(test_user.id, watchlist_data)
        
        watchlist = trading_service.get_user_watchlist(test_user.id)
        assert len(watchlist) == 3
        watchlist_symbols = [item.symbol for item in watchlist]
        for symbol in symbols:
            assert symbol in watchlist_symbols

    async def test_get_position_by_symbol(self, trading_service, test_user_with_position):
        """Test getting position details for specific symbol"""
        position_detail = trading_service.get_position_by_symbol(test_user_with_position.id, "AAPL")
        
        assert position_detail is not None
        assert position_detail.symbol == "AAPL"
        assert position_detail.quantity == 10
        assert position_detail.average_price == 150.0

    async def test_get_position_by_symbol_not_found(self, trading_service, test_user):
        """Test getting position for symbol user doesn't own"""
        position_detail = trading_service.get_position_by_symbol(test_user.id, "AAPL")
        
        assert position_detail is None  # No position should exist