# app/domains/trading/api.py

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
import logging

from app.core.dependencies import get_db, get_current_user
from app.domains.auth.models import User
from app.domains.trading.schemas import (
    OrderCreate, 
    TradeConfirmation, 
    Position, 
    Activity,
    WatchlistCreate,
    WatchlistItem,
    WatchlistResponse
)
from app.domains.trading.services import TradingService, InsufficientFundsError, InsufficientSharesError, TradingError

logger = logging.getLogger(__name__)
router = APIRouter()

@router.post("/orders", response_model=TradeConfirmation)
async def execute_order(
    order: OrderCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Execute a buy or sell order"""
    try:
        trading_service = TradingService(db)
        
        # Get current stock price
        from app.domains.stocks.services import StockService
        stock_service = StockService()
        stock_data = await stock_service.get_current_price(order.symbol)
        current_price = stock_data["current_price"]
        
        # Execute the order
        confirmation = await trading_service.execute_order(current_user, order, current_price)
        
        logger.info(f"Order executed: {order.action} {order.quantity} {order.symbol} at ${current_price}")
        return confirmation
        
    except (InsufficientFundsError, InsufficientSharesError) as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except TradingError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        logger.error(f"Error executing order: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Order execution failed")

@router.get("/positions", response_model=List[Position])
async def get_positions(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get user's current positions"""
    try:
        trading_service = TradingService(db)
        positions = trading_service.get_user_positions(current_user.id)
        return positions
        
    except Exception as e:
        logger.error(f"Error getting positions: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to retrieve positions")

@router.get("/positions/{symbol}", response_model=Position)
async def get_position_by_symbol(
    symbol: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get specific position by symbol"""
    try:
        trading_service = TradingService(db)
        position = trading_service.get_position_by_symbol(current_user.id, symbol.upper())
        
        if not position:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"No position found for {symbol}")
        
        return position
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting position for {symbol}: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to retrieve position")

@router.get("/activities", response_model=List[Activity])
async def get_activities(
    limit: int = 100,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get user's trading activities/history"""
    try:
        trading_service = TradingService(db)
        activities = trading_service.get_user_activities(current_user.id, limit)
        return activities
        
    except Exception as e:
        logger.error(f"Error getting activities: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to retrieve activities")

# Watchlist endpoints
@router.get("/watchlist", response_model=List[WatchlistResponse])
async def get_watchlist(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get user's watchlist with stock details"""
    try:
        trading_service = TradingService(db)
        watchlist_items = trading_service.get_user_watchlist(current_user.id)
        
        if not watchlist_items:
            return []
        
        # Get current stock data for each watchlist item
        from app.domains.stocks.services import StockService
        stock_service = StockService()
        watchlist_with_data = []
        
        for item in watchlist_items:
            try:
                # Get current stock price and details
                stock_data = await stock_service.get_stock_data(item.symbol)
                
                watchlist_with_data.append(WatchlistResponse(
                    id=item.id,
                    symbol=item.symbol,
                    name=stock_data.get("company_name", item.symbol),
                    current_price=stock_data["current_price"],
                    previous_close=stock_data.get("previous_close_price", stock_data["current_price"]),
                    change=stock_data["current_price"] - stock_data.get("previous_close_price", stock_data["current_price"]),
                    change_percent=((stock_data["current_price"] - stock_data.get("previous_close_price", stock_data["current_price"])) / stock_data.get("previous_close_price", stock_data["current_price"])) * 100 if stock_data.get("previous_close_price") else 0.0,
                    market_cap=stock_data.get("market_capitalization", "N/A"),
                    created_at=item.created_at
                ))
            except Exception as e:
                logger.warning(f"Could not get stock data for {item.symbol}: {e}")
                # Return basic data if stock service fails
                watchlist_with_data.append(WatchlistResponse(
                    id=item.id,
                    symbol=item.symbol,
                    name=item.symbol,
                    current_price=0.0,
                    previous_close=0.0,
                    change=0.0,
                    change_percent=0.0,
                    market_cap="N/A",
                    created_at=item.created_at
                ))
        
        return watchlist_with_data
        
    except Exception as e:
        logger.error(f"Error getting watchlist: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to retrieve watchlist")

@router.post("/watchlist", response_model=WatchlistItem)
async def add_to_watchlist(
    watchlist_data: WatchlistCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Add a stock to user's watchlist"""
    try:
        trading_service = TradingService(db)
        
        # Validate stock symbol exists (optional - comment out if you want to allow any symbol)
        try:
            from app.domains.stocks.services import StockService
            stock_service = StockService()
            await stock_service.get_current_price(watchlist_data.symbol)
        except Exception:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid stock symbol: {watchlist_data.symbol}"
            )
        
        watchlist_item = trading_service.add_to_watchlist(current_user.id, watchlist_data)
        
        logger.info(f"Added {watchlist_data.symbol} to watchlist for user {current_user.username}")
        return watchlist_item
        
    except TradingError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error adding to watchlist: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to add stock to watchlist")

@router.delete("/watchlist/{symbol}")
async def remove_from_watchlist(
    symbol: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Remove a stock from user's watchlist"""
    try:
        trading_service = TradingService(db)
        trading_service.remove_from_watchlist(current_user.id, symbol.upper())
        
        logger.info(f"Removed {symbol} from watchlist for user {current_user.username}")
        return {"message": f"Removed {symbol} from watchlist"}
        
    except TradingError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except Exception as e:
        logger.error(f"Error removing from watchlist: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to remove stock from watchlist")