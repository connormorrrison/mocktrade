# app/api/v1/endpoints/trading.py
from fastapi import APIRouter, Depends, HTTPException
from app.services.trading_service import TradingService
from app.services.auth_service import AuthService
from app.schemas.trading import OrderCreate
from typing import Dict, Any, List
from sqlalchemy.orm import Session
from app.db.base import get_db
import logging

logger = logging.getLogger(__name__)
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
    try:
        return await trading_service.execute_trade(
            db=db,
            user_id=current_user.id,
            symbol=order.symbol,
            shares=order.shares,
            transaction_type=order.transaction_type
        )
    except ValueError as e:
        logger.warning(f"Validation error in create_order: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        error_msg = str(e).lower()
        if any(phrase in error_msg for phrase in ["insufficient", "not enough", "invalid"]):
            logger.warning(f"Business rule violation in create_order: {str(e)}")
            raise HTTPException(status_code=400, detail=str(e))
        logger.error(f"Unexpected error in create_order: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"An unexpected error occurred"
        )

@router.get("/portfolio")
async def get_portfolio(
    current_user = Depends(AuthService.get_current_user),
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """
    Get current user's portfolio summary
    """
    try:
        portfolio_data = await trading_service.get_portfolio_summary(db, current_user.id)
        return portfolio_data
    except Exception as e:
        logger.error(f"Error fetching portfolio: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch portfolio: {str(e)}"
        )

@router.get("/portfolio/{symbol}")
async def get_position(
    symbol: str,
    current_user = Depends(AuthService.get_current_user),
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """
    Get user's position for a specific symbol
    """
    try:
        symbol = symbol.upper()
        portfolio = await trading_service.get_portfolio_summary(db, current_user.id)
        position = next(
            (pos for pos in portfolio["positions"] if pos["symbol"] == symbol),
            {"symbol": symbol, "shares": 0, "average_price": 0}
        )
        return position
    except Exception as e:
        logger.error(f"Error fetching position: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch position: {str(e)}"
        )

@router.get("/transactions")
async def get_transactions(
    current_user = Depends(AuthService.get_current_user),
    db: Session = Depends(get_db)
) -> List[Dict[str, Any]]:
    """
    Get user's transaction history
    """
    try:
        return await trading_service.get_user_transactions(db, current_user.id)
    except Exception as e:
        logger.error(f"Error fetching transactions: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch transactions: {str(e)}"
        )