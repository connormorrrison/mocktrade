from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.db.base import get_db
from app.services.auth_service import AuthService
from app.services.portfolio_service import PortfolioService
from app.models.user import User
from app.schemas.portfolio import PortfolioSummary, PortfolioHistory, LeaderboardEntry
import logging

logger = logging.getLogger(__name__)
router = APIRouter()

@router.get("/summary", response_model=PortfolioSummary)
async def get_portfolio_summary(
    current_user: User = Depends(AuthService.get_current_user),
    db: Session = Depends(get_db)
):
    """Get current portfolio summary including total value, positions, and returns."""
    try:
        portfolio_data = await PortfolioService.calculate_portfolio_value(db, current_user.id)
        
        return PortfolioSummary(
            cash_balance=portfolio_data["cash_balance"],
            positions_value=portfolio_data["positions_value"],
            total_value=portfolio_data["total_value"],
            starting_value=portfolio_data["starting_value"],
            total_return=portfolio_data["total_return"],
            return_percentage=portfolio_data["return_percentage"],
            positions=portfolio_data["positions"]
        )
        
    except Exception as e:
        logger.error(f"Error getting portfolio summary for user {current_user.id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve portfolio summary"
        )

@router.get("/history", response_model=List[PortfolioHistory])
async def get_portfolio_history(
    timeframe: str = Query("1y", regex="^(1mo|3mo|6mo|1y|max)$"),
    current_user: User = Depends(AuthService.get_current_user),
    db: Session = Depends(get_db)
):
    """Get portfolio history for charting based on timeframe."""
    try:
        history_data = PortfolioService.get_portfolio_history(db, current_user.id, timeframe)
        
        return [
            PortfolioHistory(
                date=item["date"],
                total_value=item["total_value"],
                cash_balance=item["cash_balance"],
                positions_value=item["positions_value"],
                return_amount=item["return_amount"],
                return_percentage=item["return_percentage"]
            )
            for item in history_data
        ]
        
    except Exception as e:
        logger.error(f"Error getting portfolio history for user {current_user.id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve portfolio history"
        )

@router.post("/snapshot")
async def create_portfolio_snapshot(
    current_user: User = Depends(AuthService.get_current_user),
    db: Session = Depends(get_db)
):
    """Manually create a portfolio snapshot for the current user."""
    try:
        snapshot = await PortfolioService.create_portfolio_snapshot(db, current_user.id)
        
        return {
            "message": "Portfolio snapshot created successfully",
            "snapshot_date": snapshot.snapshot_date.isoformat(),
            "total_value": snapshot.total_value
        }
        
    except Exception as e:
        logger.error(f"Error creating portfolio snapshot for user {current_user.id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create portfolio snapshot"
        )

@router.get("/positions")
async def get_positions(
    current_user: User = Depends(AuthService.get_current_user),
    db: Session = Depends(get_db)
):
    """Get current positions with detailed information."""
    try:
        portfolio_data = await PortfolioService.calculate_portfolio_value(db, current_user.id)
        
        return {
            "positions": portfolio_data["positions"],
            "total_positions_value": portfolio_data["positions_value"]
        }
        
    except Exception as e:
        logger.error(f"Error getting positions for user {current_user.id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve positions"
        )

@router.get("/leaderboard", response_model=List[LeaderboardEntry])
async def get_leaderboard(
    timeframe: str = Query("all", regex="^(day|week|month|all)$"),
    db: Session = Depends(get_db)
):
    """Get leaderboard data showing top performers."""
    try:
        leaderboard_data = await PortfolioService.get_leaderboard_data(db, timeframe)
        
        return [
            LeaderboardEntry(
                rank=item["rank"],
                first_name=item["first_name"],
                last_name=item["last_name"],
                username=item["username"],
                total_value=item["total_value"],
                return_amount=item["return_amount"],
                return_percentage=item["return_percentage"]
            )
            for item in leaderboard_data
        ]
        
    except Exception as e:
        logger.error(f"Error getting leaderboard data: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve leaderboard data"
        )

@router.get("/leaderboard/{username}")
async def get_user_leaderboard_profile(
    username: str,
    include_activities: bool = Query(False),
    db: Session = Depends(get_db)
):
    """Get specific user's portfolio data for leaderboard profile view."""
    try:
        # Find user by username
        user = db.query(User).filter(User.username == username, User.is_active == True).first()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        # Get portfolio data for the user
        portfolio_data = await PortfolioService.calculate_portfolio_value(db, user.id)
        
        response_data = {
            "first_name": user.first_name,
            "last_name": user.last_name,
            "cash_balance": portfolio_data["cash_balance"],
            "positions_value": portfolio_data["positions_value"],
            "total_value": portfolio_data["total_value"],
            "starting_value": portfolio_data["starting_value"],
            "total_return": portfolio_data["total_return"],
            "return_percentage": portfolio_data["return_percentage"],
            "positions": portfolio_data["positions"]
        }
        
        # Include activities if requested
        if include_activities:
            from app.services.trading_service import TradingService
            trading_service = TradingService()
            activities = await trading_service.get_user_activities(db, user.id)
            response_data["activities"] = activities
            response_data["activity_count"] = len(activities)
        
        return response_data
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting leaderboard profile for user {username}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve user profile data"
        )