# app/domains/auth/api.py

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
import logging

from app.core.dependencies import get_db, get_current_user
from app.domains.auth.models import User
from app.domains.auth.schemas import UserCreate, User as UserResponse, Token, UserUpdate, PasswordChange
from app.domains.auth.services import AuthService
from app.domains.auth.exceptions import (
    InvalidCredentialsError,
    EmailAlreadyExistsError,
    UsernameAlreadyExistsError,
    WeakPasswordError,
    UserInactiveError
)

logger = logging.getLogger(__name__)
router = APIRouter()

@router.post("/register", response_model=UserResponse)
async def register(user_data: UserCreate, db: Session = Depends(get_db)):
    """Register a new user"""
    try:
        auth_service = AuthService(db)
        user = auth_service.register_user(user_data)
        
        # Create initial portfolio snapshot
        try:
            from app.domains.portfolio.services import PortfolioService
            portfolio_service = PortfolioService(db)
            await portfolio_service.create_snapshot(user.id)
            logger.info(f"Created initial portfolio snapshot for user: {user.email}")
        except Exception as e:
            logger.warning(f"Failed to create initial portfolio snapshot: {e}")
            # Don't fail registration if snapshot creation fails
        
        return user
        
    except (EmailAlreadyExistsError, UsernameAlreadyExistsError, WeakPasswordError) as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        logger.error(f"Unexpected error during registration: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Registration failed")

@router.post("/login", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    """Login user and return JWT token"""
    try:
        auth_service = AuthService(db)
        user = auth_service.authenticate_user(form_data.username, form_data.password)
        access_token = auth_service.create_access_token(user)
        
        return {"access_token": access_token, "token_type": "bearer"}
        
    except (InvalidCredentialsError, UserInactiveError) as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(e),
            headers={"WWW-Authenticate": "Bearer"},
        )
    except Exception as e:
        logger.error(f"Unexpected error during login: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Login failed")

@router.get("/me", response_model=UserResponse)
async def get_current_user_info(current_user: User = Depends(get_current_user)):
    """Get current user information"""
    return current_user

@router.put("/profile", response_model=UserResponse)
async def update_profile(
    profile_data: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update user profile"""
    try:
        auth_service = AuthService(db)
        updated_user = auth_service.update_user_profile(current_user, profile_data)
        return updated_user
        
    except (EmailAlreadyExistsError, UsernameAlreadyExistsError) as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        logger.error(f"Error updating profile: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Profile update failed")

@router.post("/change-password")
async def change_password(
    passwords: PasswordChange,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Change user password"""
    try:
        auth_service = AuthService(db)
        auth_service.change_password(current_user, passwords)
        return {"message": "Password changed successfully"}
        
    except (InvalidCredentialsError, WeakPasswordError) as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        logger.error(f"Error changing password: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Password change failed")

@router.delete("/me")
async def delete_account(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete current user account (soft delete)"""
    try:
        auth_service = AuthService(db)
        auth_service.deactivate_user(current_user)
        return {"message": "Account deleted successfully"}
        
    except Exception as e:
        logger.error(f"Error deleting account: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Account deletion failed")