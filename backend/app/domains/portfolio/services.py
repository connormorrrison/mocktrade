# app/domains/portfolio/services.py

from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date, datetime, timedelta
import logging

from app.domains.portfolio.repositories import PortfolioRepository
from app.domains.portfolio.schemas import (
    PortfolioSnapshotCreate, 
    PortfolioSummary, 
    PortfolioHistory,
    PortfolioHistoryPoint
)
from app.domains.trading.repositories import PositionRepository
from app.domains.stocks.services import StockService
from app.core.exceptions import BusinessLogicError

logger = logging.getLogger(__name__)

class PortfolioError(BusinessLogicError):
    """Base exception for portfolio domain"""
    pass

class PortfolioService:
    def __init__(self, db: Session):
        self.db = db
        self.portfolio_repo = PortfolioRepository(db)
        self.position_repo = PositionRepository(db)
        self.stock_service = StockService()

    async def get_portfolio_summary(self, user_id: int) -> PortfolioSummary:
        """Get current portfolio summary with real-time values"""
        try:
            # Get user's current positions
            positions = self.position_repo.get_all_by_user(user_id)
            
            # Get user's cash balance
            from app.domains.auth.repositories import UserRepository
            user_repo = UserRepository(self.db)
            user = user_repo.get_by_id(user_id)
            
            if not user:
                raise PortfolioError(f"User {user_id} not found")
            
            cash_balance = user.cash_balance
            positions_value = 0.0
            
            # Calculate current positions value
            for position in positions:
                try:
                    # Get current price for each position
                    current_price_data = await self.stock_service.get_current_price(position.symbol)
                    current_price = current_price_data["current_price"]
                    positions_value += position.quantity * current_price
                except Exception as e:
                    logger.warning(f"Could not get current price for {position.symbol}: {e}")
                    # Use average price as fallback
                    positions_value += position.quantity * position.average_price
            
            portfolio_value = positions_value + cash_balance
            
            # Calculate day change (compare to previous snapshot if available)
            day_change = None
            day_change_percent = None
            
            yesterday = date.today() - timedelta(days=1)
            previous_snapshot = self.portfolio_repo.get_snapshot_by_date(user_id, yesterday)
            
            if previous_snapshot:
                day_change = portfolio_value - previous_snapshot.portfolio_value
                day_change_percent = (day_change / previous_snapshot.portfolio_value) * 100 if previous_snapshot.portfolio_value > 0 else 0
            
            # Create enriched positions list for frontend
            enriched_positions = []
            for position in positions:
                try:
                    # Get comprehensive stock data including company name
                    stock_data = await self.stock_service.get_stock_data(position.symbol)
                    current_price = stock_data["current_price"]
                    company_name = stock_data.get("company_name", position.symbol)
                    
                    enriched_positions.append({
                        "symbol": position.symbol,
                        "company_name": company_name,
                        "shares": position.quantity,  # Using 'shares' to match frontend
                        "current_price": current_price,
                        "average_price": position.average_price,
                        "current_value": position.quantity * current_price
                    })
                except Exception as e:
                    logger.warning(f"Could not get stock data for {position.symbol}: {e}")
                    # Try just getting the price as fallback
                    try:
                        current_price_data = await self.stock_service.get_current_price(position.symbol)
                        current_price = current_price_data["current_price"]
                        
                        enriched_positions.append({
                            "symbol": position.symbol,
                            "company_name": position.symbol,  # Fallback to symbol
                            "shares": position.quantity,
                            "current_price": current_price,
                            "average_price": position.average_price,
                            "current_value": position.quantity * current_price
                        })
                    except Exception as e2:
                        logger.warning(f"Could not get any stock data for {position.symbol}: {e2}")
                        # Use average price as ultimate fallback
                        enriched_positions.append({
                            "symbol": position.symbol,
                            "company_name": position.symbol,
                            "shares": position.quantity,
                            "current_price": position.average_price,
                            "average_price": position.average_price,
                            "current_value": position.quantity * position.average_price
                        })
            
            return PortfolioSummary(
                portfolio_value=portfolio_value,
                positions_value=positions_value,
                cash_balance=cash_balance,
                positions_count=len(positions),
                day_change=day_change,
                day_change_percent=day_change_percent,
                positions=enriched_positions
            )
            
        except Exception as e:
            logger.error(f"Error getting portfolio summary for user {user_id}: {e}")
            raise PortfolioError(f"Could not get portfolio summary: {str(e)}")

    async def create_portfolio_snapshot(self, user_id: int, snapshot_date: Optional[date] = None) -> None:
        """Create a portfolio snapshot for a specific date"""
        try:
            if snapshot_date is None:
                snapshot_date = date.today()
            
            # Check if snapshot already exists for this date
            existing_snapshot = self.portfolio_repo.get_snapshot_by_date(user_id, snapshot_date)
            
            # Get current portfolio values
            summary = await self.get_portfolio_summary(user_id)
            
            snapshot_data = PortfolioSnapshotCreate(
                user_id=user_id,
                snapshot_date=snapshot_date,
                portfolio_value=summary.portfolio_value,
                positions_value=summary.positions_value,
                cash_balance=summary.cash_balance
            )
            
            if existing_snapshot:
                # Update existing snapshot
                self.portfolio_repo.update_snapshot(
                    existing_snapshot,
                    summary.portfolio_value,
                    summary.positions_value,
                    summary.cash_balance
                )
                logger.info(f"Updated portfolio snapshot for user {user_id} on {snapshot_date}")
            else:
                # Create new snapshot
                self.portfolio_repo.create_snapshot(snapshot_data)
                logger.info(f"Created portfolio snapshot for user {user_id} on {snapshot_date}")
                
        except Exception as e:
            logger.error(f"Error creating portfolio snapshot for user {user_id}: {e}")
            raise PortfolioError(f"Could not create portfolio snapshot: {str(e)}")

    def get_portfolio_history(self, user_id: int, period: str = "1mo") -> PortfolioHistory:
        """Get portfolio history for a specified period"""
        try:
            # Calculate date range based on period
            end_date = date.today()
            
            if period == "1d":
                start_date = end_date - timedelta(days=1)
            elif period == "5d":
                start_date = end_date - timedelta(days=5)
            elif period == "1mo":
                start_date = end_date - timedelta(days=30)
            elif period == "3mo":
                start_date = end_date - timedelta(days=90)
            elif period == "6mo":
                start_date = end_date - timedelta(days=180)
            elif period == "1y":
                start_date = end_date - timedelta(days=365)
            elif period == "5y":
                start_date = end_date - timedelta(days=365*5)
            elif period == "max":
                # Get all snapshots
                snapshots = self.portfolio_repo.get_all_snapshots(user_id)
            else:
                start_date = end_date - timedelta(days=30)  # Default to 1mo
            
            if period != "max":
                snapshots = self.portfolio_repo.get_snapshots_by_date_range(user_id, start_date, end_date)
            
            # Convert to history points
            history_points = []
            for snapshot in snapshots:
                history_points.append(PortfolioHistoryPoint(
                    date=snapshot.snapshot_date.isoformat(),
                    portfolio_value=snapshot.portfolio_value,
                    positions_value=snapshot.positions_value,
                    cash_balance=snapshot.cash_balance
                ))
            
            return PortfolioHistory(
                history=history_points,
                period=period
            )
            
        except Exception as e:
            logger.error(f"Error getting portfolio history for user {user_id}: {e}")
            raise PortfolioError(f"Could not get portfolio history: {str(e)}")

    async def get_leaderboard(self, timeframe: str = "day") -> List[dict]:
        """Get leaderboard data for all users"""
        try:
            from app.domains.auth.repositories import UserRepository
            user_repo = UserRepository(self.db)
            
            # Get all active users
            all_users = user_repo.get_all_active()
            leaderboard_data = []
            
            for user in all_users:
                try:
                    # Get current portfolio summary for each user
                    summary = await self.get_portfolio_summary(user.id)
                    
                    # Calculate returns based on timeframe
                    start_value = 100000.0  # Default starting value
                    if timeframe != "all":
                        # Get snapshot from start of timeframe
                        if timeframe == "day":
                            target_date = date.today() - timedelta(days=1)
                        elif timeframe == "week":
                            target_date = date.today() - timedelta(weeks=1)
                        elif timeframe == "month":
                            target_date = date.today() - timedelta(days=30)
                        else:
                            target_date = date.today() - timedelta(days=1)
                        
                        snapshot = self.portfolio_repo.get_snapshot_by_date(user.id, target_date)
                        if snapshot:
                            start_value = snapshot.portfolio_value
                    
                    current_value = summary.portfolio_value
                    return_amount = current_value - start_value
                    return_percentage = (return_amount / start_value * 100) if start_value > 0 else 0
                    
                    leaderboard_data.append({
                        "username": user.username,
                        "first_name": user.first_name,
                        "last_name": user.last_name,
                        "total_value": current_value,
                        "return_amount": return_amount,
                        "return_percentage": return_percentage
                    })
                    
                except Exception as e:
                    logger.warning(f"Could not get portfolio data for user {user.id}: {e}")
                    continue
            
            # Sort by total value descending
            leaderboard_data.sort(key=lambda x: x["total_value"], reverse=True)
            
            # Add rank
            for idx, entry in enumerate(leaderboard_data):
                entry["rank"] = idx + 1
            
            return leaderboard_data
            
        except Exception as e:
            logger.error(f"Error getting leaderboard: {e}")
            raise PortfolioError(f"Could not get leaderboard: {str(e)}")