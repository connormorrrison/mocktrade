import asyncio
import logging
from app.api.v1.endpoints.stocks import get_stock_quote, get_stock_history, get_portfolio_history
from fastapi.testclient import TestClient
from app.main import app

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

client = TestClient(app)

def main():
    async def test_stocks_endpoint():
        symbol = "AAPL"
        range_param = "1mo"
        headers = {"Authorization": "Bearer test_token"}  # Mock auth token
        
        print("Testing /quote/{symbol} endpoint...")
        response = client.get(f"/api/v1/stocks/quote/{symbol}", headers=headers)
        if response.status_code == 200:
            print("Stock Quote:", response.json())
        else:
            print("Error fetching stock quote:", response.json())

        print("Testing /history/{symbol} endpoint...")
        response = client.get(f"/api/v1/stocks/history/{symbol}?range={range_param}", headers=headers)
        if response.status_code == 200:
            print("Stock History:", response.json())
        else:
            print("Error fetching stock history:", response.json())

        print("Testing /portfolio/history endpoint...")
        response = client.get("/api/v1/stocks/portfolio/history?range=1mo", headers=headers)
        if response.status_code == 200:
            print("Portfolio History:", response.json())
        else:
            print("Error fetching portfolio history:", response.json())

    asyncio.run(test_stocks_endpoint())

if __name__ == "__main__":
    main()
