# app/domains/stocks/external.py

import yfinance as yf
import asyncio
import logging
from typing import Dict, List, Optional
from datetime import datetime

from app.domains.stocks.schemas import StockData, MarketIndex, MarketMover

logger = logging.getLogger(__name__)

class YFinanceClient:
    """Clean wrapper for Yahoo Finance API calls"""
    
    # Predefined indices - no need to query for names
    INDICES = {
        "^GSPC": "S&P 500",
        "^DJI": "Dow Jones", 
        "^IXIC": "NASDAQ",
        "^VIX": "VIX"
    }
    
    async def get_stock_data(self, symbol: str) -> Optional[StockData]:
        """Get comprehensive stock data including company name"""
        try:
            ticker = yf.Ticker(symbol)
            info = ticker.info
            hist = ticker.history(period="2d")
            
            if hist.empty:
                return None
            
            current_price = hist['Close'].iloc[-1]
            previous_close = hist['Close'].iloc[-2] if len(hist) > 1 else current_price
            
            return StockData(
                symbol=symbol.upper(),
                company_name=info.get('longName', info.get('shortName', symbol)),
                current_price=float(current_price),
                previous_close_price=float(previous_close),
                market_capitalization=self._format_market_cap(info.get('marketCap', 0)),
                timestamp=datetime.now().isoformat()
            )
            
        except Exception as e:
            logger.error(f"Error fetching stock data for {symbol}: {e}")
            return None
    
    async def get_current_price(self, symbol: str) -> Optional[float]:
        """Get current price only - no company info needed"""
        try:
            ticker = yf.Ticker(symbol)
            hist = ticker.history(period="1d")
            return float(hist['Close'].iloc[-1]) if not hist.empty else None
        except Exception as e:
            logger.error(f"Error fetching price for {symbol}: {e}")
            return None
    
    async def get_market_indices(self) -> List[MarketIndex]:
        """Get market indices - use predefined names, just fetch prices in parallel"""

        async def _fetch_index(symbol: str, name: str):
            try:
                hist = yf.Ticker(symbol).history(period="2d")

                if hist.empty:
                    return None

                current = hist['Close'].iloc[-1]
                previous = hist['Close'].iloc[-2] if len(hist) > 1 else current
                change = current - previous
                percent = (change / previous) * 100 if previous != 0 else 0

                return MarketIndex(
                    symbol=name,
                    ticker=symbol,
                    value=float(current),
                    change=float(change),
                    percent=float(percent)
                )
            except Exception as e:
                logger.error(f"Error fetching index {symbol}: {e}")
                return None

        results = await asyncio.gather(*[
            _fetch_index(symbol, name) for symbol, name in self.INDICES.items()
        ])

        return [r for r in results if r is not None]
    
    async def get_market_movers(self) -> Dict[str, List[MarketMover]]:
        """Get top gainers and losers with company names"""
        return {
            'gainers': self._get_screener_data('day_gainers'),
            'losers': self._get_screener_data('day_losers')
        }
    
    async def validate_symbol(self, symbol: str) -> bool:
        """Check if symbol is valid"""
        try:
            info = yf.Ticker(symbol).info
            return bool(info.get('symbol') or info.get('shortName'))
        except:
            return False
    
    def _format_market_cap(self, market_cap: int) -> str:
        """Format market cap with appropriate suffix"""
        if not market_cap:
            return "N/A"
        
        if market_cap >= 1e12:
            return f"${market_cap/1e12:.2f}T"
        elif market_cap >= 1e9:
            return f"${market_cap/1e9:.2f}B" 
        elif market_cap >= 1e6:
            return f"${market_cap/1e6:.2f}M"
        else:
            return f"${market_cap:,.0f}"
    
    def _get_screener_data(self, screen_type: str) -> List[MarketMover]:
        """Get data from yfinance screener including company names"""
        try:
            results = yf.screen(screen_type)
            
            if not results or 'quotes' not in results:
                return []
            
            movers = []
            for stock in results['quotes'][:10]:  # Top 10
                movers.append(MarketMover(
                    symbol=stock.get('symbol', ''),
                    name=stock.get('longName', stock.get('shortName', stock.get('symbol', ''))),
                    price=float(stock.get('regularMarketPrice', 0)),
                    change=float(stock.get('regularMarketChange', 0)),
                    change_percent=float(stock.get('regularMarketChangePercent', 0))
                ))
            
            return movers
            
        except Exception as e:
            logger.error(f"Error fetching {screen_type}: {e}")
            return []