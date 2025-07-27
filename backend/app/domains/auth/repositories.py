# app/domains/auth/repositories.py

from sqlalchemy.orm import Session
from typing import Optional
from app.domains.auth.models import User
from app.domains.auth.schemas import UserCreate, UserUpdate
from app.domains.auth.exceptions import EmailAlreadyExistsError, UsernameAlreadyExistsError

class UserRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, user_id: int) -> Optional[User]:
        return self.db.query(User).filter(User.id == user_id).first()

    def get_by_email(self, email: str) -> Optional[User]:
        return self.db.query(User).filter(User.email == email).first()

    def get_by_username(self, username: str) -> Optional[User]:
        return self.db.query(User).filter(User.username == username).first()

    def create(self, user_data: UserCreate, hashed_password: str) -> User:
        # Check if email already exists
        if self.get_by_email(user_data.email):
            raise EmailAlreadyExistsError(f"Email {user_data.email} already registered")
        
        # Check if username already exists
        if self.get_by_username(user_data.username):
            raise UsernameAlreadyExistsError(f"Username {user_data.username} already taken")

        db_user = User(
            first_name=user_data.first_name,
            last_name=user_data.last_name,
            email=user_data.email,
            username=user_data.username,
            hashed_password=hashed_password,
            cash_balance=100000.0,  # Starting balance
            is_active=True
        )
        
        self.db.add(db_user)
        self.db.commit()
        self.db.refresh(db_user)
        return db_user

    def update(self, user: User, user_data: UserUpdate) -> User:
        # Check email uniqueness if being updated
        if user_data.email and user_data.email != user.email:
            if self.get_by_email(user_data.email):
                raise EmailAlreadyExistsError(f"Email {user_data.email} already registered")
        
        # Check username uniqueness if being updated
        if user_data.username and user_data.username != user.username:
            if self.get_by_username(user_data.username):
                raise UsernameAlreadyExistsError(f"Username {user_data.username} already taken")

        # Update fields
        update_data = user_data.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(user, field, value)

        self.db.commit()
        self.db.refresh(user)
        return user

    def update_password(self, user: User, hashed_password: str) -> User:
        user.hashed_password = hashed_password
        self.db.commit()
        self.db.refresh(user)
        return user

    def deactivate(self, user: User) -> User:
        user.is_active = False
        self.db.commit()
        self.db.refresh(user)
        return user

    def get_all_active(self) -> list[User]:
        return self.db.query(User).filter(User.is_active == True).all()