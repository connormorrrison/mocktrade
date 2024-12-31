# app/api/v1/endpoints/auth.py

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta
from app.db.base import get_db
from app.core.security import ACCESS_TOKEN_EXPIRE_MINUTES, create_access_token
from app.services.auth_service import AuthService
from app.schemas.auth import Token, UserCreate, User

router = APIRouter()

"""Endpoint to register a new user"""
@router.post("/register", response_model=User)
async def register(user_data: UserCreate, db: Session = Depends(get_db)):
    """Register a new user"""
    return await AuthService.create_user(db, user_data)

"""Endpoint to log in a user and return a JWT token"""
@router.post("/login", response_model=Token)
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    """Login user and return JWT token"""
    user = await AuthService.authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

"""Endpoint to get information about the currently logged in user"""
@router.get("/me", response_model=User)
async def read_users_me(
    current_user: User = Depends(AuthService.get_current_user)
):
    """Get current user information"""
    return current_user