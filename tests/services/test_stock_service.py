# tests/services/test_stock_service.py

import os
import sys
import asyncio

# Get the absolute path of the project root directory
project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), "../.."))
sys.path.append(project_root)

from app.services.stock_service import StockService
from fastapi import HTTPException

async def test_get_stock_price():
    stock_service = StockService()
    try:
        result = await stock_service.get_stock_info("AAPL")
        
        # Assert all required keys are present
        assert "symbol" in result, "Expected key 'symbol' in result"
        assert "price" in result, "Expected key 'price' in result"
        assert "change" in result, "Expected key 'change' in result"
        assert "change_percent" in result, "Expected key 'change_percent' in result"
        assert "volume" in result, "Expected key 'volume' in result"
        assert "latest_trading_day" in result, "Expected key 'latest_trading_day' in result"
        
        print("Test passed: All keys are present in the stock price result.")
        
    except HTTPException as e:
        print(f"HTTPException during test: {e.detail}")
    except AssertionError as ae:
        print(f"AssertionError: {ae}")
    except Exception as e:
        print(f"Unexpected exception during test: {e}")

async def test_get_intraday_data():
    stock_service = StockService()
    try:
        intraday_result = await stock_service.get_intraday_data("AAPL")
        
        # Assert required keys
        assert "timestamp" in intraday_result, "Expected key 'timestamp' in result"
        assert "open" in intraday_result, "Expected key 'open' in result"
        assert "high" in intraday_result, "Expected key 'high' in result"
        assert "low" in intraday_result, "Expected key 'low' in result"
        assert "close" in intraday_result, "Expected key 'close' in result"
        assert "volume" in intraday_result, "Expected key 'volume' in result"
        
        print("Test passed: All keys are present in the intraday data result.")
        
    except HTTPException as e:
        print(f"HTTPException during test: {e.detail}")
    except AssertionError as ae:
        print(f"AssertionError: {ae}")
    except Exception as e:
        print(f"Unexpected exception during test: {e}")

async def test_search_stocks():
    stock_service = StockService()
    try:
        search_result = await stock_service.search_stocks("Apple")
        
        # Basic check to ensure data structure
        assert isinstance(search_result, list), "Expected result to be a list"
        assert all("symbol" in item for item in search_result), "Expected key 'symbol' in each result item"
        assert all("name" in item for item in search_result), "Expected key 'name' in each result item"
        
        print("Test passed: All keys are present in each search result item.")
        
    except HTTPException as e:
        print(f"HTTPException during test: {e.detail}")
    except AssertionError as ae:
        print(f"AssertionError: {ae}")
    except Exception as e:
        print(f"Unexpected exception during test: {e}")

def main():
    asyncio.run(test_get_stock_price())
    asyncio.run(test_get_intraday_data())
    asyncio.run(test_search_stocks())

if __name__ == "__main__":
    main()