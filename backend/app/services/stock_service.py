# app/services/stock_service.py

import yfinance as yf
from fastapi import HTTPException
import logging
from typing import Dict, Any, List, Optional
import pytz
from datetime import datetime, timedelta

logger = logging.getLogger(__name__)

class StockService:
    def __init__(self):
        # Simple in-memory cache for market data
        self._market_indices_cache: Optional[Dict[str, Any]] = None
        self._market_indices_cache_time: Optional[datetime] = None
        self._market_movers_cache: Optional[Dict[str, Any]] = None
        self._market_movers_cache_time: Optional[datetime] = None
        self._cache_duration = timedelta(minutes=5)  # Cache for 5 minutes

    def _is_cache_valid(self, cache_time: Optional[datetime]) -> bool:
        """Check if cache is still valid"""
        if cache_time is None:
            return False
        return datetime.now() - cache_time < self._cache_duration

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

            # Get company name and market capitalization
            try:
                company_name = await self.get_company_name(symbol)
            except:
                company_name = symbol
                
            # Get market capitalization
            market_capitalization = await self.get_market_capitalization(symbol)

            return {
                "symbol": symbol,
                "company_name": company_name,
                "current_price": float(current_price),
                "previous_close_price": float(prev_close),
                "market_capitalization": market_capitalization,
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

    async def get_market_indices(self) -> Dict[str, Any]:
        """Get current market indices data (DOW, S&P 500, NASDAQ, VIX)"""
        try:
            # Check cache first
            if self._is_cache_valid(self._market_indices_cache_time) and self._market_indices_cache:
                logger.info("Returning cached market indices data")
                return self._market_indices_cache
                
            logger.info("Fetching fresh market indices data")
            
            indices = {
                "^DJI": "^DJI",
                "^GSPC": "^GSPC", 
                "^IXIC": "^IXIC",
                "^VIX": "^VIX"
            }
            
            indices_data = []
            
            for symbol in indices.keys():
                try:
                    ticker = yf.Ticker(symbol)
                    hist_data = ticker.history(period='2d')  # Get 2 days to calculate change
                    
                    if hist_data.empty:
                        logger.warning(f"No data available for {symbol}")
                        continue
                        
                    current_price = float(hist_data['Close'].iloc[-1])
                    previous_close = float(hist_data['Close'].iloc[-2]) if len(hist_data) > 1 else current_price
                    
                    change = current_price - previous_close
                    change_percent = (change / previous_close) * 100 if previous_close != 0 else 0
                    
                    # Get the actual index name from yfinance
                    try:
                        info = ticker.info
                        index_name = info.get('longName', info.get('shortName', symbol))
                        
                        # If yfinance returns the symbol itself as the name, use fallback
                        if index_name == symbol:
                            fallback_names = {
                                "^DJI": "Dow Jones Industrial Average",
                                "^GSPC": "S&P 500",
                                "^IXIC": "NASDAQ Composite",
                                "^VIX": "^VIX"
                            }
                            index_name = fallback_names.get(symbol, symbol)
                            
                    except Exception as e:
                        logger.warning(f"Could not fetch name for {symbol}: {e}")
                        # Fallback names
                        fallback_names = {
                            "^DJI": "Dow Jones Industrial Average",
                            "^GSPC": "S&P 500",
                            "^IXIC": "NASDAQ Composite",  
                            "^VIX": "^VIX"
                        }
                        index_name = fallback_names.get(symbol, symbol)
                    
                    indices_data.append({
                        "symbol": index_name,
                        "ticker": symbol,
                        "value": current_price,
                        "change": change,
                        "percent": change_percent
                    })
                    
                except Exception as e:
                    logger.error(f"Error fetching data for {symbol}: {str(e)}")
                    continue
            
            result = {
                "indices": indices_data,
                "timestamp": datetime.now().isoformat()
            }
            
            # Cache the result
            self._market_indices_cache = result
            self._market_indices_cache_time = datetime.now()
            
            return result
            
        except Exception as e:
            logger.error(f"Error fetching market indices: {str(e)}")
            raise HTTPException(
                status_code=500,
                detail=f"Failed to fetch market indices: {str(e)}"
            )

    async def get_top_gainers_losers(self) -> Dict[str, Any]:
        """Get top gainers and losers using yfinance screener"""
        try:
            # Check cache first
            if self._is_cache_valid(self._market_movers_cache_time) and self._market_movers_cache:
                logger.info("Returning cached market movers data")
                return self._market_movers_cache
                
            logger.info("Fetching fresh top gainers and losers using yfinance screener")
            
            gainers_data = []
            losers_data = []
            
            try:
                # Get top gainers using yfinance screen function
                gainers_results = yf.screen('day_gainers')
                
                # Parse gainers data
                if gainers_results and 'quotes' in gainers_results:
                    quotes = gainers_results['quotes'][:10]  # Get top 10
                    for stock in quotes:
                        symbol = stock.get('symbol', '')
                        # Try to get company name from the API response first, fallback to our method
                        company_name = stock.get('longName', stock.get('shortName', symbol))
                        if company_name == symbol:
                            # If no name in API response, use our dedicated method
                            try:
                                company_name = await self.get_company_name(symbol)
                            except:
                                company_name = symbol
                        
                        gainers_data.append({
                            "symbol": symbol,
                            "name": company_name,
                            "price": float(stock.get('regularMarketPrice', 0)),
                            "change": float(stock.get('regularMarketChange', 0)),
                            "change_percent": float(stock.get('regularMarketChangePercent', 0))
                        })
                        
            except Exception as e:
                logger.warning(f"Error with yfinance screen for gainers: {str(e)}")
                # Fallback to manual approach if screener fails
                gainers_data = await self._get_manual_movers(is_gainers=True)
            
            try:
                # Get top losers using yfinance screen function
                losers_results = yf.screen('day_losers')
                
                # Parse losers data  
                if losers_results and 'quotes' in losers_results:
                    quotes = losers_results['quotes'][:10]  # Get top 10
                    for stock in quotes:
                        symbol = stock.get('symbol', '')
                        # Try to get company name from the API response first, fallback to our method
                        company_name = stock.get('longName', stock.get('shortName', symbol))
                        if company_name == symbol:
                            # If no name in API response, use our dedicated method
                            try:
                                company_name = await self.get_company_name(symbol)
                            except:
                                company_name = symbol
                        
                        losers_data.append({
                            "symbol": symbol,
                            "name": company_name,
                            "price": float(stock.get('regularMarketPrice', 0)),
                            "change": float(stock.get('regularMarketChange', 0)),
                            "change_percent": float(stock.get('regularMarketChangePercent', 0))
                        })
                        
            except Exception as e:
                logger.warning(f"Error with yfinance screen for losers: {str(e)}")
                # Fallback to manual approach if screener fails
                losers_data = await self._get_manual_movers(is_gainers=False)
            
            result = {
                "gainers": gainers_data,
                "losers": losers_data,
                "timestamp": datetime.now().isoformat()
            }
            
            # Cache the result
            self._market_movers_cache = result
            self._market_movers_cache_time = datetime.now()
            
            return result
            
        except Exception as e:
            logger.error(f"Error fetching top gainers/losers: {str(e)}")
            raise HTTPException(
                status_code=500,
                detail=f"Failed to fetch top gainers/losers: {str(e)}"
            )
    
    async def _get_manual_movers(self, is_gainers: bool = True) -> List[Dict[str, Any]]:
        """Fallback method to get market movers manually"""
        try:
            # Popular stocks to check as fallback
            popular_symbols = [
                "AAPL", "MSFT", "GOOGL", "AMZN", "NVDA", "TSLA", "META", 
                "NFLX", "AMD", "CRM", "UBER", "PYPL", "SNAP", "ROKU", "COIN"
            ]
            
            movers = []
            
            for symbol in popular_symbols:
                try:
                    ticker = yf.Ticker(symbol)
                    hist_data = ticker.history(period='2d')
                    
                    if hist_data.empty or len(hist_data) < 2:
                        continue
                        
                    current_price = float(hist_data['Close'].iloc[-1])
                    previous_close = float(hist_data['Close'].iloc[-2])
                    
                    change = current_price - previous_close
                    change_percent = (change / previous_close) * 100 if previous_close != 0 else 0
                    
                    # Filter based on whether we want gainers or losers
                    if (is_gainers and change > 0) or (not is_gainers and change < 0):
                        # Get company name
                        try:
                            company_name = await self.get_company_name(symbol)
                        except:
                            company_name = symbol
                            
                        movers.append({
                            "symbol": symbol,
                            "name": company_name,
                            "price": current_price,
                            "change": change,
                            "change_percent": change_percent
                        })
                        
                except Exception as e:
                    logger.warning(f"Error fetching data for {symbol}: {str(e)}")
                    continue
            
            # Sort appropriately and return top 9
            if is_gainers:
                movers = sorted(movers, key=lambda x: x['change_percent'], reverse=True)[:9]
            else:
                movers = sorted(movers, key=lambda x: x['change_percent'])[:9]
            
            return movers
            
        except Exception as e:
            logger.error(f"Error in manual movers fallback: {str(e)}")
            return []

    async def get_company_name(self, symbol: str) -> str:
        """Get company name for a given stock symbol"""
        try:
            logger.info(f"Fetching company name for {symbol}")
            ticker = yf.Ticker(symbol)
            info = ticker.info
            company_name = info.get('longName', info.get('shortName', symbol))
            logger.info(f"Found company name for {symbol}: {company_name}")
            return company_name
        except Exception as e:
            logger.warning(f"Could not fetch company name for {symbol}: {e}")
            return symbol  # Return symbol as fallback

    async def get_market_capitalization(self, symbol: str) -> str:
        """Get market capitalization for a given stock symbol"""
        try:
            logger.info(f"Fetching market capitalization for {symbol}")
            ticker = yf.Ticker(symbol)
            info = ticker.info
            market_cap = info.get('marketCap')
            
            if market_cap is None:
                logger.warning(f"No market cap data available for {symbol}")
                return "N/A"
            
            # Format market cap in human-readable format
            if market_cap >= 1_000_000_000_000:  # Trillions
                formatted_cap = f"${market_cap / 1_000_000_000_000:.2f}T"
            elif market_cap >= 1_000_000_000:  # Billions
                formatted_cap = f"${market_cap / 1_000_000_000:.2f}B"
            elif market_cap >= 1_000_000:  # Millions
                formatted_cap = f"${market_cap / 1_000_000:.2f}M"
            else:
                formatted_cap = f"${market_cap:,.0f}"
            
            logger.info(f"Found market cap for {symbol}: {formatted_cap}")
            return formatted_cap
            
        except Exception as e:
            logger.warning(f"Could not fetch market capitalization for {symbol}: {e}")
            return "N/A"
