# app/services/portfolio_service.py

import sys
from pathlib import Path

# Add the project root directory to Python path
# project_root = str(Path(__file__).parent.parent.parent)
# sys.path.append(project_root)

import yfinance as yf
from fastapi import HTTPException
import logging
from typing import Dict, Any, List
from datetime import datetime
from app.services.stock_service import StockService

logger = logging.getLogger(__name__)

class PortfolioService:
    def __init__(self):
        self.stock_service = StockService()

    async def calculate_position_value(self, position: Dict[str, Any]) -> Dict[str, Any]:
        """
        Calculate current value and P&L for a single position
        """
        try:
            stock_data = await self.stock_service.get_stock_price(position["symbol"])
            current_price = stock_data["current_price"]
            
            current_value = current_price * position["shares"]
            cost_basis = position["purchase_price"] * position["shares"]
            unrealized_pl = current_value - cost_basis
            
            return {
                "symbol": position["symbol"],
                "shares": position["shares"],
                "current_price": current_price,
                "current_value": current_value,
                "cost_basis": cost_basis,
                "unrealized_pl": unrealized_pl,
                "unrealized_pl_percent": (unrealized_pl / cost_basis * 100) if cost_basis > 0 else 0,
                "last_updated": datetime.now().isoformat()
            }
        except Exception as e:
            logger.error(f"Error calculating position value: {str(e)}")
            raise HTTPException(status_code=400, detail=str(e))

    async def get_portfolio_summary(self, positions: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Calculate total portfolio value and performance
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
                "total_pl_percent": ((total_value - total_cost) / total_cost * 100) if total_cost > 0 else 0,
                "last_updated": datetime.now().isoformat()
            }
        except Exception as e:
            logger.error(f"Error calculating portfolio summary: {str(e)}")
            raise HTTPException(status_code=400, detail=str(e))
        
# DEBUGGING
# if __name__ == "__main__":
#     import asyncio

#     portfolio_service = PortfolioService()

#     async def main():
#         try:
#             # Define a sample position
#             sample_position = {
#                 "symbol": "AAPL",
#                 "shares": 10,
#                 "purchase_price": 150.0  # Assume the purchase price was $150 per share
#             }

#             # Calculate position value
#             position_value = await portfolio_service.calculate_position_value(sample_position)
#             print("Position Value:", position_value)

#             # Define a sample portfolio with multiple positions
#             sample_portfolio = [
#                 {"symbol": "AAPL", "shares": 10, "purchase_price": 150.0},
#                 {"symbol": "MSFT", "shares": 5, "purchase_price": 200.0}
#             ]

#             # Get portfolio summary
#             portfolio_summary = await portfolio_service.get_portfolio_summary(sample_portfolio)
#             print("Portfolio Summary:", portfolio_summary)

#         except HTTPException as e:
#             print(f"HTTPException: {e.detail}")

#     asyncio.run(main())
