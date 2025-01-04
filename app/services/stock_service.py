# app/services/stock_service.py
import yfinance as yf
from fastapi import HTTPException
import logging
from typing import Dict, Any
from datetime import datetime

logger = logging.getLogger(__name__)

class StockService:
    async def get_stock_price(self, symbol: str) -> Dict[str, Any]:
        """Get current stock price and basic info"""
        try:
            logger.info(f"Fetching stock price for {symbol}")
            
            # Create a Ticker object
            stock = yf.Ticker(symbol)
            
            try:
                # Try to get the current price directly from real-time data
                current = stock.history(period='1d')
                if not current.empty:
                    price = current['Close'].iloc[-1]
                    change = current['Close'].iloc[-1] - current['Open'].iloc[0]
                    change_percent = (change / current['Open'].iloc[0]) * 100
                else:
                    raise ValueError("No price data available")
                
            except Exception as e:
                logger.warning(f"Failed to get real-time data, falling back to info: {e}")
                # Fall back to info data if real-time fails
                info = stock.info
                price = info.get('regularMarketPrice', 0)
                change = info.get('regularMarketChange', 0)
                change_percent = info.get('regularMarketChangePercent', 0)

            if not price:
                logger.warning(f"No price data available for {symbol}")
                raise HTTPException(
                    status_code=400,
                    detail=f"No price data available for {symbol}"
                )

            return {
                "symbol": symbol,
                "current_price": float(price),
                "change": float(change),
                "change_percent": float(change_percent),
                "timestamp": datetime.now().isoformat()
            }

        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error fetching stock price for {symbol}: {str(e)}")
            raise HTTPException(
                status_code=400,
                detail=f"Failed to fetch stock data: {str(e)}"
            )