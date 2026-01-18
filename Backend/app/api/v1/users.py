"""
User management API endpoints
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database.postgres import get_db
from app.schemas.user import UserResponse, UserUpdate
from app.core.dependencies import get_current_user, require_any
from app.models.postgres_models import User
from app.services.user_service import get_user_by_id, update_user

router = APIRouter(prefix="/users", tags=["Users"])


@router.get("/me", response_model=UserResponse)
async def get_my_profile(
    current_user: User = Depends(get_current_user)
):
    """Get current user's profile"""
    return current_user


@router.put("/me", response_model=UserResponse)
async def update_my_profile(
    user_update: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update current user's profile"""
    updated_user = update_user(db, current_user.id, user_update)
    return updated_user


@router.get("/{user_id}", response_model=UserResponse)
async def get_user(
    user_id: int,
    current_user: User = Depends(require_any),
    db: Session = Depends(get_db)
):
    """Get user by ID (with permissions check)"""
    # Users can only view their own profile unless they're HR
    if current_user.role != "hr" and current_user.id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view this user"
        )
    
    user = get_user_by_id(db, user_id)
    return user
