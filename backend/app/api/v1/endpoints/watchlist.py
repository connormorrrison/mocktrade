from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.db.base import get_db
from app.services.auth_service import AuthService
from app.models.user import User
from app.models.trading import Watchlist
from app.services.stock_service import StockService
from app.schemas.watchlist import WatchlistItem, WatchlistCreate, WatchlistResponse
import logging

logger = logging.getLogger(__name__)
router = APIRouter()

@router.get("/", response_model=List[WatchlistResponse])
async def get_watchlist(
    current_user: User = Depends(AuthService.get_current_user),
    db: Session = Depends(get_db)
):
    """Get current user's watchlist with stock details."""
    try:
        # Get user's watchlist items
        watchlist_items = db.query(Watchlist).filter(
            Watchlist.user_id == current_user.id
        ).order_by(Watchlist.created_at).all()
        
        if not watchlist_items:
            return []
        
        # Get current stock data for each watchlist item
        stock_service = StockService()
        watchlist_with_data = []
        
        for item in watchlist_items:
            try:
                # Get current stock price and details
                stock_data = await stock_service.get_stock_price(item.symbol)
                
                watchlist_with_data.append(WatchlistResponse(
                    id=item.id,
                    symbol=item.symbol,
                    name=stock_data.get("name", item.symbol),
                    current_price=stock_data["current_price"],
                    previous_close=stock_data.get("previous_close", stock_data["current_price"]),
                    change=stock_data["current_price"] - stock_data.get("previous_close", stock_data["current_price"]),
                    change_percent=((stock_data["current_price"] - stock_data.get("previous_close", stock_data["current_price"])) / stock_data.get("previous_close", stock_data["current_price"])) * 100 if stock_data.get("previous_close") else 0.0,
                    market_cap=stock_data.get("market_cap", "N/A"),
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
        logger.error(f"Error getting watchlist for user {current_user.id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve watchlist"
        )

@router.post("/", response_model=WatchlistItem)
async def add_to_watchlist(
    watchlist_data: WatchlistCreate,
    current_user: User = Depends(AuthService.get_current_user),
    db: Session = Depends(get_db)
):
    """Add a stock to user's watchlist."""
    try:
        # Check if stock already exists in watchlist
        existing = db.query(Watchlist).filter(
            Watchlist.user_id == current_user.id,
            Watchlist.symbol == watchlist_data.symbol.upper()
        ).first()
        
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Stock {watchlist_data.symbol} is already in your watchlist"
            )
        
        # Validate stock symbol exists (optional - comment out if you want to allow any symbol)
        try:
            stock_service = StockService()
            await stock_service.get_stock_price(watchlist_data.symbol)
        except Exception:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid stock symbol: {watchlist_data.symbol}"
            )
        
        # Create watchlist entry
        watchlist_item = Watchlist(
            user_id=current_user.id,
            symbol=watchlist_data.symbol.upper()
        )
        
        db.add(watchlist_item)
        db.commit()
        db.refresh(watchlist_item)
        
        logger.info(f"Added {watchlist_data.symbol} to watchlist for user {current_user.username}")
        
        return WatchlistItem(
            id=watchlist_item.id,
            symbol=watchlist_item.symbol,
            created_at=watchlist_item.created_at
        )
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Error adding to watchlist: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to add stock to watchlist"
        )

@router.delete("/{symbol}")
async def remove_from_watchlist(
    symbol: str,
    current_user: User = Depends(AuthService.get_current_user),
    db: Session = Depends(get_db)
):
    """Remove a stock from user's watchlist."""
    try:
        # Find the watchlist item
        watchlist_item = db.query(Watchlist).filter(
            Watchlist.user_id == current_user.id,
            Watchlist.symbol == symbol.upper()
        ).first()
        
        if not watchlist_item:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Stock {symbol} not found in your watchlist"
            )
        
        # Delete the item
        db.delete(watchlist_item)
        db.commit()
        
        logger.info(f"Removed {symbol} from watchlist for user {current_user.username}")
        
        return {"message": f"Removed {symbol} from watchlist"}
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Error removing from watchlist: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to remove stock from watchlist"
        )