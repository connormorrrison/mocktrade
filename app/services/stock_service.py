# app/services/stock_service.py

import sys
import os
from pathlib import Path

# Add the project root directory to Python path
project_root = str(Path(__file__).parent.parent.parent)
sys.path.append(project_root)

from alpha_vantage.timeseries import TimeSeries
from app.core.config import settings
import pandas as pd
from fastapi import HTTPException
import logging
from typing import Dict, Any, List

logger = logging.getLogger(__name__)

class StockService:
    def __init__(self):
        self.client = TimeSeries(key=settings.ALPHA_VANTAGE_API_KEY, output_format="pandas")
        self._cache = {}    # Simple in-memory cache

    async def get_stock_price(self, symbol: str) -> Dict[str, Any]:
        """
        Get the latest stock price for a given symbol.
        """
        try:
            data, meta = self.client.get_quote_endpoint(symbol)

            # DEBUGGING
            # print("Raw Data:")
            # print(data)

            return {
                "symbol": symbol,
                "price": float(data["05. price"].iloc[0]),
                "change": float(data["09. change"].iloc[0]),
                "change_percent": float(data["10. change percent"].iloc[0].strip("%")),
                "volume": int(data["06. volume"].iloc[0]),
                "latest_trading_day": data["07. latest trading day"].iloc[0]
            }
        except Exception as e:
            logger.error(f"Error fetching stock prices for {symbol}: {str(e)}")
            raise HTTPException(status_code=400, detail=f"Error fetching stock data: {str(e)}")

# DEBUG
# if __name__ == "__main__":
#     import asyncio

#     stock_service = StockService()

#     async def test_api():
#         try:
#             result = await stock_service.get_stock_price("MSFT")
#             print("Stock Price Data:", result)
#         except HTTPException as e:
#             print(f"HTTPException: {e.detail}")

#     asyncio.run(test_api())