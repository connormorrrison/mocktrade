# app/schemas/auth.py
from pydantic import BaseModel, EmailStr, constr
from datetime import datetime

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: str | None = None

class UserBase(BaseModel):
    email: EmailStr
    username: str
    first_name: str
    last_name: str

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserUpdate(BaseModel):
    email: EmailStr
    username: str
    first_name: str
    last_name: str

class PasswordChange(BaseModel):
    current_password: str
    new_password: constr(min_length=8)  # Enforces minimum password length

class User(UserBase):
    id: int
    is_active: bool
    cash_balance: float
    created_at: datetime

    class Config:
        from_attributes = True