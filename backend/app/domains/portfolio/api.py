# app/domains/portfolio/api.py

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
import logging

from app.core.dependencies import get_db, get_current_user
from app.domains.auth.models import User
from app.domains.portfolio.services import PortfolioService, PortfolioError
from app.domains.portfolio.schemas import PortfolioSummary, PortfolioHistory

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

@router.get("/history", response_model=PortfolioHistory)
async def get_portfolio_history(
    period: str = Query(default="1M", regex="^(1D|1W|1M|3M|1Y|ALL)$"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get portfolio history for specified period (1D, 1W, 1M, 3M, 1Y, ALL)"""
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