# app/api/v1/endpoints/stocks.py
from fastapi import APIRouter, Depends, HTTPException, Query
from app.services.stock_service import StockService
from app.services.auth_service import AuthService
from typing import Dict, Any, List
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter()
stock_service = StockService()

@router.get("/quote/{symbol}")
async def get_stock_quote(
    symbol: str,
    current_user = Depends(AuthService.get_current_user)
) -> Dict[str, Any]:
    """Get current stock price and basic info"""
    logger.info(f"Received quote request for symbol: {symbol}")
    try:
        result = await stock_service.get_stock_price(symbol.upper())
        logger.info(f"Successfully fetched quote for {symbol}")
        return result
    except Exception as e:
        logger.error(f"Error fetching stock quote for {symbol}: {str(e)}")
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/history/{symbol}")
async def get_stock_history(
    symbol: str,
    range: str = Query("1mo", description="Time range for historical data (1d,5d,1mo,3mo,6mo,1y,2y,5y,10y,ytd,max)"),
    current_user = Depends(AuthService.get_current_user)
) -> Dict[str, Any]:
    """Get historical data for a stock"""
    logger.info(f"Received history request for symbol: {symbol}, range: {range}")
    try:
        result = await stock_service.get_stock_history(symbol.upper(), range)
        logger.info(f"Successfully fetched history for {symbol}")
        return result
    except Exception as e:
        logger.error(f"Error fetching stock history for {symbol}: {str(e)}")
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/portfolio/history")
async def get_portfolio_history(
    positions: List[Dict[str, Any]] = None,
    range: str = Query("1mo", description="Time range for historical data (1d,5d,1mo,3mo,6mo,1y,2y,5y,10y,ytd,max)"),
    current_user = Depends(AuthService.get_current_user)
) -> Dict[str, List]:
    """Get historical data for all positions in portfolio"""
    logger.info(f"Received portfolio history request for user: {current_user.id}")
    try:
        if not positions:
            return {}
            
        historical_data = await stock_service.get_portfolio_historical_data(positions, range)
        logger.info(f"Successfully fetched portfolio history")
        return historical_data
    except Exception as e:
        logger.error(f"Error fetching portfolio history: {str(e)}")
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=400, detail=str(e))