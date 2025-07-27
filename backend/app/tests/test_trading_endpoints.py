# app/tests/test_trading_endpoints.py
import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from app.main import app
from app.db.base import Base, engine, get_db
from app.models.user import User
from app.core.security import get_password_hash, create_access_token
from datetime import timedelta
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Test database setup
def override_get_db():
    try:
        db = Session(bind=engine)
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

@pytest.fixture(scope="module")
def test_db():
    Base.metadata.drop_all(bind=engine)  # Clean up before tests
    Base.metadata.create_all(bind=engine)
    yield Session(bind=engine)
    Base.metadata.drop_all(bind=engine)  # Clean up after tests

@pytest.fixture(scope="module")
def client():
    return TestClient(app)

@pytest.fixture(scope="module")
def test_user_token(test_db):
    # Create test user
    user = User(
        email="test_trader@example.com",
        username="test_trader",
        first_name="Test",
        last_name="Trader",
        hashed_password=get_password_hash("testpass123"),
        cash_balance=100000.0  # $100,000 starting balance
    )
    test_db.add(user)
    test_db.commit()
    test_db.refresh(user)
    
    # Create access token
    access_token = create_access_token(
        data={"sub": user.email},
        expires_delta=timedelta(minutes=30)
    )
    
    return {"Authorization": f"Bearer {access_token}"}

def test_create_buy_order(client, test_user_token):
    """Test creating a buy order"""
    initial_portfolio = client.get(
        "/api/v1/trading/portfolio",
        headers=test_user_token
    ).json()
    print(f"Initial portfolio: {initial_portfolio}")

    order_data = {
        "symbol": "AAPL",
        "shares": 10,
        "activity_type": "BUY"
    }
    
    response = client.post(
        "/api/v1/trading/orders",
        json=order_data,
        headers=test_user_token
    )
    print(f"Buy order response: {response.json()}")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"

    # Verify position was created
    updated_portfolio = client.get(
        "/api/v1/trading/portfolio",
        headers=test_user_token
    ).json()
    print(f"Updated portfolio: {updated_portfolio}")
    
    # Find AAPL position
    aapl_position = next(
        (pos for pos in updated_portfolio["positions"] if pos["symbol"] == "AAPL"),
        None
    )
    assert aapl_position is not None
    assert aapl_position["shares"] == 10

def test_get_portfolio(client, test_user_token):
    """Test getting portfolio summary"""
    response = client.get(
        "/api/v1/trading/portfolio",
        headers=test_user_token
    )
    print(f"Portfolio response: {response.json()}")
    assert response.status_code == 200
    data = response.json()
    assert "positions" in data
    assert "cash_balance" in data
    assert "portfolio_value" in data
    assert isinstance(data["positions"], list)

def test_get_position(client, test_user_token):
    """Test getting position for a specific symbol"""
    response = client.get(
        "/api/v1/trading/portfolio/AAPL",
        headers=test_user_token
    )
    print(f"Position response: {response.json()}")
    assert response.status_code == 200
    data = response.json()
    assert data["symbol"] == "AAPL"
    assert data["shares"] > 0

def test_create_sell_order_insufficient_shares(client, test_user_token):
    """Test creating a sell order with insufficient shares"""
    # First verify no position exists
    portfolio_response = client.get(
        "/api/v1/trading/portfolio",
        headers=test_user_token
    )
    print(f"Current portfolio: {portfolio_response.json()}")

    order_data = {
        "symbol": "MSFT",  # Haven't bought any MSFT
        "shares": 10,
        "activity_type": "SELL"
    }
    
    response = client.post(
        "/api/v1/trading/orders",
        json=order_data,
        headers=test_user_token
    )
    print(f"Sell order response status: {response.status_code}")
    print(f"Sell order response: {response.json()}")
    
    error_detail = response.json().get("detail", "").lower()
    assert any(phrase in error_detail for phrase in ["insufficient", "not enough", "no position"])
    assert response.status_code in [400, 500]  # Accept either status code

def test_complete_trade_cycle(client, test_user_token):
    """Test a complete buy and sell cycle"""
    symbol = "GOOGL"
    shares = 5

    # Get initial portfolio
    initial_portfolio = client.get(
        "/api/v1/trading/portfolio",
        headers=test_user_token
    ).json()
    initial_cash = initial_portfolio["cash_balance"]
    print(f"Initial portfolio: {initial_portfolio}")

    # Buy order
    buy_order = {
        "symbol": symbol,
        "shares": shares,
        "activity_type": "BUY"
    }
    
    buy_response = client.post(
        "/api/v1/trading/orders",
        json=buy_order,
        headers=test_user_token
    )
    print(f"Buy response: {buy_response.json()}")
    assert buy_response.status_code == 200
    
    # Verify position
    position_response = client.get(
        f"/api/v1/trading/portfolio/{symbol}",
        headers=test_user_token
    )
    print(f"Position after buy: {position_response.json()}")
    assert position_response.status_code == 200
    position_data = position_response.json()
    assert position_data["shares"] == shares
    
    # Sell order
    sell_order = {
        "symbol": symbol,
        "shares": shares,
        "activity_type": "SELL"
    }
    
    sell_response = client.post(
        "/api/v1/trading/orders",
        json=sell_order,
        headers=test_user_token
    )
    print(f"Sell response: {sell_response.json()}")
    assert sell_response.status_code == 200

    # Verify position is closed
    final_position_response = client.get(
        f"/api/v1/trading/portfolio/{symbol}",
        headers=test_user_token
    )
    print(f"Final position: {final_position_response.json()}")
    final_position = final_position_response.json()
    assert final_position["shares"] == 0

    # Verify cash balance changes
    final_portfolio = client.get(
        "/api/v1/trading/portfolio",
        headers=test_user_token
    ).json()
    print(f"Final portfolio: {final_portfolio}")
    final_cash = final_portfolio["cash_balance"]
    
    # Cash should be roughly the same (minus any price changes)
    assert abs(final_cash - initial_cash) < 1000  # Allow for small price changes

if __name__ == "__main__":
    pytest.main(["-v", __file__])