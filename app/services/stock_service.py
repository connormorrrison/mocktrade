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
            # print(f"data: {data}")

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

    async def get_intraday_data(self, symbol: str) -> Dict[str, List]:
        """
        Get intraday trading data for a given symbol.
        """
        try:
            data, meta = self.client.get_intraday(symbol, interval="5min", outputsize="compact")
            df = data.head(100)     # Last 100 data points
            
            # DEBUGGING
            # print(f"df: {df}")
            # print(f"timestamp: {df.index.strftime('%Y-%m-%d %H:%M:%S').tolist()}")
            # print(f"open: {df['1. open'].tolist()}")
            # print(f"high: {df['2. high'].tolist()}")
            # print(f"low: {df['3. low'].tolist()}")
            # print(f"close: {df['4. close'].tolist()}")
            # print(f"volume: {df['5. volume'].tolist()}")

            return {
                "timestamp": df.index.strftime('%Y-%m-%d %H:%M:%S').tolist(),
                "open": df['1. open'].tolist(),
                "high": df['2. high'].tolist(),
                "low": df['3. low'].tolist(),
                "close": df['4. close'].tolist(),
                "volume": df['5. volume'].tolist()
            }
        
        except Exception as e:
            logger.error(f"Error fetching intraday data for {symbol}: {str(e)}")
            raise HTTPException(status_code=400, detail=f"Error fetching intraday data: {str(e)}")

    async def search_stocks(self, query: str) -> List[Dict[str, str]]:
        """
        Search for stocks by symbol or name.
        """
        try:
            # Using Alpha Vantage's symbol search endpoint
            ts = TimeSeries(key=settings.ALPHA_VANTAGE_API_KEY, output_format="json")
            data, meta = ts.get_symbol_search(query)

            # DEBUGGING
            # print(f"query: {query}")
            # print(f"data: {data}")
            # print(f"meta: {meta}")

            result = []
            for item in data:
                result.append({
                    "symbol": item["1. symbol"],
                    "name": item["2. name"],
                    "type": item["3. type"],
                    "region": item["4. region"],
                    "market_open": item["5. marketOpen"],
                    "market_close": item["6. marketClose"],
                    "timezone": item["7. timezone"],
                    "currency": item["8. currency"]
                })
            
            return result
        
        except Exception as e:
            logger.error(f"Error searching stocks with query {query}: {str(e)}")
            raise HTTPException(status_code=400, detail=f"Error searching stocks: {str(e)}")

# # DEBUGGING
if __name__ == "__main__":
    import asyncio

    stock_service = StockService()

    async def test_api():
        try:
            # Test for get_stock_price function
            result = await stock_service.get_stock_price("AAPL")
            print("Stock Price Data:", result)

            # Test for get_intraday_data function
            intraday_result = await stock_service.get_intraday_data("AAPL")
            print("Intraday Data:", intraday_result)

            # Test for search_stocks function
            search_result = await stock_service.search_stocks("Apple")
            print("Search Result:", search_result)

        except HTTPException as e:
            print(f"HTTPException: {e.detail}")

    asyncio.run(test_api())