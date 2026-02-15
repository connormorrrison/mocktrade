# app/main.py

from fastapi import FastAPI
import logging
import re

from app.core.config import settings
from app.core.middleware import setup_middleware
from app.core.scheduler import start_scheduler, shutdown_scheduler
from app.infrastructure.database import create_tables

# domain API routers
from app.domains.auth.api import router as auth_router
from app.domains.trading.api import router as trading_router
from app.domains.stocks.api import router as stocks_router
from app.domains.portfolio.api import router as portfolio_router
from app.domains.bugs.api import router as bugs_router

# configure logging
logging.basicConfig(level=getattr(logging, settings.LOG_LEVEL))
logger = logging.getLogger(__name__)

# create FastAPI app
app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    openapi_url="/openapi.json"
)

# setup middleware (CORS, logging, etc.)
setup_middleware(app)

# include domain routers
app.include_router(auth_router, prefix="/auth", tags=["auth"])
app.include_router(trading_router, prefix="/trading", tags=["trading"])
app.include_router(stocks_router, prefix="/stocks", tags=["stocks"])
app.include_router(portfolio_router, prefix="/portfolio", tags=["portfolio"])
app.include_router(bugs_router, prefix="/bugs", tags=["bugs"])

@app.on_event("startup")
async def startup_event():
    """Initialize application on startup"""
    logger.info(f"Starting {settings.PROJECT_NAME} v{settings.VERSION}")
    masked_url = re.sub(r"://([^:]+):([^@]+)@", r"://\1:****@", settings.DATABASE_URL)
    logger.info(f"Database: {masked_url}")

    # create database tables
    try:
        create_tables()
        logger.info("Database tables created successfully")
    except Exception as e:
        logger.error(f"Error creating database tables: {e}")
        raise

    # start background scheduler for daily snapshots
    try:
        start_scheduler()
        logger.info("Background scheduler started successfully")
    except Exception as e:
        logger.error(f"Error starting scheduler: {e}")
        # don't raise - app can still function without scheduler

@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup on application shutdown"""
    logger.info("Shutting down application...")
    shutdown_scheduler()

@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "message": f"Welcome to {settings.PROJECT_NAME}",
        "version": settings.VERSION,
        "status": "healthy"
    }

@app.get("/health")
async def health_check():
    """Detailed health check"""
    return {
        "status": "healthy",
        "version": settings.VERSION,
        "database": "connected"
    }
