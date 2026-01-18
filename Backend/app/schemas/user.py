"""
User schemas
"""

from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime


class UserBase(BaseModel):
    """Base user schema"""
    email: EmailStr
    name: Optional[str] = None
    role: str


class UserCreate(UserBase):
    """User creation schema"""
    password: str


class UserUpdate(BaseModel):
    """User update schema"""
    name: Optional[str] = None
    college: Optional[str] = None
    branch: Optional[str] = None
    year: Optional[str] = None
    graduation_year: Optional[str] = None
    location: Optional[str] = None
    cgpa: Optional[str] = None
    phone: Optional[str] = None
    company_name: Optional[str] = None


class UserResponse(UserBase):
    """User response schema"""
    id: int
    college: Optional[str] = None
    branch: Optional[str] = None
    year: Optional[str] = None
    graduation_year: Optional[str] = None
    location: Optional[str] = None
    cgpa: Optional[str] = None
    phone: Optional[str] = None
    company_name: Optional[str] = None
    is_verified: bool
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True
