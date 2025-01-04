# app/services/stock_service.py
import sys
from pathlib import Path
import yfinance as yf
from fastapi import HTTPException
import logging
from typing import Dict, Any
from datetime import datetime

logger = logging.getLogger(__name__)

class StockService:
    async def validate_symbol(self, symbol: str) -> bool:
        """
        Validate if a stock symbol exists.
        """
        try:
            stock = yf.Ticker(symbol)
            info = stock.info
            return bool(info)
        except Exception:
            return False

    async def get_stock_price(self, symbol: str) -> Dict[str, Any]:
        """
        Get current stock price and basic info.
        This is what we'll use for real-time updates and trade execution.
        """
        try:
            if not await self.validate_symbol(symbol):
                raise HTTPException(status_code=404, detail=f"Invalid stock symbol: {symbol}")
            
            stock = yf.Ticker(symbol)
            info = stock.info
            
            # Try different price fields that yfinance might use
            price = (
                info.get("currentPrice") or 
                info.get("regularMarketPrice") or 
                info.get("previousClose") or 
                info.get("last", 0)
            )

            # Get market change data
            change = info.get("regularMarketChange", 0) or info.get("change", 0)
            change_percent = info.get("regularMarketChangePercent", 0) or info.get("changePercent", 0)
            
            return {
                "symbol": symbol,
                "current_price": price,
                "change": change,
                "change_percent": change_percent,
                "timestamp": datetime.now().isoformat(),
            }
        except Exception as e:
            logger.error(f"Error fetching stock price for {symbol}: {str(e)}")
            raise HTTPException(status_code=400, detail=str(e))

    async def get_stock_history(self, symbol: str, timeframe: str = "1d") -> Dict[str, Any]:
        """
        Get historical price data for charting.
        timeframe options: 1d, 5d, 1mo, 3mo, 6mo, 1y, max
        """
        try:
            if not await self.validate_symbol(symbol):
                raise HTTPException(status_code=404, detail=f"Invalid stock symbol: {symbol}")
            
            stock = yf.Ticker(symbol)
            # Use 1m intervals for intraday, 1d for longer periods
            interval = "1m" if timeframe == "1d" else "1d"
            df = stock.history(period=timeframe, interval=interval)
            
            return {
                "symbol": symbol,
                "timeframe": timeframe,
                "data": {
                    "timestamps": df.index.strftime('%Y-%m-%d %H:%M:%S').tolist(),
                    "prices": df['Close'].tolist()
                }
            }
        except Exception as e:
            logger.error(f"Error fetching history for {symbol}: {str(e)}")
            raise HTTPException(status_code=400, detail=str(e))


# # DEBUGGING
# if __name__ == "__main__":
#     import asyncio
#     stock_service = StockService()

#     async def main():
#         try:
#             # Validate symbol
#             is_valid = await stock_service.validate_symbol("AAPL")
#             print("Symbol Validity:", is_valid)
            
#             # Get stock price
#             stock_price = await stock_service.get_stock_price("AAPL")
#             print("Stock Price Data:", stock_price)
            
#             # Get historical data
#             historical_data = await stock_service.get_stock_history("AAPL", timeframe="5d")
#             print("Historical Data:", historical_data)
#         except HTTPException as e:
#             print(f"HTTPException: {e.detail}")

#     asyncio.run(main())