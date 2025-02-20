# app/services/portfolio_service.py

import logging
from typing import Dict, Any, List
from datetime import datetime
from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.services.stock_service import StockService
from app.models.trading import Position

logger = logging.getLogger(__name__)

class PortfolioService:
    def __init__(self):
        self.stock_service = StockService()

    @staticmethod
    def get_positions_for_user(db: Session, user_id: int) -> List[Position]:
        """
        Return a list of all positions for the given user.
        """
        return db.query(Position).filter(Position.user_id == user_id).all()

    async def calculate_position_value(self, position: Dict[str, Any]) -> Dict[str, Any]:
        """
        Calculate current value and P&L for a single position dict like:
          {"symbol": "AAPL", "shares": 10, "purchase_price": 150}
        """
        try:
            stock_data = await self.stock_service.get_stock_price(position["symbol"])
            current_price = stock_data["current_price"]

            current_value = current_price * position["shares"]
            cost_basis = position["purchase_price"] * position["shares"]  # Must exist in dict
            unrealized_pl = current_value - cost_basis

            return {
                "symbol": position["symbol"],
                "shares": position["shares"],
                "current_price": current_price,
                "current_value": current_value,
                "cost_basis": cost_basis,
                "unrealized_pl": unrealized_pl,
                "unrealized_pl_percent": (
                    (unrealized_pl / cost_basis) * 100 if cost_basis > 0 else 0
                ),
                "last_updated": datetime.now().isoformat(),
            }
        except Exception as e:
            logger.error(f"Error calculating position value: {str(e)}")
            raise HTTPException(status_code=400, detail=str(e))

    async def get_portfolio_summary(self, positions: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Summarize total value, cost, P&L for a list of positions (dict).
        """
        try:
            position_values = []
            total_value = 0
            total_cost = 0

            for position in positions:
                position_data = await self.calculate_position_value(position)
                position_values.append(position_data)
                total_value += position_data["current_value"]
                total_cost += position_data["cost_basis"]

            return {
                "positions": position_values,
                "total_value": total_value,
                "total_cost": total_cost,
                "total_pl": total_value - total_cost,
                "total_pl_percent": (
                    ((total_value - total_cost) / total_cost) * 100
                    if total_cost > 0
                    else 0
                ),
                "last_updated": datetime.now().isoformat(),
            }
        except Exception as e:
            logger.error(f"Error calculating portfolio summary: {str(e)}")
            raise HTTPException(status_code=400, detail=str(e))
