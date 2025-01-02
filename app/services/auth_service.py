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
from app.schemas.auth import TokenData, UserCreate
from app.db.base import get_db

logger = logging.getLogger(__name__)
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")  # Add leading slash

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
            
            # Check if user exists
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