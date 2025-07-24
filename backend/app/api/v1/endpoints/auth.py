# app/api/v1/endpoints/auth.py
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta
from app.db.base import get_db
from app.core.security import ACCESS_TOKEN_EXPIRE_MINUTES, create_access_token
from app.services.auth_service import AuthService
from app.schemas.auth import Token, UserCreate, User, UserUpdate, PasswordChange
import logging

logger = logging.getLogger(__name__)
router = APIRouter()

@router.post("/register", response_model=User)
async def register(user_data: UserCreate, db: Session = Depends(get_db)):
    """Register a new user"""
    try:
        logger.info(f"Attempting to register user with email: {user_data.email}")
        return await AuthService.create_user(db, user_data)
    except HTTPException as http_exc:
        logger.error(f"HTTP error during registration: {http_exc.status_code}: {http_exc.detail}")
        raise http_exc
    except Exception as e:
        logger.error(f"Unexpected error during registration: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.post("/login", response_model=Token)
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    """Login user and return JWT token"""
    try:
        user = await AuthService.authenticate_user(db, form_data.username, form_data.password)
        if not user:
            logger.warning(f"Failed login attempt for user: {form_data.username}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password",
                headers={"WWW-Authenticate": "Bearer"},
            )
            
        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": user.email}, expires_delta=access_token_expires
        )
        logger.info(f"Successful login for user: {user.email}")
        return {"access_token": access_token, "token_type": "bearer"}
    except HTTPException as http_exc:
        logger.error(f"HTTP error during login: {http_exc.status_code}: {http_exc.detail}")
        raise http_exc
    except Exception as e:
        logger.error(f"Unexpected error during login: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.get("/me", response_model=User)
async def read_users_me(current_user: User = Depends(AuthService.get_current_user)):
    """Get current user information"""
    return current_user

@router.put("/profile", response_model=User)
async def update_profile(
    profile_data: UserUpdate,
    current_user: User = Depends(AuthService.get_current_user),
    db: Session = Depends(get_db)
):
    """Update user profile"""
    try:
        logger.info(f"Attempting to update profile for user: {current_user.email}")
        logger.info(f"Update data: {profile_data.model_dump()}")

        updated_user = await AuthService.update_user(
            db=db,
            current_email=current_user.email,
            user_data=profile_data
        )
        
        logger.info(f"Successfully updated profile for user: {updated_user.email}")
        return updated_user
        
    except HTTPException as http_exc:
        logger.error(f"HTTP error updating profile: {http_exc.status_code}: {http_exc.detail}")
        raise http_exc
    except Exception as e:
        logger.error(f"Unexpected error updating profile: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.post("/change-password")
async def change_password(
    passwords: PasswordChange,
    current_user: User = Depends(AuthService.get_current_user),
    db: Session = Depends(get_db)
):
    """Change user password"""
    try:
        logger.info(f"Password change requested for user: {current_user.email}")
        
        await AuthService.change_password(
            db=db,
            user=current_user,
            current_password=passwords.current_password,
            new_password=passwords.new_password
        )
        
        logger.info(f"Password successfully changed for user: {current_user.email}")
        return {"message": "Password changed successfully"}
        
    except HTTPException as http_exc:
        logger.error(f"HTTP error changing password: {http_exc.status_code}: {http_exc.detail}")
        raise http_exc
    except Exception as e:
        logger.error(f"Unexpected error changing password: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

@router.delete("/me")
async def delete_user(
    current_user: User = Depends(AuthService.get_current_user),
    db: Session = Depends(get_db)
):
    """Delete current user account (soft delete)"""
    try:
        logger.info(f"Account deletion requested for user: {current_user.email}")
        
        await AuthService.delete_user(db=db, user=current_user)
        
        logger.info(f"Account successfully deleted for user: {current_user.email}")
        return {"message": "Account deleted successfully"}
        
    except HTTPException as http_exc:
        logger.error(f"HTTP error deleting account: {http_exc.status_code}: {http_exc.detail}")
        raise http_exc
    except Exception as e:
        logger.error(f"Unexpected error deleting account: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )