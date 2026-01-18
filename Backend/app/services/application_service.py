"""
Application service for job application management
"""

from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from typing import List, Optional

from app.models.postgres_models import Application, Job, User
from app.schemas.application import ApplicationCreate, ApplicationUpdate
from app.services.job_service import get_job_by_id


def create_application(db: Session, application_data: ApplicationCreate, student_id: int) -> Application:
    """Create a new job application"""
    # Verify job exists
    job = get_job_by_id(db, application_data.job_id)
    
    # Check if application already exists
    existing = db.query(Application).filter(
        Application.student_id == student_id,
        Application.job_id == application_data.job_id
    ).first()
    
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Application already exists for this job"
        )
    
    # Create application
    application = Application(
        student_id=student_id,
        job_id=application_data.job_id,
        resume_text=application_data.resume_text,
        status="pending"
    )
    
    db.add(application)
    db.commit()
    db.refresh(application)
    
    return application


def get_application_by_id(db: Session, application_id: int) -> Application:
    """Get application by ID"""
    application = db.query(Application).filter(Application.id == application_id).first()
    if not application:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Application not found"
        )
    return application


def get_applications(
    db: Session,
    user: User,
    skip: int = 0,
    limit: int = 100,
    status_filter: Optional[str] = None
) -> List[Application]:
    """Get list of applications (filtered by user role)"""
    query = db.query(Application)
    
    if user.role == "student":
        query = query.filter(Application.student_id == user.id)
    elif user.role == "hr":
        # HR can see applications for jobs in their company
        query = query.join(Job).filter(Job.company_id == user.company_id)
    
    if status_filter:
        query = query.filter(Application.status == status_filter)
    
    return query.offset(skip).limit(limit).all()


def update_application_status(
    db: Session,
    application_id: int,
    status: str,
    feedback: Optional[dict] = None
) -> Application:
    """Update application status (HR only)"""
    application = get_application_by_id(db, application_id)
    
    application.status = status
    if feedback:
        application.feedback = feedback
    
    db.commit()
    db.refresh(application)
    
    return application
