# app/api/v1/endpoints/trading.py

from fastapi import APIRouter, Depends, HTTPException
from app.services.trading_service import TradingService
from app.services.auth_service import AuthService
from app.schemas.trading import OrderCreate
from typing import Dict, Any, List
from sqlalchemy.orm import Session
from app.db.base import get_db

router = APIRouter()
trading_service = TradingService()

@router.post("/orders")
async def create_order(
    order: OrderCreate,
    current_user = Depends(AuthService.get_current_user),
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """
    Place a buy/sell order
    """
    return await trading_service.execute_trade(
        db=db,
        user_id=current_user.id,
        symbol=order.symbol,
        shares=order.shares,
        transaction_type=order.transaction_type
    )

@router.get("/portfolio")
async def get_portfolio(
    current_user = Depends(AuthService.get_current_user),
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """
    Get current user's portfolio summary
    """
    return await trading_service.get_portfolio_summary(db, current_user.id)

@router.get("/transactions")
async def get_transactions(
    current_user = Depends(AuthService.get_current_user),
    db: Session = Depends(get_db)
) -> List[Dict[str, Any]]:
    """
    Get user's transaction history
    """
    return await trading_service.get_user_transactions(db, current_user.id)