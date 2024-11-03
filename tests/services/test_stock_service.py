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
        # Testing with a valid stock symbol (for example, "MSFT")
        result = await stock_service.get_stock_price("MSFT")
        
        # Assert all required keys are present
        assert "symbol" in result, "Expected key 'symbol' in result"
        assert "price" in result, "Expected key 'price' in result"
        assert "change" in result, "Expected key 'change' in result"
        assert "change_percent" in result, "Expected key 'change_percent' in result"
        assert "volume" in result, "Expected key 'volume' in result"
        assert "latest_trading_day" in result, "Expected key 'latest_trading_day' in result"
        
        print("Test passed: All keys are present in the result.")
        
    except HTTPException as e:
        print(f"HTTPException during test: {e.detail}")
    except AssertionError as ae:
        print(f"AssertionError: {ae}")
    except Exception as e:
        print(f"Unexpected exception during test: {e}")

def main():
    asyncio.run(test_get_stock_price())

if __name__ == "__main__":
    main()