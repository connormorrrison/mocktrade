from sqlalchemy.orm import Session
from typing import List, Dict, Optional
from datetime import date, datetime, timedelta
from app.models.user import User
from app.models.trading import Position, Activity, PortfolioSnapshot
from app.services.stock_service import StockService
import logging

logger = logging.getLogger(__name__)

class PortfolioService:
    
    @staticmethod
    def get_positions_for_user(db: Session, user_id: int) -> List[Position]:
        """Return a list of all positions for the given user."""
        return db.query(Position).filter(Position.user_id == user_id, Position.shares > 0).all()
    
    @staticmethod
    async def calculate_portfolio_value(db: Session, user_id: int) -> Dict:
        """Calculate current total portfolio value for a user."""
        try:
            user = db.query(User).filter(User.id == user_id, User.is_active == True).first()
            if not user:
                raise ValueError("User not found or inactive")
            
            # Get all active positions
            positions = db.query(Position).filter(Position.user_id == user_id, Position.shares > 0).all()
            
            positions_value = 0.0
            position_details = []
            
            # Calculate value of each position
            for position in positions:
                try:
                    # Get current stock price and company name
                    stock_service = StockService()
                    stock_data = await stock_service.get_stock_price(position.symbol)
                    current_price = stock_data["current_price"]
                    
                    # Get company name
                    try:
                        company_name = await stock_service.get_company_name(position.symbol)
                    except:
                        company_name = position.symbol
                    
                    position_value = position.shares * current_price
                    positions_value += position_value
                    
                    position_details.append({
                        "symbol": position.symbol,
                        "company_name": company_name,
                        "shares": position.shares,
                        "average_price": position.average_price,
                        "current_price": current_price,
                        "current_value": position_value,
                        "unrealized_gain_loss": position_value - (position.shares * position.average_price),
                        "unrealized_gain_loss_percent": ((position_value - (position.shares * position.average_price)) / (position.shares * position.average_price)) * 100 if position.average_price > 0 else 0
                    })
                except Exception as e:
                    logger.warning(f"Could not get price for {position.symbol}: {e}")
                    # Fallback to average price if current price unavailable
                    position_value = position.shares * position.average_price
                    positions_value += position_value
                    
                    position_details.append({
                        "symbol": position.symbol,
                        "company_name": position.symbol,  # Fallback to symbol
                        "shares": position.shares,
                        "average_price": position.average_price,
                        "current_price": position.average_price,  # Fallback
                        "current_value": position_value,
                        "unrealized_gain_loss": 0.0,
                        "unrealized_gain_loss_percent": 0.0
                    })
            
            total_value = user.cash_balance + positions_value
            starting_value = 100000.0  # Starting portfolio value
            
            return {
                "cash_balance": user.cash_balance,
                "positions_value": positions_value,
                "total_value": total_value,
                "starting_value": starting_value,
                "total_return": total_value - starting_value,
                "return_percentage": ((total_value - starting_value) / starting_value) * 100,
                "positions": position_details
            }
            
        except Exception as e:
            logger.error(f"Error calculating portfolio value for user {user_id}: {e}")
            raise
    
    @staticmethod
    async def create_portfolio_snapshot(db: Session, user_id: int, snapshot_date: date = None) -> PortfolioSnapshot:
        """Create a daily portfolio snapshot for historical tracking."""
        try:
            if snapshot_date is None:
                snapshot_date = date.today()
            
            # Check if snapshot already exists for this date
            existing = db.query(PortfolioSnapshot).filter(
                PortfolioSnapshot.user_id == user_id,
                PortfolioSnapshot.snapshot_date == snapshot_date
            ).first()
            
            if existing:
                logger.info(f"Snapshot already exists for user {user_id} on {snapshot_date}")
                return existing
            
            # Calculate current portfolio values
            portfolio_data = await PortfolioService.calculate_portfolio_value(db, user_id)
            
            # Create snapshot
            snapshot = PortfolioSnapshot(
                user_id=user_id,
                total_value=portfolio_data["total_value"],
                cash_balance=portfolio_data["cash_balance"],
                positions_value=portfolio_data["positions_value"],
                snapshot_date=snapshot_date
            )
            
            db.add(snapshot)
            db.commit()
            db.refresh(snapshot)
            
            logger.info(f"Created portfolio snapshot for user {user_id} on {snapshot_date}")
            return snapshot
            
        except Exception as e:
            db.rollback()
            logger.error(f"Error creating portfolio snapshot for user {user_id}: {e}")
            raise
    
    @staticmethod
    def get_portfolio_history(db: Session, user_id: int, timeframe: str = "1y") -> List[Dict]:
        """Get portfolio history for charting based on timeframe."""
        try:
            # Calculate date range based on timeframe
            end_date = date.today()
            
            if timeframe == "1mo":
                start_date = end_date - timedelta(days=30)
            elif timeframe == "3mo":
                start_date = end_date - timedelta(days=90)
            elif timeframe == "6mo":
                start_date = end_date - timedelta(days=180)
            elif timeframe == "1y":
                start_date = end_date - timedelta(days=365)
            elif timeframe == "max":
                start_date = None  # Get all history
            else:
                start_date = end_date - timedelta(days=365)  # Default to 1 year
            
            # Query snapshots
            query = db.query(PortfolioSnapshot).filter(PortfolioSnapshot.user_id == user_id)
            
            if start_date:
                query = query.filter(PortfolioSnapshot.snapshot_date >= start_date)
            
            snapshots = query.order_by(PortfolioSnapshot.snapshot_date).all()
            
            # Format for frontend charting
            history = []
            for snapshot in snapshots:
                history.append({
                    "date": snapshot.snapshot_date.isoformat(),
                    "total_value": snapshot.total_value,
                    "cash_balance": snapshot.cash_balance,
                    "positions_value": snapshot.positions_value,
                    "return_amount": snapshot.total_value - 100000.0,
                    "return_percentage": ((snapshot.total_value - 100000.0) / 100000.0) * 100
                })
            
            return history
            
        except Exception as e:
            logger.error(f"Error getting portfolio history for user {user_id}: {e}")
            raise
    
    @staticmethod
    async def get_leaderboard_data(db: Session, timeframe: str = "all") -> List[Dict]:
        """Get leaderboard data based on returns or profit."""
        try:
            # For now, calculate based on current values
            # TODO: Implement timeframe-specific calculations using snapshots
            
            users = db.query(User).filter(User.is_active == True).all()
            # Refresh users to ensure all fields are loaded
            for user in users:
                db.refresh(user)
            leaderboard = []
            
            for user in users:
                try:
                    # Calculate current portfolio (this should be cached/optimized)
                    portfolio_data = await PortfolioService.calculate_portfolio_value(db, user.id)
                    
                    logger.info(f"User {user.username}: first_name={user.first_name}, last_name={user.last_name}")
                    leaderboard.append({
                        "first_name": user.first_name,
                        "last_name": user.last_name,
                        "username": user.username,
                        "total_value": portfolio_data["total_value"],
                        "return_amount": portfolio_data["total_return"],
                        "return_percentage": portfolio_data["return_percentage"]
                    })
                except Exception as e:
                    logger.warning(f"Could not calculate portfolio for user {user.username}: {e}")
                    continue
            
            # Sort by return percentage (descending)
            leaderboard.sort(key=lambda x: x["return_percentage"], reverse=True)
            
            # Add rank
            for i, entry in enumerate(leaderboard):
                entry["rank"] = i + 1
            
            return leaderboard
            
        except Exception as e:
            logger.error(f"Error generating leaderboard: {e}")
            raise