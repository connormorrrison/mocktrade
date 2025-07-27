# app/domains/trading/repositories.py

from sqlalchemy.orm import Session
from typing import List, Optional
from app.domains.trading.models import Position, Activity, Watchlist
from app.domains.auth.models import User

class PositionRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_user_and_symbol(self, user_id: int, symbol: str) -> Optional[Position]:
        return self.db.query(Position).filter(
            Position.user_id == user_id,
            Position.symbol == symbol
        ).first()

    def get_all_by_user(self, user_id: int) -> List[Position]:
        return self.db.query(Position).filter(Position.user_id == user_id).all()

    def create(self, user_id: int, symbol: str, quantity: float, average_price: float) -> Position:
        position = Position(
            user_id=user_id,
            symbol=symbol,
            quantity=quantity,
            average_price=average_price
        )
        self.db.add(position)
        self.db.commit()
        self.db.refresh(position)
        return position

    def update_quantity_and_price(self, position: Position, new_quantity: float, new_average_price: float) -> Position:
        position.quantity = new_quantity
        position.average_price = new_average_price
        self.db.commit()
        self.db.refresh(position)
        return position

    def delete(self, position: Position) -> None:
        self.db.delete(position)
        self.db.commit()

class ActivityRepository:
    def __init__(self, db: Session):
        self.db = db

    def create(self, user_id: int, position_id: Optional[int], symbol: str, action: str, 
               quantity: float, price: float, total_amount: float) -> Activity:
        activity = Activity(
            user_id=user_id,
            position_id=position_id,
            symbol=symbol,
            action=action,
            quantity=quantity,
            price=price,
            total_amount=total_amount
        )
        self.db.add(activity)
        self.db.commit()
        self.db.refresh(activity)
        return activity

    def get_by_user(self, user_id: int, limit: Optional[int] = None) -> List[Activity]:
        query = self.db.query(Activity).filter(Activity.user_id == user_id).order_by(Activity.created_at.desc())
        if limit:
            query = query.limit(limit)
        return query.all()

    def get_by_user_and_symbol(self, user_id: int, symbol: str) -> List[Activity]:
        return self.db.query(Activity).filter(
            Activity.user_id == user_id,
            Activity.symbol == symbol
        ).order_by(Activity.created_at.desc()).all()

class WatchlistRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_user(self, user_id: int) -> List[Watchlist]:
        return self.db.query(Watchlist).filter(
            Watchlist.user_id == user_id
        ).order_by(Watchlist.created_at).all()

    def get_by_user_and_symbol(self, user_id: int, symbol: str) -> Optional[Watchlist]:
        return self.db.query(Watchlist).filter(
            Watchlist.user_id == user_id,
            Watchlist.symbol == symbol
        ).first()

    def create(self, user_id: int, symbol: str) -> Watchlist:
        watchlist_item = Watchlist(
            user_id=user_id,
            symbol=symbol
        )
        self.db.add(watchlist_item)
        self.db.commit()
        self.db.refresh(watchlist_item)
        return watchlist_item

    def delete(self, watchlist_item: Watchlist) -> None:
        self.db.delete(watchlist_item)
        self.db.commit()

class UserRepository:
    def __init__(self, db: Session):
        self.db = db

    def update_cash_balance(self, user: User, new_balance: float) -> User:
        user.cash_balance = new_balance
        self.db.commit()
        self.db.refresh(user)
        return user

    def get_by_id(self, user_id: int) -> Optional[User]:
        return self.db.query(User).filter(User.id == user_id).first()