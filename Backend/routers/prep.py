"""Prep modules (company/JD-specific prep content)"""

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel

from database.postgres import get_db
from database.models import PrepModule, Job
from auth.dependencies import get_current_active_user
from database.models import User

router = APIRouter(prefix="/api/v1/prep", tags=["Prep"])


class PrepModuleResponse(BaseModel):
    id: int
    title: str
    company: Optional[str]
    job_id: Optional[int]
    job_title_pattern: Optional[str]
    content: str
    type: Optional[str]
    created_at: Optional[str]

    class Config:
        from_attributes = True


@router.get("/modules", response_model=List[PrepModuleResponse])
async def list_modules(
    company: Optional[str] = Query(None),
    job_id: Optional[int] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """List prep modules with optional filters."""
    query = db.query(PrepModule)
    if company:
        query = query.filter(PrepModule.company.ilike(f"%{company}%"))
    if job_id is not None:
        query = query.filter(PrepModule.job_id == job_id)
    modules = query.order_by(PrepModule.created_at.desc()).all()
    return [
        PrepModuleResponse(
            id=m.id,
            title=m.title,
            company=m.company,
            job_id=m.job_id,
            job_title_pattern=m.job_title_pattern,
            content=m.content,
            type=m.type,
            created_at=m.created_at.isoformat() if m.created_at else None,
        )
        for m in modules
    ]


@router.get("/modules/{module_id}", response_model=PrepModuleResponse)
async def get_module(
    module_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Get a single prep module by ID."""
    m = db.query(PrepModule).filter(PrepModule.id == module_id).first()
    if not m:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Prep module not found")
    return PrepModuleResponse(
        id=m.id,
        title=m.title,
        company=m.company,
        job_id=m.job_id,
        job_title_pattern=m.job_title_pattern,
        content=m.content,
        type=m.type,
        created_at=m.created_at.isoformat() if m.created_at else None,
    )


@router.get("/for-job/{job_id}", response_model=List[PrepModuleResponse])
async def get_prep_for_job(
    job_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Get prep modules matching a job (by job_id or job's company)."""
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Job not found")
    from sqlalchemy import or_
    company = (job.company or "").strip()
    query = db.query(PrepModule).filter(PrepModule.job_id == job_id)
    if company:
        query = db.query(PrepModule).filter(
            or_(PrepModule.job_id == job_id, PrepModule.company.ilike(f"%{company}%"))
        )
    modules = query.order_by(PrepModule.created_at.desc()).all()
    return [
        PrepModuleResponse(
            id=m.id,
            title=m.title,
            company=m.company,
            job_id=m.job_id,
            job_title_pattern=m.job_title_pattern,
            content=m.content,
            type=m.type,
            created_at=m.created_at.isoformat() if m.created_at else None,
        )
        for m in modules
    ]
