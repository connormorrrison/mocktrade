# app/core/dependencies.py

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from typing import Optional

from app.infrastructure.database import SessionLocal
from app.core.security import verify_token
from app.domains.auth.repositories import UserRepository
from app.domains.auth.models import User

security = HTTPBearer()

def get_db():
    """Database dependency"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> User:
    """Get current authenticated user"""
    token = credentials.credentials
    
    # verify token
    payload = verify_token(token)
    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # get user email from token
    email: str = payload.get("sub")
    if email is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # get user from database
    user_repo = UserRepository(db)
    user = user_repo.get_by_email(email)
    
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found.",
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Inactive user."
        )
    
    return user

def get_current_active_user(current_user: User = Depends(get_current_user)) -> User:
    """Get current active user (alias for consistency)"""
    return current_user

def get_optional_user(
    db: Session = Depends(get_db),
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(HTTPBearer(auto_error=False))
) -> Optional[User]:
    """Get current user if authenticated, None otherwise (for optional auth endpoints)"""
    if credentials is None:
        return None

    try:
        token = credentials.credentials

        # verify token
        payload = verify_token(token)
        if payload is None:
            return None

        # get user email from token
        email: str = payload.get("sub")
        if email is None:
            return None

        # get user from database
        user_repo = UserRepository(db)
        user = user_repo.get_by_email(email)

        if user is None or not user.is_active:
            return None

        return user
    except Exception:
        return None