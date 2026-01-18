"""
Authentication API endpoints
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database.postgres import get_db
from app.schemas.auth import UserRegister, UserLogin, Token
from app.schemas.user import UserResponse
from app.services.auth_service import register_user, authenticate_user, create_token_for_user
from app.core.dependencies import get_current_user
from app.models.postgres_models import User

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(
    user_data: UserRegister,
    db: Session = Depends(get_db)
):
    """Register a new user"""
    user = register_user(db, user_data)
    return user


@router.post("/login", response_model=Token)
async def login(
    credentials: UserLogin,
    db: Session = Depends(get_db)
):
    """Login and get access token"""
    user = authenticate_user(db, credentials.email, credentials.password)
    token = create_token_for_user(user)
    return token


@router.get("/me", response_model=UserResponse)
async def get_current_user_info(
    current_user: User = Depends(get_current_user)
):
    """Get current authenticated user information"""
    return current_user


@router.post("/refresh", response_model=Token)
async def refresh_token(
    current_user: User = Depends(get_current_user)
):
    """Refresh access token"""
    token = create_token_for_user(current_user)
    return token
