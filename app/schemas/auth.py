# app/schemas/auth.py
from pydantic import BaseModel, EmailStr
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

class User(UserBase):
    id: int
    is_active: bool
    cash_balance: float
    created_at: datetime

    class Config:
        from_attributes = True