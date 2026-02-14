# app/domains/auth/services.py

from sqlalchemy.orm import Session
from datetime import timedelta
from typing import Optional
import logging

from app.core.security import verify_password, get_password_hash, create_access_token
from app.domains.auth.models import User
from app.domains.auth.schemas import UserCreate, UserUpdate, PasswordChange
from app.domains.auth.repositories import UserRepository
from app.domains.auth.exceptions import (
    InvalidCredentialsError,
    UserNotFoundError,
    WeakPasswordError,
    UserInactiveError,
    GoogleAuthError
)

logger = logging.getLogger(__name__)

class AuthService:
    def __init__(self, db: Session):
        self.db = db
        self.user_repository = UserRepository(db)

    def register_user(self, user_data: UserCreate) -> User:
        """Register a new user with validation"""
        logger.info(f"Attempting to register user: {user_data.email}")
        
        # Additional password validation
        if len(user_data.password) < 8:
            raise WeakPasswordError("Password must be at least 8 characters long")
        
        # Hash password
        hashed_password = get_password_hash(user_data.password)
        
        # Create user
        user = self.user_repository.create(user_data, hashed_password)
        
        logger.info(f"Successfully registered user: {user.email}")
        return user

    def authenticate_user(self, email: str, password: str) -> User:
        """Authenticate user by email and password"""
        user = self.user_repository.get_by_email(email)

        if not user:
            raise InvalidCredentialsError("Invalid email or password")

        if not user.is_active:
            raise UserInactiveError("Account is deactivated")

        if user.hashed_password is None:
            raise InvalidCredentialsError("This account uses Google Sign-In. Please log in with Google.")

        if not verify_password(password, user.hashed_password):
            raise InvalidCredentialsError("Invalid email or password")
        
        logger.info(f"Successful authentication for user: {email}")
        return user

    def create_access_token(self, user: User) -> str:
        """Create JWT access token for user"""
        token_data = {"sub": user.email}
        access_token_expires = timedelta(hours=24)
        return create_access_token(data=token_data, expires_delta=access_token_expires)

    def get_user_by_email(self, email: str) -> Optional[User]:
        """Get user by email"""
        return self.user_repository.get_by_email(email)

    def get_user_by_id(self, user_id: int) -> Optional[User]:
        """Get user by ID"""
        return self.user_repository.get_by_id(user_id)

    def update_user_profile(self, user: User, user_data: UserUpdate) -> User:
        """Update user profile information"""
        logger.info(f"Updating profile for user: {user.email}")
        updated_user = self.user_repository.update(user, user_data)
        logger.info(f"Successfully updated profile for user: {updated_user.email}")
        return updated_user

    def google_login(self, google_id_info: dict) -> tuple[User, bool]:
        """Find or create a user from Google ID token info. Returns (user, is_new)."""
        email = google_id_info.get("email")
        if not email:
            raise GoogleAuthError("Google token did not contain an email address")

        existing_user = self.user_repository.get_by_email(email)
        if existing_user:
            if not existing_user.is_active:
                raise UserInactiveError("Account is deactivated")
            logger.info(f"Google login for existing user: {email}")
            return existing_user, False

        # Create new user from Google info
        first_name = google_id_info.get("given_name", "")
        last_name = google_id_info.get("family_name", "")
        user = self.user_repository.create_google_user(email, first_name, last_name)
        logger.info(f"Created new Google user: {email}")
        return user, True

    def change_password(self, user: User, passwords: PasswordChange) -> None:
        """Change user password with validation"""
        logger.info(f"Password change requested for user: {user.email}")

        if user.hashed_password is None:
            raise InvalidCredentialsError("Cannot change password for a Google Sign-In account")

        # Verify current password
        if not verify_password(passwords.current_password, user.hashed_password):
            raise InvalidCredentialsError("Current password is incorrect")
        
        # Validate new password
        if len(passwords.new_password) < 8:
            raise WeakPasswordError("Password must be at least 8 characters long")
        
        # Hash and update password
        hashed_password = get_password_hash(passwords.new_password)
        self.user_repository.update_password(user, hashed_password)
        
        logger.info(f"Successfully changed password for user: {user.email}")

    def deactivate_user(self, user: User) -> User:
        """Soft delete user account"""
        logger.info(f"Deactivating user account: {user.email}")
        deactivated_user = self.user_repository.deactivate(user)
        logger.info(f"Successfully deactivated user account: {user.email}")
        return deactivated_user