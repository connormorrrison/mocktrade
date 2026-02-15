# app/domains/stocks/services.py

import logging
from typing import Dict, List, Optional
from datetime import datetime, timedelta

from app.domains.stocks.external import YFinanceClient
from app.domains.stocks.schemas import StockData, MarketIndex, MarketMover, MarketIndicesResponse, MarketMoversResponse
from app.core.exceptions import BusinessLogicError

logger = logging.getLogger(__name__)

class StockError(BusinessLogicError):
    """Base exception for stock domain"""
    pass

class StockService:
    """Business logic for stock data management"""
    
    def __init__(self):
        self.client = YFinanceClient()
        self._cache = {}
        self._cache_duration = timedelta(minutes=5)  # 5 minute cache
    
    async def get_stock_data(self, symbol: str) -> Dict[str, any]:
        """Get complete stock data with caching"""
        cache_key = f"stock_data_{symbol.upper()}"
        
        # check cache
        if self._is_cache_valid(cache_key):
            logger.info(f"Returning cached stock data for {symbol}")
            return self._cache[cache_key]['data']
        
        # fetch fresh data
        stock_data = await self.client.get_stock_data(symbol)
        
        if stock_data:
            result = {
                "symbol": stock_data.symbol,
                "company_name": stock_data.company_name,
                "current_price": stock_data.current_price,
                "previous_close_price": stock_data.previous_close_price,
                "market_capitalization": stock_data.market_capitalization,
                "timestamp": stock_data.timestamp
            }
            
            # cache the result
            self._cache[cache_key] = {
                'data': result,
                'timestamp': datetime.now()
            }
            
            logger.info(f"Fetched fresh stock data for {symbol}")
            return result
        
        raise Exception(f"Could not fetch stock data for {symbol}")
    
    async def get_current_price(self, symbol: str) -> Dict[str, any]:
        """Get current price only - faster endpoint"""
        cache_key = f"price_{symbol.upper()}"
        
        # check cache (shorter cache for prices)
        if self._is_cache_valid(cache_key, duration_minutes=1):
            logger.info(f"Returning cached price for {symbol}")
            return self._cache[cache_key]['data']
        
        # fetch fresh price
        price = await self.client.get_current_price(symbol)
        
        if price is not None:
            result = {
                "symbol": symbol.upper(),
                "current_price": price,
                "timestamp": datetime.now().isoformat()
            }
            
            # cache the result
            self._cache[cache_key] = {
                'data': result,
                'timestamp': datetime.now()
            }
            
            logger.info(f"Fetched fresh price for {symbol}")
            return result
        
        raise Exception(f"Could not fetch price for {symbol}")
    
    async def get_market_indices(self) -> MarketIndicesResponse:
        """Get market indices with caching"""
        cache_key = "market_indices"
        
        # check cache
        if self._is_cache_valid(cache_key):
            logger.info("Returning cached market indices")
            return MarketIndicesResponse(indices=self._cache[cache_key]['data'])
        
        # fetch real market indices data
        try:
            indices_data = await self.client.get_market_indices()
            
            # convert to dict format for caching and response
            indices_list = []
            for index in indices_data:
                indices_list.append({
                    "symbol": index.symbol,
                    "ticker": index.ticker,
                    "value": index.value,
                    "change": index.change,
                    "percent": index.percent
                })
            
            # cache the result
            self._cache[cache_key] = {
                'data': indices_list,
                'timestamp': datetime.now()
            }
            
            logger.info("Fetched fresh market indices from Yahoo Finance")
            return MarketIndicesResponse(indices=indices_list)
            
        except Exception as e:
            logger.error(f"Error fetching market indices: {e}")
            # fall back to empty list on error
            return MarketIndicesResponse(indices=[])
    
    async def get_market_movers(self) -> MarketMoversResponse:
        """Get market movers with caching"""
        cache_key = "market_movers"
        
        # check cache
        if self._is_cache_valid(cache_key):
            logger.info("Returning cached market movers")
            cached_data = self._cache[cache_key]['data']
            return MarketMoversResponse(
                gainers=cached_data['gainers'],
                losers=cached_data['losers']
            )
        
        # fetch real market movers data
        try:
            movers_data = await self.client.get_market_movers()
            
            # convert to dict format for caching and response
            gainers_list = []
            for gainer in movers_data['gainers']:
                gainers_list.append({
                    "symbol": gainer.symbol,
                    "name": gainer.name,
                    "price": gainer.price,
                    "change": gainer.change,
                    "change_percent": gainer.change_percent
                })
            
            losers_list = []
            for loser in movers_data['losers']:
                losers_list.append({
                    "symbol": loser.symbol,
                    "name": loser.name,
                    "price": loser.price,
                    "change": loser.change,
                    "change_percent": loser.change_percent
                })
            
            movers_dict = {
                'gainers': gainers_list,
                'losers': losers_list
            }
            
            # cache the result
            self._cache[cache_key] = {
                'data': movers_dict,
                'timestamp': datetime.now()
            }
            
            logger.info("Fetched fresh market movers from Yahoo Finance")
            return MarketMoversResponse(
                gainers=gainers_list,
                losers=losers_list
            )
            
        except Exception as e:
            logger.error(f"Error fetching market movers: {e}")
            # fall back to empty lists on error
            return MarketMoversResponse(gainers=[], losers=[])
    
    async def validate_symbol(self, symbol: str) -> bool:
        """Validate if a stock symbol exists"""
        cache_key = f"valid_{symbol.upper()}"
        
        # check cache (longer cache for validation)
        if self._is_cache_valid(cache_key, duration_minutes=60):
            return self._cache[cache_key]['data']
        
        # validate symbol
        is_valid = await self.client.validate_symbol(symbol)
        
        # cache the result
        self._cache[cache_key] = {
            'data': is_valid,
            'timestamp': datetime.now()
        }
        
        return is_valid
    
    def _is_cache_valid(self, cache_key: str, duration_minutes: int = 5) -> bool:
        """Check if cached data is still valid"""
        if cache_key not in self._cache:
            return False
        
        cache_time = self._cache[cache_key]['timestamp']
        expiry_time = cache_time + timedelta(minutes=duration_minutes)
        
        return datetime.now() < expiry_time