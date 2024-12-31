# app/api/v1/endpoints/stocks.py

from fastapi import APIRouter, Depends, HTTPException
from app.services.stock_service import StockService
from typing import Dict, Any, List

router = APIRouter()
stock_service = StockService()

@router.get("/quote/{symbol}")
async def get_stock_quote(symbol: str) -> Dict[str, Any]:
    """
    Get current stock quote including price and basic info
    """
    return await stock_service.get_stock_price(symbol)

@router.get("/history/{symbol}")
async def get_stock_history(
    symbol: str,
    timeframe: str = "1mo"
) -> Dict[str, Any]:
    """
    Get historical price data for charting
    timeframe options: 1d, 5d, 1mo, 3mo, 6mo, 1y, max
    """
    return await stock_service.get_stock_history(symbol, timeframe)