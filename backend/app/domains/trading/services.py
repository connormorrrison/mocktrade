# app/domains/trading/services.py

from sqlalchemy.orm import Session
from typing import List, Optional
import logging

from app.domains.trading.models import Position, Activity, Watchlist
from app.domains.trading.repositories import PositionRepository, ActivityRepository, WatchlistRepository, UserRepository
from app.domains.trading.schemas import OrderCreate, WatchlistCreate, TradeConfirmation, PositionDetail
from app.domains.auth.models import User
from app.core.exceptions import BusinessLogicError

logger = logging.getLogger(__name__)

class TradingError(BusinessLogicError):
    """Base exception for trading domain"""
    pass

class InsufficientFundsError(TradingError):
    """Raised when user doesn't have enough cash for purchase"""
    pass

class InsufficientSharesError(TradingError):
    """Raised when user doesn't have enough shares to sell"""
    pass

class InvalidStockSymbolError(TradingError):
    """Raised when stock symbol is invalid"""
    pass

class TradingService:
    def __init__(self, db: Session):
        self.db = db
        self.position_repo = PositionRepository(db)
        self.activity_repo = ActivityRepository(db)
        self.watchlist_repo = WatchlistRepository(db)
        self.user_repo = UserRepository(db)

    async def execute_order(self, user: User, order: OrderCreate, current_price: float) -> TradeConfirmation:
        """Execute a buy or sell order"""
        logger.info(f"Executing {order.action} order: {order.quantity} shares of {order.symbol} for user {user.id}")
        
        total_amount = order.quantity * current_price
        
        if order.action == "buy":
            return await self._execute_buy_order(user, order, current_price, total_amount)
        elif order.action == "sell":
            return await self._execute_sell_order(user, order, current_price, total_amount)
        else:
            raise TradingError(f"Invalid order action: {order.action}")

    async def _execute_buy_order(self, user: User, order: OrderCreate, current_price: float, total_amount: float) -> TradeConfirmation:
        """Execute a buy order"""
        # Check if user has sufficient funds
        if user.cash_balance < total_amount:
            raise InsufficientFundsError(f"Insufficient funds. Required: ${total_amount:.2f}, Available: ${user.cash_balance:.2f}")
        
        # Get or create position
        position = self.position_repo.get_by_user_and_symbol(user.id, order.symbol)
        
        if position:
            # Update existing position
            new_quantity = position.quantity + order.quantity
            new_average_price = ((position.quantity * position.average_price) + total_amount) / new_quantity
            position = self.position_repo.update_quantity_and_price(position, new_quantity, new_average_price)
        else:
            # Create new position
            position = self.position_repo.create(user.id, order.symbol, order.quantity, current_price)
        
        # Update user's cash balance
        new_cash_balance = user.cash_balance - total_amount
        self.user_repo.update_cash_balance(user, new_cash_balance)
        
        # Record the activity
        activity = self.activity_repo.create(
            user_id=user.id,
            position_id=position.id,
            symbol=order.symbol,
            action=order.action,
            quantity=order.quantity,
            price=current_price,
            total_amount=total_amount
        )
        
        logger.info(f"Buy order executed successfully for user {user.id}")
        
        return TradeConfirmation(
            id=activity.id,
            symbol=order.symbol,
            action=order.action,
            quantity=order.quantity,
            price=current_price,
            total_amount=total_amount,
            remaining_cash=new_cash_balance,
            created_at=activity.created_at
        )

    async def _execute_sell_order(self, user: User, order: OrderCreate, current_price: float, total_amount: float) -> TradeConfirmation:
        """Execute a sell order"""
        # Get existing position
        position = self.position_repo.get_by_user_and_symbol(user.id, order.symbol)
        
        if not position:
            raise InsufficientSharesError(f"No position found for {order.symbol}")
        
        if position.quantity < order.quantity:
            raise InsufficientSharesError(f"Insufficient shares. Required: {order.quantity}, Available: {position.quantity}")
        
        # Update position
        new_quantity = position.quantity - order.quantity
        
        if new_quantity == 0:
            # Delete position if no shares left
            self.position_repo.delete(position)
            position_id = None
        else:
            # Update position quantity (keep same average price)
            position = self.position_repo.update_quantity_and_price(position, new_quantity, position.average_price)
            position_id = position.id
        
        # Update user's cash balance
        new_cash_balance = user.cash_balance + total_amount
        self.user_repo.update_cash_balance(user, new_cash_balance)
        
        # Record the activity
        activity = self.activity_repo.create(
            user_id=user.id,
            position_id=position_id,
            symbol=order.symbol,
            action=order.action,
            quantity=order.quantity,
            price=current_price,
            total_amount=total_amount
        )
        
        logger.info(f"Sell order executed successfully for user {user.id}")
        
        return TradeConfirmation(
            id=activity.id,
            symbol=order.symbol,
            action=order.action,
            quantity=order.quantity,
            price=current_price,
            total_amount=total_amount,
            remaining_cash=new_cash_balance,
            created_at=activity.created_at
        )

    def get_user_positions(self, user_id: int) -> List[Position]:
        """Get all positions for a user"""
        return self.position_repo.get_all_by_user(user_id)

    def get_user_activities(self, user_id: int, limit: Optional[int] = None) -> List[Activity]:
        """Get user's trading activities"""
        return self.activity_repo.get_by_user(user_id, limit)

    def get_position_by_symbol(self, user_id: int, symbol: str) -> Optional[Position]:
        """Get specific position for user and symbol"""
        return self.position_repo.get_by_user_and_symbol(user_id, symbol)

    # Watchlist methods
    def get_user_watchlist(self, user_id: int) -> List[Watchlist]:
        """Get user's watchlist"""
        return self.watchlist_repo.get_by_user(user_id)

    def add_to_watchlist(self, user_id: int, watchlist_data: WatchlistCreate) -> Watchlist:
        """Add stock to user's watchlist"""
        # Check if already exists
        existing = self.watchlist_repo.get_by_user_and_symbol(user_id, watchlist_data.symbol)
        if existing:
            raise TradingError(f"Stock {watchlist_data.symbol} is already in your watchlist")
        
        return self.watchlist_repo.create(user_id, watchlist_data.symbol)

    def remove_from_watchlist(self, user_id: int, symbol: str) -> None:
        """Remove stock from user's watchlist"""
        watchlist_item = self.watchlist_repo.get_by_user_and_symbol(user_id, symbol)
        if not watchlist_item:
            raise TradingError(f"Stock {symbol} not found in your watchlist")
        
        self.watchlist_repo.delete(watchlist_item)