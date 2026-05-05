# app/domains/stocks/external.py

import yfinance as yf
import asyncio
import logging
from typing import Dict, List, Optional
from datetime import date, datetime, timedelta

from app.domains.stocks.schemas import StockData, MarketIndex, MarketMover

logger = logging.getLogger(__name__)

class YFinanceClient:
    """Clean wrapper for Yahoo Finance API calls"""
    
    # predefined indices - no need to query for names
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
    
    async def get_historical_closes(
        self, symbols: List[str], start_date: date, end_date: date
    ) -> Dict[str, Dict[date, float]]:
        """Batch-fetch historical closing prices for multiple symbols.

        Returns {symbol: {date: close_price, ...}, ...}.
        Uses a single yf.download() call for efficiency.
        """
        if not symbols:
            return {}

        try:
            # yf.download end is exclusive, so add one day
            # Pass symbols as a space-separated string for consistent behavior
            df = yf.download(
                " ".join(symbols),
                start=start_date.isoformat(),
                end=(end_date + timedelta(days=1)).isoformat(),
                progress=False,
            )

            if df.empty:
                return {}

            result: Dict[str, Dict[date, float]] = {}

            if len(symbols) == 1:
                # Single symbol: columns are flat ['Close', 'High', ...]
                sym = symbols[0]
                result[sym] = {}
                close_col = df["Close"]
                if hasattr(close_col, "columns"):
                    # MultiIndex case — extract the series
                    close_col = close_col.iloc[:, 0]
                for ts, price in close_col.dropna().items():
                    result[sym][ts.date()] = float(price)
            else:
                # Multiple symbols: columns are MultiIndex ('Close', 'AAPL'), ...
                close_df = df["Close"]
                for sym in symbols:
                    if sym not in close_df.columns:
                        continue
                    result[sym] = {}
                    series = close_df[sym].dropna()
                    for ts, price in series.items():
                        result[sym][ts.date()] = float(price)

            return result

        except Exception as e:
            logger.error(f"Error fetching historical closes: {e}")
            raise

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
        except Exception as e:
            logger.error(f"Error validating symbol {symbol}: {e}")
            raise
    
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
            for stock in results['quotes'][:10]:  # top 10
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
