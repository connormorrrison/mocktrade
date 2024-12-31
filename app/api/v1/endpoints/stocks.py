# app/api/v1/endpoints/stocks.py

from fastapi import APIRouter, Depends, HTTPException
from app.services.stock_service import StockService
from typing import Dict, Any, List

router = APIRouter()
stock_service = StockService()

@router.get("/price/{symbol}")
async def get_stock_price(symbol: str) -> Dict[str, Any]:
    """
    Get current stock price for trading
    """
    return await stock_service.get_stock_price(symbol)

@router.get("/history/{symbol}")
async def get_stock_history(symbol: str, timeframe: str = "1d") -> Dict[str, Any]:
    """
    Get historical price data for charting
    """
    return await stock_service.get_stock_history(symbol, timeframe)