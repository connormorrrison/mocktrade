# app/api/v1/endpoints/stocks.py

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Dict, Any, List
import logging

from app.services.auth_service import AuthService
from app.services.stock_service import StockService
from app.services.portfolio_service import PortfolioService
from app.db.base import get_db

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter()
stock_service = StockService()
portfolio_service = PortfolioService()


@router.get("/quote/{symbol}")
async def get_stock_quote(
    symbol: str,
    current_user=Depends(AuthService.get_current_user),
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
    range: str = Query(
        "1mo",
        description="Time range for historical data (1d,5d,1mo,3mo,6mo,1y,2y,5y,10y,ytd,max)",
    ),
    current_user=Depends(AuthService.get_current_user),
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
    range: str = Query("1mo"),
    current_user=Depends(AuthService.get_current_user),
    db: Session = Depends(get_db),
) -> Dict[str, Any]:
    """
    Get historical data for all positions in this user's portfolio,
    but clamp values to zero before the user owned them.
    """
    logger.info(f"Received portfolio history request for user: {current_user.id}")

    try:
        # 1) Fetch positions from DB
        positions = portfolio_service.get_positions_for_user(db, current_user.id)
        if not positions:
            logger.info("No positions found for user.")
            return {}

        # 2) Transform DB positions to dicts, including created_at from created_at
        positions_as_dicts = []
        for p in positions:
            positions_as_dicts.append({
                "symbol": p.symbol,
                "shares": p.shares,
                # We'll clamp to 0 if data_date < created_at
                "created_at": p.created_at  
            })

        # 3) Pass them to the stock_service
        historical_data = await stock_service.get_portfolio_historical_data(
            positions_as_dicts, 
            range
        )
        
        return historical_data

    except Exception as e:
        logger.error(f"Error fetching portfolio history: {str(e)}")
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=400, detail=str(e))
