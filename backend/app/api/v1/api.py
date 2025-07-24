# app/api/v1/api.py
from fastapi import APIRouter
from app.api.v1.endpoints import auth, trading, stocks, watchlist, portfolio
import logging

logger = logging.getLogger(__name__)

api_router = APIRouter()

# Register the routers with debug logging
logger.info("Registering auth routes")
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])

logger.info("Registering trading routes")
api_router.include_router(trading.router, prefix="/trading", tags=["trading"])

logger.info("Registering stocks routes")
api_router.include_router(stocks.router, prefix="/stocks", tags=["stocks"])

logger.info("Registering watchlist routes")
api_router.include_router(watchlist.router, prefix="/watchlist", tags=["watchlist"])

logger.info("Registering portfolio routes")
api_router.include_router(portfolio.router, prefix="/portfolio", tags=["portfolio"])

logger.info("All routes registered")