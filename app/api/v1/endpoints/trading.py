# app/api/v1/endpoints/trading.py

from fastapi import APIRouter, HTTPException
from app.services.stock_service import StockService
from app.services.portfolio_service import PortfolioService
from typing import Dict, Any, List

router = APIRouter()
stock_service = StockService()
portfolio_service = PortfolioService()

# Stock data endpoints
@router.get("/stocks/{symbol}/price")
async def get_stock_price(symbol: str) -> Dict[str, Any]:
    """
    Get current stock price for trading
    """
    return await stock_service.get_stock_price(symbol)

@router.get("/stocks/{symbol}/history")
async def get_stock_history(symbol: str, timeframe: str = "1d") -> Dict[str, Any]:
    """
    Get historical price data for charting
    """
    return await stock_service.get_stock_history(symbol, timeframe)

# Portfolio endpoints
@router.post("/portfolio/summary")
async def get_portfolio_summary(positions: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Get current portfolio value and performance
    """
    return await portfolio_service.get_portfolio_summary(positions)