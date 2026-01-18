"""
User service for user management operations
"""

from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.models.postgres_models import User
from app.schemas.user import UserUpdate


def get_user_by_id(db: Session, user_id: int) -> User:
    """Get user by ID"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    return user


def update_user(db: Session, user_id: int, user_update: UserUpdate) -> User:
    """Update user profile"""
    user = get_user_by_id(db, user_id)
    
    # Update fields
    update_data = user_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(user, field, value)
    
    db.commit()
    db.refresh(user)
    return user
