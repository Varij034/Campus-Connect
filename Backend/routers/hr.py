"""HR-specific endpoints (stats, etc.)"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func

from database.postgres import get_db
from database.models import User, Job, Application, Evaluation
from auth.dependencies import get_current_active_user

router = APIRouter(prefix="/api/v1/hr", tags=["HR"])


@router.get("/stats")
async def get_hr_stats(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """Return stats for the logged-in recruiter: jobs, applications, shortlisted (passed), avg score."""
    if current_user.role.value not in ["recruiter", "admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only recruiters and admins can access HR stats",
        )
    # Jobs created by this user
    job_ids = [row[0] for row in db.query(Job.id).filter(Job.created_by == current_user.id).all()]
    if not job_ids:
        return {
            "total_jobs": 0,
            "total_applications": 0,
            "shortlisted": 0,
            "avg_ats_score": 0.0,
        }
    total_jobs = len(job_ids)
    applications = db.query(Application).filter(Application.job_id.in_(job_ids)).all()
    application_ids = [a.id for a in applications]
    total_applications = len(application_ids)
    if not application_ids:
        return {
            "total_jobs": total_jobs,
            "total_applications": 0,
            "shortlisted": 0,
            "avg_ats_score": 0.0,
        }
    shortlisted = (
        db.query(Application.id)
        .filter(Application.id.in_(application_ids))
        .join(Evaluation, Evaluation.application_id == Application.id)
        .filter(Evaluation.passed == True)
        .distinct()
        .count()
    )
    # For avg score we need one evaluation per application (e.g. latest or any)
    evals = db.query(func.avg(Evaluation.ats_score)).filter(
        Evaluation.application_id.in_(application_ids)
    ).scalar()
    avg_ats_score = round(float(evals or 0), 2)
    return {
        "total_jobs": total_jobs,
        "total_applications": total_applications,
        "shortlisted": shortlisted,
        "avg_ats_score": avg_ats_score,
    }
