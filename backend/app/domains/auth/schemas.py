# app/domains/auth/schemas.py

from pydantic import BaseModel, EmailStr, validator, Field
from typing import Optional
from datetime import datetime
import re

# Request schemas
class UserCreate(BaseModel):
    first_name: str = Field(..., min_length=1, max_length=50)
    last_name: str = Field(..., min_length=1, max_length=50)
    email: EmailStr
    username: str = Field(..., min_length=3, max_length=30)
    password: str = Field(..., min_length=8, max_length=128)

    @validator('first_name', 'last_name')
    def validate_names(cls, v):
        if not v or not v.strip():
            raise ValueError('Name cannot be empty or just whitespace')
        # Strip and normalize
        v = v.strip()
        # Check for valid characters - basic letters plus common accented characters
        if not re.match(r"^[a-zA-ZÀ-ÿ\s\-']+$", v):
            raise ValueError('Name can only contain letters, spaces, hyphens, and apostrophes')
        # Reject obvious SQL injection patterns
        if re.search(r"(';\s*DROP|'--|\b(UNION|SELECT|INSERT|DELETE|UPDATE)\b)", v, re.IGNORECASE):
            raise ValueError('Invalid characters detected')
        return v.title()  # Capitalize properly

    @validator('username')
    def validate_username(cls, v):
        if not v or not v.strip():
            raise ValueError('Username cannot be empty or just whitespace')
        v = v.strip().lower()  # Normalize to lowercase
        # Username: alphanumeric, underscores, and dots only
        if not re.match(r"^[a-zA-Z0-9_.]+$", v):
            raise ValueError('Username can only contain letters, numbers, underscores, and dots')
        if v.startswith('.') or v.endswith('.'):
            raise ValueError('Username cannot start or end with a dot')
        return v

    @validator('password')
    def validate_password(cls, v):
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters long')
        # Add more password strength checks
        if not re.search(r'[A-Za-z]', v):
            raise ValueError('Password must contain at least one letter')
        if not re.search(r'[0-9]', v):
            raise ValueError('Password must contain at least one number')
        return v

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class GoogleLoginRequest(BaseModel):
    credential: str

class UserUpdate(BaseModel):
    first_name: Optional[str] = Field(None, min_length=1, max_length=50)
    last_name: Optional[str] = Field(None, min_length=1, max_length=50)
    email: Optional[EmailStr] = None
    username: Optional[str] = Field(None, min_length=3, max_length=30)

    @validator('first_name', 'last_name')
    def validate_names(cls, v):
        if v is not None:
            if not v.strip():
                raise ValueError('Name cannot be empty or just whitespace')
            v = v.strip()
            if not re.match(r"^[a-zA-ZÀ-ÿ\s\-']+$", v):
                raise ValueError('Name can only contain letters, spaces, hyphens, and apostrophes')
            # Reject obvious SQL injection patterns
            if re.search(r"(';\s*DROP|'--|\b(UNION|SELECT|INSERT|DELETE|UPDATE)\b)", v, re.IGNORECASE):
                raise ValueError('Invalid characters detected')
            return v.title()
        return v

    @validator('username')
    def validate_username(cls, v):
        if v is not None:
            if not v.strip():
                raise ValueError('Username cannot be empty or just whitespace')
            v = v.strip().lower()
            if not re.match(r"^[a-zA-Z0-9_.]+$", v):
                raise ValueError('Username can only contain letters, numbers, underscores, and dots')
            if v.startswith('.') or v.endswith('.'):
                raise ValueError('Username cannot start or end with a dot')
            return v
        return v

class PasswordChange(BaseModel):
    current_password: str
    new_password: str

    @validator('new_password')
    def validate_new_password(cls, v):
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters long')
        return v

# Response schemas
class User(BaseModel):
    id: int
    first_name: str
    last_name: str
    email: str
    username: str
    cash_balance: float
    created_at: datetime
    is_active: bool
    auth_provider: str = "local"

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None