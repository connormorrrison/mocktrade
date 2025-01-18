# app/services/stock_service.py

import yfinance as yf
from fastapi import HTTPException
import logging
from typing import Dict, Any, List
import pytz
from datetime import datetime

logger = logging.getLogger(__name__)

class StockService:
    async def get_stock_price(self, symbol: str) -> Dict[str, Any]:
        """Get current stock price, historical data and basic info"""
        try:
            logger.info(f"Fetching stock data for {symbol}")
            stock = yf.Ticker(symbol)
            hist_data = stock.history(period='1mo')
            
            if hist_data.empty:
                raise ValueError("No price data available")
            
            current_price = hist_data['Close'].iloc[-1]
            prev_close = hist_data['Close'].iloc[-2]
            change = current_price - prev_close
            change_percent = (change / prev_close) * 100
            
            historical_prices = []
            for date, row in hist_data.iterrows():
                historical_prices.append({
                    "date": date.isoformat(),
                    "open": float(row['Open']),
                    "high": float(row['High']),
                    "low": float(row['Low']),
                    "close": float(row['Close']),
                    "volume": float(row['Volume'])
                })

            return {
                "symbol": symbol,
                "current_price": float(current_price),
                "change": float(change),
                "change_percent": float(change_percent),
                "historical_prices": historical_prices,
                "timestamp": datetime.now().isoformat()
            }

        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error fetching stock data for {symbol}: {str(e)}")
            raise HTTPException(
                status_code=400,
                detail=f"Failed to fetch stock data: {str(e)}"
            )

    async def get_stock_history(self, symbol: str, range: str = "1mo") -> Dict[str, Any]:
        """Get historical data for a stock with specified range."""
        try:
            logger.info(f"Fetching {range} historical data for {symbol}")
            
            valid_ranges = ['1d','5d','1mo','3mo','6mo','1y','2y','5y','10y','ytd','max']
            if range not in valid_ranges:
                raise ValueError(f"Invalid range. Must be one of: {', '.join(valid_ranges)}")
            
            stock = yf.Ticker(symbol)
            hist_data = stock.history(period=range)
            if hist_data.empty:
                raise ValueError("No historical data available")
            
            historical_prices = []
            for date, row in hist_data.iterrows():
                historical_prices.append({
                    "date": date.isoformat(),
                    "open": float(row['Open']),
                    "high": float(row['High']),
                    "low": float(row['Low']),
                    "close": float(row['Close']),
                    "volume": float(row['Volume'])
                })

            current_data = await self.get_stock_price(symbol)
            return {
                "symbol": symbol,
                "current_price": current_data['current_price'],
                "change": current_data['change'],
                "change_percent": current_data['change_percent'],
                "historical_prices": historical_prices,
                "range": range,
                "timestamp": datetime.now().isoformat()
            }

        except Exception as e:
            logger.error(f"Error fetching historical data for {symbol}: {str(e)}")
            raise HTTPException(
                status_code=400,
                detail=f"Failed to fetch historical data: {str(e)}"
            )

    async def get_portfolio_historical_data(
        self, positions: List[Dict[str, Any]], range: str = "1mo"
    ) -> Dict[str, Any]:
        """
        Compare data_date (from yfinance) to created_at 
        with consistent UTC for both.
        """
        try:
            portfolio_history = {}

            for position in positions:
                symbol = position["symbol"]
                shares = position["shares"]
                created_at = position.get("created_at")  # might be naive or aware

                stock_data = await self.get_stock_history(symbol, range)
                historical_prices = stock_data["historical_prices"]

                position_history = []

                # 1) Convert the DB's `created_at` to a Python datetime if needed
                #    If it's already a Python datetime with tzinfo=UTC, great.
                #    If it's a naive datetime, localize it to UTC:
                if isinstance(created_at, str):
                    # If your DB returns strings, parse them:
                    created_at_dt = datetime.fromisoformat(created_at)
                else:
                    created_at_dt = created_at  # already a datetime

                if created_at_dt is not None and created_at_dt.tzinfo is None:
                    # localize as UTC if naive
                    created_at_dt = pytz.UTC.localize(created_at_dt)

                for price_point in historical_prices:
                    date_str = price_point["date"]
                    data_date = datetime.fromisoformat(date_str)

                    # 2) Convert `data_date` to UTC if it has no timezone
                    if data_date.tzinfo is None:
                        data_date = pytz.UTC.localize(data_date)
                    else:
                        # or forcibly .astimezone(pytz.UTC) if it might have an offset
                        data_date = data_date.astimezone(pytz.UTC)

                    # 3) Compare in UTC
                    if created_at_dt is not None:
                        # unify created_at_dt to UTC as well
                        created_at_utc = created_at_dt.astimezone(pytz.UTC)

                        if data_date < created_at_utc:
                            position_value = 0.0
                        else:
                            position_value = price_point["close"] * shares
                    else:
                        # if for some reason we don't have a created_at
                        position_value = price_point["close"] * shares

                    position_history.append({
                        "date": data_date.isoformat(),  # or keep original
                        "value": position_value
                    })

                portfolio_history[symbol] = position_history

            return portfolio_history

        except Exception as e:
            logger.error(f"Error fetching portfolio historical data: {str(e)}")
            raise HTTPException(
                status_code=400,
                detail=f"Failed to fetch portfolio historical data: {str(e)}"
            )
