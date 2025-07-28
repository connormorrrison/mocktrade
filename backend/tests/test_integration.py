import pytest
from fastapi import status
from unittest.mock import patch


class TestIntegrationFlows:
    """Test complete integration flows across domains"""
    
    def test_user_registration_and_portfolio_creation_flow(self, client, sample_user_data):
        """Test complete user registration flow with portfolio creation"""
        # Register user
        response = client.post("/auth/register", json=sample_user_data)
        assert response.status_code == status.HTTP_200_OK
        user_data = response.json()
        
        # Login user
        login_response = client.post(
            "/auth/login",
            data={
                "username": sample_user_data["email"],
                "password": sample_user_data["password"]
            }
        )
        assert login_response.status_code == status.HTTP_200_OK
        token = login_response.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        
        # Check initial portfolio
        portfolio_response = client.get("/portfolio/summary", headers=headers)
        assert portfolio_response.status_code == status.HTTP_200_OK
        portfolio = portfolio_response.json()
        assert portfolio["cash_balance"] == 100000.0
        assert portfolio["positions_value"] == 0.0
        assert portfolio["portfolio_value"] == 100000.0
        assert portfolio["positions_count"] == 0

    @patch('app.domains.stocks.services.StockService.get_current_price')
    def test_complete_trading_flow(self, mock_get_price, client, authenticated_user):
        """Test complete trading flow: buy, hold, sell"""
        # Mock stock price
        mock_get_price.return_value = {"current_price": 150.0}
        
        headers = authenticated_user["headers"]
        
        # Step 1: Buy stocks
        buy_order = {
            "symbol": "AAPL",
            "action": "buy", 
            "quantity": 10
        }
        
        buy_response = client.post(
            "/trading/orders",
            json=buy_order,
            headers=headers
        )
        assert buy_response.status_code == status.HTTP_200_OK
        buy_data = buy_response.json()
        assert buy_data["action"] == "buy"
        assert buy_data["quantity"] == 10
        assert buy_data["remaining_cash"] == 98500.0  # 100000 - (10 * 150)
        
        # Step 2: Check portfolio after buy
        portfolio_response = client.get("/portfolio/summary", headers=headers)
        assert portfolio_response.status_code == status.HTTP_200_OK
        portfolio = portfolio_response.json()
        assert portfolio["cash_balance"] == 98500.0
        assert portfolio["positions_count"] == 1
        
        # Step 3: Check activities
        activities_response = client.get("/trading/activities", headers=headers)
        assert activities_response.status_code == status.HTTP_200_OK
        activities = activities_response.json()
        assert len(activities) == 1
        assert activities[0]["action"] == "buy"
        assert activities[0]["symbol"] == "AAPL"
        
        # Step 4: Sell some stocks
        mock_get_price.return_value = {"current_price": 160.0}  # Price went up
        
        sell_order = {
            "symbol": "AAPL",
            "action": "sell",
            "quantity": 5
        }
        
        sell_response = client.post(
            "/trading/orders",
            json=sell_order,
            headers=headers
        )
        assert sell_response.status_code == status.HTTP_200_OK
        sell_data = sell_response.json()
        assert sell_data["action"] == "sell"
        assert sell_data["quantity"] == 5
        assert sell_data["remaining_cash"] == 99300.0  # 98500 + (5 * 160)
        
        # Step 5: Check final portfolio
        portfolio_response = client.get("/portfolio/summary", headers=headers)
        assert portfolio_response.status_code == status.HTTP_200_OK
        portfolio = portfolio_response.json()
        assert portfolio["cash_balance"] == 99300.0
        assert portfolio["positions_count"] == 1  # Still have 5 shares
        
        # Step 6: Check final activities
        activities_response = client.get("/trading/activities", headers=headers)
        assert activities_response.status_code == status.HTTP_200_OK
        activities = activities_response.json()
        assert len(activities) == 2
        assert activities[1]["action"] == "sell"

    def test_watchlist_management_flow(self, client, authenticated_user):
        """Test complete watchlist management flow"""
        headers = authenticated_user["headers"]
        
        # Step 1: Check empty watchlist
        watchlist_response = client.get("/trading/watchlist", headers=headers)
        assert watchlist_response.status_code == status.HTTP_200_OK
        assert len(watchlist_response.json()) == 0
        
        # Step 2: Add stocks to watchlist
        stocks_to_add = ["AAPL", "GOOGL", "MSFT"]
        
        for symbol in stocks_to_add:
            add_response = client.post(
                "/trading/watchlist",
                json={"symbol": symbol},
                headers=headers
            )
            assert add_response.status_code == status.HTTP_200_OK
            assert add_response.json()["symbol"] == symbol
        
        # Step 3: Check watchlist has all stocks
        watchlist_response = client.get("/trading/watchlist", headers=headers)
        assert watchlist_response.status_code == status.HTTP_200_OK
        watchlist = watchlist_response.json()
        assert len(watchlist) == 3
        watchlist_symbols = [item["symbol"] for item in watchlist]
        for symbol in stocks_to_add:
            assert symbol in watchlist_symbols
        
        # Step 4: Remove one stock
        remove_response = client.delete(
            "/trading/watchlist/GOOGL",
            headers=headers
        )
        assert remove_response.status_code == status.HTTP_200_OK
        
        # Step 5: Check final watchlist
        watchlist_response = client.get("/trading/watchlist", headers=headers)
        assert watchlist_response.status_code == status.HTTP_200_OK
        watchlist = watchlist_response.json()
        assert len(watchlist) == 2
        watchlist_symbols = [item["symbol"] for item in watchlist]
        assert "GOOGL" not in watchlist_symbols
        assert "AAPL" in watchlist_symbols
        assert "MSFT" in watchlist_symbols

    @patch('app.domains.stocks.services.StockService.get_current_price')
    def test_insufficient_funds_flow(self, mock_get_price, client, authenticated_user):
        """Test trading flow with insufficient funds"""
        # Mock very high stock price
        mock_get_price.return_value = {"current_price": 50000.0}
        
        headers = authenticated_user["headers"]
        
        # Try to buy expensive stock
        expensive_order = {
            "symbol": "EXPENSIVE",
            "action": "buy",
            "quantity": 10  # Would cost 500,000 but user only has 100,000
        }
        
        response = client.post(
            "/trading/orders",
            json=expensive_order,
            headers=headers
        )
        
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "insufficient" in response.json()["detail"].lower()
        
        # Verify portfolio unchanged
        portfolio_response = client.get("/portfolio/summary", headers=headers)
        assert portfolio_response.status_code == status.HTTP_200_OK
        portfolio = portfolio_response.json()
        assert portfolio["cash_balance"] == 100000.0
        assert portfolio["positions_count"] == 0

    @patch('app.domains.stocks.services.StockService.get_current_price')
    def test_insufficient_shares_flow(self, mock_get_price, client, authenticated_user):
        """Test selling more shares than owned"""
        # Mock stock price
        mock_get_price.return_value = {"current_price": 150.0}
        
        headers = authenticated_user["headers"]
        
        # First buy some shares
        buy_order = {
            "symbol": "AAPL",
            "action": "buy",
            "quantity": 5
        }
        
        buy_response = client.post(
            "/trading/orders",
            json=buy_order,
            headers=headers
        )
        assert buy_response.status_code == status.HTTP_200_OK
        
        # Try to sell more shares than owned
        sell_order = {
            "symbol": "AAPL",
            "action": "sell",
            "quantity": 10  # More than the 5 owned
        }
        
        sell_response = client.post(
            "/trading/orders",
            json=sell_order,
            headers=headers
        )
        
        assert sell_response.status_code == status.HTTP_400_BAD_REQUEST
        assert "insufficient" in sell_response.json()["detail"].lower()

    def test_user_profile_update_flow(self, client, authenticated_user):
        """Test complete user profile management flow"""
        headers = authenticated_user["headers"]
        
        # Step 1: Get current profile
        profile_response = client.get("/auth/me", headers=headers)
        assert profile_response.status_code == status.HTTP_200_OK
        original_profile = profile_response.json()
        
        # Step 2: Update profile
        update_data = {
            "first_name": "Jane",
            "last_name": "Smith"
        }
        
        update_response = client.put(
            "/auth/profile",
            json=update_data,
            headers=headers
        )
        assert update_response.status_code == status.HTTP_200_OK
        updated_profile = update_response.json()
        assert updated_profile["first_name"] == "Jane"
        assert updated_profile["last_name"] == "Smith"
        assert updated_profile["email"] == original_profile["email"]  # Unchanged
        
        # Step 3: Verify profile was updated
        profile_response = client.get("/auth/me", headers=headers)
        assert profile_response.status_code == status.HTTP_200_OK
        final_profile = profile_response.json()
        assert final_profile["first_name"] == "Jane"
        assert final_profile["last_name"] == "Smith"

    def test_password_change_flow(self, client, authenticated_user):
        """Test complete password change flow"""
        headers = authenticated_user["headers"]
        original_password = authenticated_user["user_data"]["password"]
        
        # Step 1: Change password
        password_data = {
            "current_password": original_password,
            "new_password": "newpassword123"
        }
        
        change_response = client.post(
            "/auth/change-password",
            json=password_data,
            headers=headers
        )
        assert change_response.status_code == status.HTTP_200_OK
        
        # Step 2: Try logging in with old password (should fail)
        old_login_response = client.post(
            "/auth/login",
            data={
                "username": authenticated_user["user_data"]["email"],
                "password": original_password
            }
        )
        assert old_login_response.status_code == status.HTTP_401_UNAUTHORIZED
        
        # Step 3: Login with new password (should succeed)
        new_login_response = client.post(
            "/auth/login",
            data={
                "username": authenticated_user["user_data"]["email"],
                "password": "newpassword123"
            }
        )
        assert new_login_response.status_code == status.HTTP_200_OK
        assert "access_token" in new_login_response.json()

    @patch('app.domains.stocks.services.StockService.get_current_price')
    def test_multiple_stock_positions_flow(self, mock_get_price, client, authenticated_user):
        """Test managing multiple stock positions"""
        headers = authenticated_user["headers"]
        
        # Mock different stock prices
        def price_side_effect(symbol):
            prices = {
                "AAPL": {"current_price": 150.0},
                "GOOGL": {"current_price": 2500.0},
                "MSFT": {"current_price": 300.0}
            }
            return prices.get(symbol, {"current_price": 100.0})
        
        mock_get_price.side_effect = price_side_effect
        
        # Buy multiple different stocks
        orders = [
            {"symbol": "AAPL", "action": "buy", "quantity": 10},
            {"symbol": "GOOGL", "action": "buy", "quantity": 2},
            {"symbol": "MSFT", "action": "buy", "quantity": 5}
        ]
        
        total_spent = 0
        for order in orders:
            response = client.post(
                "/trading/orders",
                json=order,
                headers=headers
            )
            assert response.status_code == status.HTTP_200_OK
            
            # Calculate expected cost
            price = price_side_effect(order["symbol"])["current_price"]
            total_spent += order["quantity"] * price
        
        # Check final portfolio
        portfolio_response = client.get("/portfolio/summary", headers=headers)
        assert portfolio_response.status_code == status.HTTP_200_OK
        portfolio = portfolio_response.json()
        
        expected_cash = 100000.0 - total_spent
        assert portfolio["cash_balance"] == expected_cash
        assert portfolio["positions_count"] == 3
        
        # Check activities show all trades
        activities_response = client.get("/trading/activities", headers=headers)
        assert activities_response.status_code == status.HTTP_200_OK
        activities = activities_response.json()
        assert len(activities) == 3
        
        symbols_traded = [activity["symbol"] for activity in activities]
        assert "AAPL" in symbols_traded
        assert "GOOGL" in symbols_traded  
        assert "MSFT" in symbols_traded

    def test_account_deletion_flow(self, client, authenticated_user):
        """Test complete account deletion flow"""
        headers = authenticated_user["headers"]
        
        # Step 1: Verify account is active
        profile_response = client.get("/auth/me", headers=headers)
        assert profile_response.status_code == status.HTTP_200_OK
        assert profile_response.json()["is_active"] is True
        
        # Step 2: Delete account
        delete_response = client.delete("/auth/me", headers=headers)
        assert delete_response.status_code == status.HTTP_200_OK
        assert "deleted" in delete_response.json()["message"].lower()
        
        # Step 3: Try to access profile (should fail)
        profile_response = client.get("/auth/me", headers=headers)
        assert profile_response.status_code == status.HTTP_401_UNAUTHORIZED
        
        # Step 4: Try to login (should fail - account deactivated)
        login_response = client.post(
            "/auth/login",
            data={
                "username": authenticated_user["user_data"]["email"],
                "password": authenticated_user["user_data"]["password"]
            }
        )
        assert login_response.status_code == status.HTTP_401_UNAUTHORIZED


class TestErrorHandlingIntegration:
    """Test error handling across domain boundaries"""
    
    def test_invalid_token_across_endpoints(self, client):
        """Test that invalid tokens are rejected across all protected endpoints"""
        invalid_headers = {"Authorization": "Bearer invalid_token"}
        
        protected_endpoints = [
            ("GET", "/auth/me"),
            ("GET", "/portfolio/summary"),
            ("GET", "/trading/activities"),
            ("GET", "/trading/watchlist"),
            ("GET", "/stocks/quote/AAPL")
        ]
        
        for method, endpoint in protected_endpoints:
            if method == "GET":
                response = client.get(endpoint, headers=invalid_headers)
            elif method == "POST":
                response = client.post(endpoint, headers=invalid_headers)
            
            assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_missing_token_across_endpoints(self, client):
        """Test that missing tokens are rejected across all protected endpoints"""
        protected_endpoints = [
            ("GET", "/auth/me"),
            ("GET", "/portfolio/summary"),
            ("GET", "/trading/activities"),
            ("GET", "/trading/watchlist"),
            ("GET", "/stocks/quote/AAPL")
        ]
        
        for method, endpoint in protected_endpoints:
            if method == "GET":
                response = client.get(endpoint)
            elif method == "POST":
                response = client.post(endpoint)
            
            assert response.status_code == status.HTTP_403_FORBIDDEN

    @patch('app.domains.stocks.services.StockService.get_current_price')
    def test_stock_api_error_handling(self, mock_get_price, client, authenticated_user):
        """Test handling of stock API errors during trading"""
        # Mock stock service to raise exception
        mock_get_price.side_effect = Exception("Stock API Error")
        
        headers = authenticated_user["headers"]
        
        order_data = {
            "symbol": "AAPL",
            "action": "buy",
            "quantity": 10
        }
        
        response = client.post(
            "/trading/orders",
            json=order_data,
            headers=headers
        )
        
        # Should handle the error gracefully
        assert response.status_code in [status.HTTP_400_BAD_REQUEST, status.HTTP_500_INTERNAL_SERVER_ERROR]

    def test_database_transaction_integrity(self, client, authenticated_user):
        """Test that failed operations don't leave database in inconsistent state"""
        headers = authenticated_user["headers"]
        
        # Get initial portfolio state
        initial_portfolio = client.get("/portfolio/summary", headers=headers)
        initial_cash = initial_portfolio.json()["cash_balance"]
        
        # Try to execute invalid order (should fail)
        invalid_order = {
            "symbol": "",  # Invalid symbol
            "action": "buy",
            "quantity": 10
        }
        
        response = client.post(
            "/trading/orders",
            json=invalid_order,
            headers=headers
        )
        
        # Should fail
        assert response.status_code in [status.HTTP_400_BAD_REQUEST, status.HTTP_422_UNPROCESSABLE_ENTITY]
        
        # Verify portfolio state unchanged
        final_portfolio = client.get("/portfolio/summary", headers=headers)
        final_cash = final_portfolio.json()["cash_balance"]
        assert final_cash == initial_cash