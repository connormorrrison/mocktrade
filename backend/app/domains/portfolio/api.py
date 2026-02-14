# app/domains/portfolio/api.py

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
import logging

from app.core.dependencies import get_db, get_current_user
from app.domains.auth.models import User
from app.domains.portfolio.services import PortfolioService, PortfolioError
from app.domains.portfolio.schemas import PortfolioSummary, PortfolioHistory, PortfolioSnapshotCreate

logger = logging.getLogger(__name__)
router = APIRouter()

@router.get("/summary", response_model=PortfolioSummary)
async def get_portfolio_summary(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get current portfolio summary with real-time values"""
    try:
        portfolio_service = PortfolioService(db)
        summary = await portfolio_service.get_portfolio_summary(current_user.id)

        # Auto-snapshot: create/update today's snapshot using already-computed values
        try:
            from datetime import date
            from app.domains.portfolio.repositories import PortfolioRepository
            portfolio_repo = PortfolioRepository(db)
            today = date.today()
            existing = portfolio_repo.get_snapshot_by_date(current_user.id, today)
            if existing:
                portfolio_repo.update_snapshot(existing, summary.portfolio_value, summary.positions_value, summary.cash_balance)
            else:
                portfolio_repo.create_snapshot(PortfolioSnapshotCreate(
                    user_id=current_user.id,
                    snapshot_date=today,
                    portfolio_value=summary.portfolio_value,
                    positions_value=summary.positions_value,
                    cash_balance=summary.cash_balance
                ))
        except Exception as snap_err:
            logger.warning(f"Auto-snapshot failed for user {current_user.id}: {snap_err}")

        logger.info(f"Successfully fetched portfolio summary for user {current_user.username}")
        return summary

    except PortfolioError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        logger.error(f"Error fetching portfolio summary for user {current_user.id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve portfolio summary"
        )

@router.post("/snapshot")
async def create_portfolio_snapshot(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a portfolio snapshot for today"""
    try:
        portfolio_service = PortfolioService(db)
        await portfolio_service.create_portfolio_snapshot(current_user.id)
        
        logger.info(f"Successfully created portfolio snapshot for user {current_user.username}")
        return {"message": "Portfolio snapshot created successfully"}
        
    except PortfolioError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        logger.error(f"Error creating portfolio snapshot for user {current_user.id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create portfolio snapshot"
        )

@router.get("/leaderboard")
async def get_leaderboard(
    timeframe: str = Query(default="day", regex="^(day|week|month|all)$"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get leaderboard data for specified timeframe"""
    try:
        portfolio_service = PortfolioService(db)
        leaderboard = await portfolio_service.get_leaderboard(timeframe)
        
        logger.info(f"Successfully fetched leaderboard ({timeframe}) for user {current_user.username}")
        return leaderboard
        
    except PortfolioError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        logger.error(f"Error fetching leaderboard: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve leaderboard"
        )

@router.get("/user/{username}")
async def get_user_profile(
    username: str,
    include_activities: bool = Query(default=False),
    activities_limit: int = Query(default=10),
    activities_offset: int = Query(default=0),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get user profile data by username"""
    try:
        # Get user by username
        from app.domains.auth.repositories import UserRepository
        user_repo = UserRepository(db)
        target_user = user_repo.get_by_username(username)
        
        if not target_user:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
        
        portfolio_service = PortfolioService(db)
        summary = await portfolio_service.get_portfolio_summary(target_user.id)
        
        # Use a standard starting value - could be made configurable later
        # For now, all users start with the same amount as defined in user creation
        starting_value = 100000.0  # This matches the default cash_balance in User model
        
        # Base response with correct order
        user_profile = {
            "first_name": target_user.first_name,
            "last_name": target_user.last_name,
            "created_at": target_user.created_at.isoformat() if target_user.created_at else None,
            "portfolio_value": summary.portfolio_value,
            "positions_value": summary.positions_value,
            "cash_balance": summary.cash_balance,
            "starting_value": starting_value,
            "total_return": summary.portfolio_value - starting_value,
            "return_percentage": ((summary.portfolio_value - starting_value) / starting_value) * 100 if starting_value > 0 else 0,
            "activity_count": 0,  # Will be populated if activities requested
            "positions": summary.positions  # Use enriched positions from summary
        }
        
        # Add activities if requested
        if include_activities:
            from app.domains.trading.repositories import ActivityRepository
            activity_repo = ActivityRepository(db)
            # Get total count efficiently
            user_profile["activity_count"] = activity_repo.count_by_user(target_user.id)

            # Get paginated activities
            activities = activity_repo.get_by_user(target_user.id, activities_limit, activities_offset)
            user_profile["activities"] = [
                {
                    "id": activity.id,
                    "symbol": activity.symbol,
                    "action": activity.action,
                    "quantity": activity.quantity,
                    "price": activity.price,
                    "total_amount": activity.total_amount,
                    "created_at": activity.created_at.isoformat()
                }
                for activity in activities
            ]
        
        logger.info(f"Successfully fetched user profile for {username}")
        return user_profile
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching user profile for {username}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve user profile"
        )

@router.get("/history", response_model=PortfolioHistory)
async def get_portfolio_history(
    period: str = Query(default="1mo", regex="^(1d|5d|1mo|3mo|6mo|1y|5y|max)$"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get portfolio history for specified period (1d, 5d, 1mo, 3mo, 6mo, 1y, 5y, max)"""
    try:
        portfolio_service = PortfolioService(db)
        history = portfolio_service.get_portfolio_history(current_user.id, period)
        
        logger.info(f"Successfully fetched portfolio history ({period}) for user {current_user.username}")
        return history
        
    except PortfolioError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        logger.error(f"Error fetching portfolio history for user {current_user.id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve portfolio history"
        )