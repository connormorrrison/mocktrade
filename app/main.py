# app/main.py

from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from app.services.auth_service import AuthService

app = FastAPI(
    title="Stock Trading Simulator",
    description="A mock trading platform for learning stock trading",
    version="0.1.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Import routers
from app.api.v1.endpoints import stocks, auth, trading

# Public routes
app.include_router(auth.router, prefix="/api/v1/auth", tags=["auth"])

# Protected routes
app.include_router(
    stocks.router,
    prefix="/api/v1/stocks",
    tags=["stocks"],
    dependencies=[Depends(AuthService.get_current_user)]
)

app.include_router(
    trading.router,
    prefix="/api/v1/trading",
    tags=["trading"],
    dependencies=[Depends(AuthService.get_current_user)]
)

@app.get("/")
async def root():
    return {
        "message": "Welcome to Stock Trading Simulator API",
        "version": "0.1.0",
        "docs_url": "/docs"
    }