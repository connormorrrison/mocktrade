# app/main.py

from fastapi import FastAPI
import logging

from app.core.config import settings
from app.core.middleware import setup_middleware
from app.infrastructure.database import create_tables

# Domain API routers
from app.domains.auth.api import router as auth_router
from app.domains.trading.api import router as trading_router
from app.domains.stocks.api import router as stocks_router
from app.domains.portfolio.api import router as portfolio_router

# Configure logging
logging.basicConfig(level=getattr(logging, settings.LOG_LEVEL))
logger = logging.getLogger(__name__)

# Create FastAPI app
app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# Setup middleware (CORS, logging, etc.)
setup_middleware(app)

# Include domain routers
app.include_router(auth_router, prefix=f"{settings.API_V1_STR}/auth", tags=["auth"])
app.include_router(trading_router, prefix=f"{settings.API_V1_STR}/trading", tags=["trading"])
app.include_router(stocks_router, prefix=f"{settings.API_V1_STR}/stocks", tags=["stocks"])
app.include_router(portfolio_router, prefix=f"{settings.API_V1_STR}/portfolio", tags=["portfolio"])

@app.on_event("startup")
async def startup_event():
    """Initialize application on startup"""
    logger.info(f"Starting {settings.PROJECT_NAME} v{settings.VERSION}")
    logger.info(f"Database: {settings.DATABASE_URL}")
    
    # Create database tables
    try:
        create_tables()
        logger.info("Database tables created successfully")
    except Exception as e:
        logger.error(f"Error creating database tables: {e}")
        raise

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
