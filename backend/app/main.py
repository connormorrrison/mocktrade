# app/main.py

from fastapi import FastAPI
import logging
import re

from app.core.config import settings
from app.core.middleware import setup_middleware
from sqlalchemy import text
from app.core.scheduler import start_scheduler, shutdown_scheduler, backfill_missing_snapshots
from app.infrastructure.database import create_tables, SessionLocal

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
    db_available = False
    try:
        create_tables()
        logger.info("Database tables created successfully")
        db_available = True
    except Exception as e:
        logger.error(f"Database unavailable at startup: {e}")
        logger.warning("App starting in degraded mode - DB features will fail until DB is restored")

    if db_available:
        # backfill missing snapshots before scheduler creates today's live snapshot
        try:
            await backfill_missing_snapshots()
        except Exception as e:
            logger.error(f"Error during snapshot backfill: {e}")

        # start background scheduler for daily snapshots
        try:
            start_scheduler()
            logger.info("Background scheduler started successfully")
        except Exception as e:
            logger.error(f"Error starting scheduler: {e}")

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
    """Detailed health check - tests actual DB connectivity"""
    db_status = "disconnected"
    try:
        db = SessionLocal()
        try:
            db.execute(text("SELECT 1"))
            db_status = "connected"
        finally:
            db.close()
    except Exception as e:
        logger.warning(f"Health check DB probe failed: {e}")

    return {
        "status": "healthy" if db_status == "connected" else "degraded",
        "version": settings.VERSION,
        "database": db_status
    }

@app.get("/health/db")
async def health_db_ping():
    """
    DB keep-alive endpoint. Hit this with an external cron (e.g. cron-job.org)
    every 24h to prevent Supabase free-tier from pausing the database.
    """
    try:
        db = SessionLocal()
        try:
            db.execute(text("SELECT 1"))
        finally:
            db.close()
        return {"database": "connected"}
    except Exception as e:
        logger.error(f"DB keep-alive ping failed: {e}")
        return {"database": "disconnected", "error": str(e)}
