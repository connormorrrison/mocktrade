# app/domains/stocks/api.py

from fastapi import APIRouter, HTTPException, status, Depends
import logging

from app.core.dependencies import get_current_user
from app.domains.auth.models import User
from app.domains.stocks.services import StockService
from app.domains.stocks.schemas import (
    StockData, 
    MarketIndicesResponse, 
    MarketMoversResponse,
    SymbolRequest
)

logger = logging.getLogger(__name__)
router = APIRouter()

@router.get("/quote/{symbol}", response_model=dict)
async def get_stock_quote(symbol: str, current_user: User = Depends(get_current_user)):
    """Get stock quote - matches frontend expectation"""
    try:
        stock_service = StockService()
        result = await stock_service.get_current_price(symbol.upper())
        
        logger.info(f"Successfully fetched quote for {symbol}")
        return result
        
    except Exception as e:
        logger.error(f"Error fetching quote for {symbol}: {e}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Could not fetch quote for symbol {symbol}"
        )

@router.get("/{symbol}", response_model=dict)
async def get_stock_data(symbol: str, current_user: User = Depends(get_current_user)):
    """Get comprehensive stock data including company name and market cap"""
    try:
        stock_service = StockService()
        result = await stock_service.get_stock_data(symbol.upper())
        
        logger.info(f"Successfully fetched stock data for {symbol}")
        return result
        
    except Exception as e:
        logger.error(f"Error fetching stock data for {symbol}: {e}")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Could not fetch data for symbol {symbol}"
        )

@router.get("/{symbol}/price", response_model=dict)
async def get_current_price(symbol: str):
    """Get current price only - faster endpoint"""
    try:
        stock_service = StockService()
        result = await stock_service.get_current_price(symbol.upper())
        
        logger.info(f"Successfully fetched price for {symbol}")
        return result
        
    except Exception as e:
        logger.error(f"Error fetching price for {symbol}: {e}")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Could not fetch price for symbol {symbol}"
        )

@router.post("/validate", response_model=dict)
async def validate_symbol(request: SymbolRequest):
    """Validate if a stock symbol exists"""
    try:
        stock_service = StockService()
        is_valid = await stock_service.validate_symbol(request.symbol)
        
        return {
            "symbol": request.symbol.upper(),
            "valid": is_valid
        }
        
    except Exception as e:
        logger.error(f"Error validating symbol {request.symbol}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error validating symbol"
        )

@router.get("/market/indices", response_model=MarketIndicesResponse)
async def get_market_indices(current_user: User = Depends(get_current_user)):
    """Get major market indices (S&P 500, Dow Jones, NASDAQ, VIX)"""
    try:
        stock_service = StockService()
        result = await stock_service.get_market_indices()
        
        logger.info("Successfully fetched market indices")
        return result
        
    except Exception as e:
        logger.error(f"Error fetching market indices: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Could not fetch market indices"
        )

@router.get("/market/movers", response_model=MarketMoversResponse)
async def get_market_movers(current_user: User = Depends(get_current_user)):
    """Get top gainers and losers from the market"""
    try:
        stock_service = StockService()
        result = await stock_service.get_market_movers()
        
        logger.info("Successfully fetched market movers")
        return result
        
    except Exception as e:
        logger.error(f"Error fetching market movers: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Could not fetch market movers"
        )