"""
Application API endpoints
"""

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from app.database.postgres import get_db
from app.schemas.application import ApplicationCreate, ApplicationUpdate, ApplicationResponse
from app.core.dependencies import get_current_user, require_student, require_hr
from app.models.postgres_models import User
from app.services.application_service import (
    create_application, get_application_by_id, get_applications, update_application_status
)

router = APIRouter(prefix="/applications", tags=["Applications"])


@router.get("", response_model=List[ApplicationResponse])
async def list_applications(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    status_filter: Optional[str] = Query(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """List applications (filtered by user role)"""
    applications = get_applications(db, current_user, skip, limit, status_filter)
    return applications


@router.post("", response_model=ApplicationResponse, status_code=status.HTTP_201_CREATED)
async def submit_application(
    application_data: ApplicationCreate,
    current_user: User = Depends(require_student),
    db: Session = Depends(get_db)
):
    """Submit a new job application"""
    application = create_application(db, application_data, current_user.id)
    return application


@router.get("/{application_id}", response_model=ApplicationResponse)
async def get_application(
    application_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get application details"""
    application = get_application_by_id(db, application_id)
    
    # Verify access
    if current_user.role == "student" and application.student_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view this application"
        )
    
    return application


@router.put("/{application_id}/status", response_model=ApplicationResponse)
async def update_application(
    application_id: int,
    application_update: ApplicationUpdate,
    current_user: User = Depends(require_hr),
    db: Session = Depends(get_db)
):
    """Update application status (HR only)"""
    application = update_application_status(
        db,
        application_id,
        application_update.status or "pending",
        application_update.feedback
    )
    return application
