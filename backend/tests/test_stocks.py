import pytest
from fastapi import status
from unittest.mock import patch, MagicMock

from app.domains.stocks.services import StockService, StockError


class TestStocksAPI:
    """Test stocks API endpoints"""
    
    def test_get_stock_quote_unauthorized(self, client):
        """Test getting stock quote without auth"""
        response = client.get("/stocks/quote/AAPL")
        assert response.status_code == status.HTTP_403_FORBIDDEN

    @patch('app.domains.stocks.services.StockService.get_current_price')
    def test_get_stock_quote_success(self, mock_get_price, client, authenticated_user):
        """Test successful stock quote retrieval"""
        mock_get_price.return_value = {
            "symbol": "AAPL",
            "current_price": 150.0,
            "company_name": "Apple Inc.",
            "change": 2.5,
            "change_percent": 1.69,
            "volume": 50000000,
            "market_cap": 2500000000000
        }
        
        response = client.get(
            "/stocks/quote/AAPL",
            headers=authenticated_user["headers"]
        )
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["symbol"] == "AAPL"
        assert data["current_price"] == 150.0
        assert data["company_name"] == "Apple Inc."

    @patch('app.domains.stocks.services.StockService.get_current_price')
    def test_get_stock_quote_invalid_symbol(self, mock_get_price, client, authenticated_user):
        """Test stock quote for invalid symbol"""
        mock_get_price.side_effect = StockError("Invalid symbol")
        
        response = client.get(
            "/stocks/quote/INVALID",
            headers=authenticated_user["headers"]
        )
        
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    @patch('app.domains.stocks.services.StockService.get_stock_data')
    def test_get_stock_data_success(self, mock_get_data, client, authenticated_user):
        """Test successful stock data retrieval"""
        mock_get_data.return_value = {
            "symbol": "AAPL",
            "company_name": "Apple Inc.",
            "current_price": 150.0,
            "previous_close_price": 148.0,
            "market_capitalization": 2500000000000,
            "timestamp": "2024-01-01T12:00:00"
        }
        
        response = client.get(
            "/stocks/AAPL",
            headers=authenticated_user["headers"]
        )
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["symbol"] == "AAPL"
        assert data["company_name"] == "Apple Inc."

    @patch('app.domains.stocks.services.StockService.get_stock_data')
    def test_get_stock_data_invalid_symbol(self, mock_get_data, client, authenticated_user):
        """Test stock data for invalid symbol"""
        mock_get_data.side_effect = Exception("Invalid symbol")
        
        response = client.get(
            "/stocks/INVALID",
            headers=authenticated_user["headers"]
        )
        
        assert response.status_code == status.HTTP_404_NOT_FOUND

    @patch('app.domains.stocks.services.StockService.get_market_indices')
    def test_get_market_indices_success(self, mock_get_indices, client, authenticated_user):
        """Test successful market indices retrieval"""
        from app.domains.stocks.schemas import MarketIndicesResponse, MarketIndex
        
        mock_indices = [
            MarketIndex(
                symbol="^DJI",
                ticker="^DJI",
                value=34000.0,
                change=100.0,
                percent=0.29
            ),
            MarketIndex(
                symbol="^GSPC",
                ticker="^GSPC", 
                value=4300.0,
                change=15.0,
                percent=0.35
            )
        ]
        mock_get_indices.return_value = MarketIndicesResponse(indices=mock_indices)
        
        response = client.get(
            "/stocks/market/indices",
            headers=authenticated_user["headers"]
        )
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert "indices" in data
        assert len(data["indices"]) == 2
        assert data["indices"][0]["symbol"] == "^DJI"

    @patch('app.domains.stocks.services.StockService.get_market_movers')
    def test_get_market_movers_success(self, mock_get_movers, client, authenticated_user):
        """Test successful market movers retrieval"""
        from app.domains.stocks.schemas import MarketMoversResponse, MarketMover
        
        gainers = [
            MarketMover(
                symbol="AAPL",
                name="Apple Inc.",
                price=155.0,
                change=5.0,
                change_percent=3.33
            )
        ]
        losers = [
            MarketMover(
                symbol="GOOGL",
                name="Alphabet Inc.",
                price=2450.0,
                change=-50.0,
                change_percent=-2.0
            )
        ]
        mock_get_movers.return_value = MarketMoversResponse(gainers=gainers, losers=losers)
        
        response = client.get(
            "/stocks/market/movers",
            headers=authenticated_user["headers"]
        )
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert "gainers" in data
        assert "losers" in data
        assert len(data["gainers"]) == 1
        assert len(data["losers"]) == 1

