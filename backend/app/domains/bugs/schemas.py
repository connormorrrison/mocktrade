# app/domains/bugs/schemas.py

from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime

class BugReportCreate(BaseModel):
    """Schema for creating a new bug report"""
    title: str = Field(..., min_length=1, max_length=255, description="Brief description of the bug")
    description: str = Field(..., min_length=1, description="Detailed description of the bug")
    email: Optional[EmailStr] = Field(None, description="Optional contact email")

class BugReportResponse(BaseModel):
    """Schema for bug report response"""
    id: int
    user_id: Optional[int]
    title: str
    description: str
    email: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True
