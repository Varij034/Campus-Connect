"""
Authentication schemas
"""

from pydantic import BaseModel, EmailStr, Field
from typing import Optional


class UserRegister(BaseModel):
    """User registration request"""
    email: EmailStr
    password: str = Field(..., min_length=6)
    role: str = Field(..., pattern="^(student|hr)$")
    name: Optional[str] = None


class UserLogin(BaseModel):
    """User login request"""
    email: EmailStr
    password: str


class Token(BaseModel):
    """Token response"""
    access_token: str
    token_type: str = "bearer"
    expires_in: int


class TokenData(BaseModel):
    """Token data"""
    user_id: Optional[int] = None
    email: Optional[str] = None
    role: Optional[str] = None
