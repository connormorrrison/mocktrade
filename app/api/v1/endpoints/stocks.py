# app/api/v1/endpoints/stocks.py
from fastapi import APIRouter, Depends, HTTPException
from app.services.stock_service import StockService
from app.services.auth_service import AuthService
from typing import Dict, Any
import logging

# Configure logging
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
    print(f"Processing quote request for symbol: {symbol}")  # Debug print
    logger.info(f"Received quote request for symbol: {symbol}")
    try:
        result = await stock_service.get_stock_price(symbol.upper())
        print(f"Successfully fetched quote: {result}")  # Debug print
        logger.info(f"Successfully fetched quote for {symbol}: {result}")
        return result
    except Exception as e:
        print(f"Error processing request: {str(e)}")  # Debug print
        logger.error(f"Error fetching stock quote for {symbol}: {str(e)}")
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(
            status_code=400,
            detail=str(e)
        )