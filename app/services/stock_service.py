# app/services/stock_service.py
import yfinance as yf
from fastapi import HTTPException
import logging
from typing import Dict, Any, List
from datetime import datetime, timedelta
import pandas as pd

logger = logging.getLogger(__name__)

class StockService:
    # Keep existing get_stock_price method exactly as is
    async def get_stock_price(self, symbol: str) -> Dict[str, Any]:
        """Get current stock price, historical data and basic info"""
        try:
            logger.info(f"Fetching stock data for {symbol}")
            
            # Create a Ticker object
            stock = yf.Ticker(symbol)
            
            # Get historical data for the past month
            hist_data = stock.history(period='1mo')
            
            if hist_data.empty:
                raise ValueError("No price data available")
            
            # Calculate current price and daily change
            current_price = hist_data['Close'].iloc[-1]
            prev_close = hist_data['Close'].iloc[-2]
            change = current_price - prev_close
            change_percent = (change / prev_close) * 100
            
            # Format historical data
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

    # New method for getting historical data with range
    async def get_stock_history(self, symbol: str, range: str = "1mo") -> Dict[str, Any]:
        """
        Get historical data for a stock with specified range
        range options: 1d,5d,1mo,3mo,6mo,1y,2y,5y,10y,ytd,max
        """
        try:
            logger.info(f"Fetching {range} historical data for {symbol}")
            
            # Validate range parameter
            valid_ranges = ['1d','5d','1mo','3mo','6mo','1y','2y','5y','10y','ytd','max']
            if range not in valid_ranges:
                raise ValueError(f"Invalid range. Must be one of: {', '.join(valid_ranges)}")
            
            stock = yf.Ticker(symbol)
            hist_data = stock.history(period=range)
            
            if hist_data.empty:
                raise ValueError("No historical data available")
            
            # Format historical data
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

            # Get current price info using existing method
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

    async def get_portfolio_historical_data(self, positions: List[Dict], range: str = "1mo") -> Dict[str, Any]:
        """
        Get historical data for all positions in portfolio
        range options: 1d,5d,1mo,3mo,6mo,1y,2y,5y,10y,ytd,max
        """
        try:
            portfolio_history = {}
            
            for position in positions:
                symbol = position['symbol']
                shares = position['shares']
                
                # Use the new get_stock_history method
                stock_data = await self.get_stock_history(symbol, range)
                historical_prices = stock_data['historical_prices']
                
                # Calculate position value over time
                position_history = []
                for price_point in historical_prices:
                    position_history.append({
                        "date": price_point['date'],
                        "value": price_point['close'] * shares
                    })
                
                portfolio_history[symbol] = position_history
            
            return portfolio_history
            
        except Exception as e:
            logger.error(f"Error fetching portfolio historical data: {str(e)}")
            raise HTTPException(
                status_code=400,
                detail=f"Failed to fetch portfolio historical data: {str(e)}"
            )