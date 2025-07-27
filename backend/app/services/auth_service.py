# app/services/auth_service.py
from sqlalchemy.orm import Session
from datetime import timedelta
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from typing import Optional
import logging
from app.core.security import (
    verify_password,
    get_password_hash,
    create_access_token,
    SECRET_KEY,
    ALGORITHM
)
from app.models.user import User
from app.schemas.auth import TokenData, UserCreate, UserUpdate, PasswordChange
from app.db.base import get_db
from app.services.portfolio_service import PortfolioService

logger = logging.getLogger(__name__)
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")

class AuthService:
    @staticmethod
    async def get_user(db: Session, email: str) -> Optional[User]:
        """Retrieves a user from the database by their email address"""
        return db.query(User).filter(User.email == email).first()

    @staticmethod
    async def authenticate_user(db: Session, email: str, password: str) -> Optional[User]:
        """Authenticates a user by verifying their email and password"""
        user = await AuthService.get_user(db, email)
        if not user or not verify_password(password, user.hashed_password):
            return None
        return user

    @staticmethod
    async def create_user(db: Session, user_data: UserCreate) -> User:
        """Creates a new user in the database after validating the input"""
        try:
            logger.info(f"Attempting to create user with email: {user_data.email}")
            
            # Check if email exists
            existing_user = await AuthService.get_user(db, user_data.email)
            if existing_user:
                logger.warning(f"Email already registered: {user_data.email}")
                raise HTTPException(
                    status_code=400,
                    detail="Email already registered"
                )

            # Check if username is taken
            existing_username = db.query(User).filter(User.username == user_data.username).first()
            if existing_username:
                logger.warning(f"Username already taken: {user_data.username}")
                raise HTTPException(
                    status_code=400,
                    detail="Username already taken"
                )

            # Create new user
            try:
                hashed_password = get_password_hash(user_data.password)
                db_user = User(
                    email=user_data.email,
                    username=user_data.username,
                    first_name=user_data.first_name,
                    last_name=user_data.last_name,
                    hashed_password=hashed_password
                )
                db.add(db_user)
                db.commit()
                db.refresh(db_user)
                
                # Create initial portfolio snapshot for the new user
                try:
                    await PortfolioService.create_portfolio_snapshot(db, db_user.id)
                    logger.info(f"Created initial portfolio snapshot for user: {user_data.email}")
                except Exception as snapshot_error:
                    logger.warning(f"Failed to create initial portfolio snapshot for {user_data.email}: {snapshot_error}")
                    # Don't fail user creation if snapshot creation fails
                
                logger.info(f"Successfully created user: {user_data.email}")
                return db_user
            except Exception as e:
                db.rollback()
                logger.error(f"Database error while creating user: {str(e)}")
                raise HTTPException(
                    status_code=500,
                    detail=f"Database error: {str(e)}"
                )

        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Unexpected error in create_user: {str(e)}")
            raise HTTPException(
                status_code=500,
                detail=f"Unexpected error: {str(e)}"
            )

    @staticmethod
    async def update_user(db: Session, current_email: str, user_data: UserUpdate) -> User:
        """Updates user profile information with validation"""
        try:
            logger.info(f"Attempting to update user profile: {current_email}")
            
            user = await AuthService.get_user(db, current_email)
            if not user:
                logger.error(f"User not found: {current_email}")
                raise HTTPException(status_code=404, detail="User not found")

            # Email validation
            if user_data.email != current_email:
                existing_email = await AuthService.get_user(db, user_data.email)
                if existing_email:
                    logger.warning(f"Email already taken: {user_data.email}")
                    raise HTTPException(
                        status_code=400,
                        detail="Email already registered"
                    )

            # Username validation
            if user_data.username != user.username:
                existing_username = db.query(User).filter(
                    User.username == user_data.username
                ).first()
                if existing_username:
                    logger.warning(f"Username already taken: {user_data.username}")
                    raise HTTPException(
                        status_code=400,
                        detail="Username already taken"
                    )

            # Update fields
            user.email = user_data.email
            user.username = user_data.username
            user.first_name = user_data.first_name
            user.last_name = user_data.last_name

            db.commit()
            db.refresh(user)
            logger.info(f"Successfully updated user profile: {user.email}")
            return user
        except HTTPException:
            db.rollback()
            raise
        except Exception as e:
            db.rollback()
            logger.error(f"Error updating user profile: {str(e)}")
            raise HTTPException(
                status_code=500,
                detail=f"An error occurred while updating the profile"
            )

    @staticmethod
    async def change_password(
        db: Session,
        user: User,
        current_password: str,
        new_password: str
    ) -> None:
        """Changes a user's password with validation"""
        try:
            logger.info(f"Attempting to change password for user: {user.email}")
            
            if not verify_password(current_password, user.hashed_password):
                logger.warning(f"Invalid current password for user: {user.email}")
                raise HTTPException(
                    status_code=400,
                    detail="Current password is incorrect"
                )
            
            if len(new_password) < 8:
                logger.warning(f"New password too short for user: {user.email}")
                raise HTTPException(
                    status_code=400,
                    detail="Password must be at least 8 characters long"
                )
            
            user.hashed_password = get_password_hash(new_password)
            db.commit()
            logger.info(f"Successfully changed password for user: {user.email}")
        
        except HTTPException:
            db.rollback()
            raise
        except Exception as e:
            db.rollback()
            logger.error(f"Error changing password: {str(e)}")
            raise HTTPException(
                status_code=500,
                detail="An error occurred while changing the password"
            )

    @staticmethod
    async def get_current_user(
        db: Session = Depends(get_db),
        token: str = Depends(oauth2_scheme)
    ) -> User:
        """Retrieves the currently authenticated user based on a JWT token"""
        credentials_exception = HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
            email: str = payload.get("sub")
            if email is None:
                raise credentials_exception
            token_data = TokenData(email=email)
        except JWTError:
            raise credentials_exception
            
        user = await AuthService.get_user(db, token_data.email)
        if user is None:
            raise credentials_exception
        return user

    @staticmethod
    async def delete_user(db: Session, user: User) -> None:
        """Soft deletes a user account"""
        try:
            logger.info(f"Attempting to delete user account: {user.email}")
            
            # Soft delete by setting is_active to False
            user.is_active = False
            db.commit()
            
            logger.info(f"Successfully deleted user account: {user.email}")
        
        except Exception as e:
            db.rollback()
            logger.error(f"Error deleting user account: {str(e)}")
            raise HTTPException(
                status_code=500,
                detail="An error occurred while deleting the account"
            )