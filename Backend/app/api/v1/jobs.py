"""
Job management API endpoints
"""

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from app.database.postgres import get_db
from app.schemas.job import JobCreate, JobUpdate, JobResponse, JobSearchRequest
from app.core.dependencies import get_current_user, require_hr
from app.models.postgres_models import User, Job
from app.services.job_service import (
    create_job, get_job_by_id, get_jobs, update_job, delete_job, search_jobs_semantic
)

router = APIRouter(prefix="/jobs", tags=["Jobs"])


@router.get("", response_model=List[JobResponse])
async def list_jobs(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    status_filter: Optional[str] = Query(None),
    location: Optional[str] = Query(None),
    company_id: Optional[int] = Query(None),
    db: Session = Depends(get_db)
):
    """List jobs with optional filters"""
    jobs = get_jobs(db, skip, limit, status_filter, location, company_id)
    return jobs


@router.post("", response_model=JobResponse, status_code=status.HTTP_201_CREATED)
async def create_job_posting(
    job_data: JobCreate,
    current_user: User = Depends(require_hr),
    db: Session = Depends(get_db)
):
    """Create a new job posting (HR only)"""
    # Use company_id from job_data or current_user's company
    company_id = job_data.company_id or current_user.company_id
    if not company_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Company ID is required"
        )
    
    job = create_job(db, job_data, company_id)
    return job


@router.get("/{job_id}", response_model=JobResponse)
async def get_job(
    job_id: int,
    db: Session = Depends(get_db)
):
    """Get job details by ID"""
    job = get_job_by_id(db, job_id)
    return job


@router.put("/{job_id}", response_model=JobResponse)
async def update_job_posting(
    job_id: int,
    job_update: JobUpdate,
    current_user: User = Depends(require_hr),
    db: Session = Depends(get_db)
):
    """Update job posting (HR only)"""
    job = get_job_by_id(db, job_id)
    
    # Verify ownership
    if job.company_id != current_user.company_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this job"
        )
    
    updated_job = update_job(db, job_id, job_update)
    return updated_job


@router.delete("/{job_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_job_posting(
    job_id: int,
    current_user: User = Depends(require_hr),
    db: Session = Depends(get_db)
):
    """Delete job posting (HR only)"""
    job = get_job_by_id(db, job_id)
    
    # Verify ownership
    if job.company_id != current_user.company_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete this job"
        )
    
    delete_job(db, job_id)
    return None


@router.post("/search", response_model=List[dict])
async def search_jobs(
    search_request: JobSearchRequest,
    db: Session = Depends(get_db)
):
    """Semantic job search using Weaviate"""
    results = search_jobs_semantic(search_request.query, search_request.limit)
    
    # Enrich with database data
    enriched_results = []
    for result in results:
        job_id = result.get("job_id")
        if job_id:
            try:
                job = get_job_by_id(db, job_id)
                enriched_results.append({
                    **result,
                    "id": job.id,
                    "company_id": job.company_id,
                    "salary": job.salary,
                    "job_type": job.job_type,
                    "status": job.status
                })
            except:
                continue
    
    return enriched_results
