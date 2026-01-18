"""
Job service for job management operations
"""

from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from typing import List, Optional
from sqlalchemy import or_, and_

from app.models.postgres_models import Job, Company
from app.schemas.job import JobCreate, JobUpdate
from app.database.weaviate_client import get_weaviate


def create_job(db: Session, job_data: JobCreate, company_id: int) -> Job:
    """Create a new job posting"""
    # Verify company exists
    company = db.query(Company).filter(Company.id == company_id).first()
    if not company:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Company not found"
        )
    
    # Create job
    job = Job(
        company_id=company_id,
        **job_data.dict(exclude={"company_id"})
    )
    
    db.add(job)
    db.commit()
    db.refresh(job)
    
    # Add to Weaviate for semantic search
    try:
        add_job_to_weaviate(job)
    except Exception as e:
        print(f"Warning: Failed to add job to Weaviate: {e}")
    
    return job


def get_job_by_id(db: Session, job_id: int) -> Job:
    """Get job by ID"""
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job not found"
        )
    return job


def get_jobs(
    db: Session,
    skip: int = 0,
    limit: int = 100,
    status_filter: Optional[str] = None,
    location: Optional[str] = None,
    company_id: Optional[int] = None
) -> List[Job]:
    """Get list of jobs with filters"""
    query = db.query(Job)
    
    if status_filter:
        query = query.filter(Job.status == status_filter)
    if location:
        query = query.filter(Job.location.ilike(f"%{location}%"))
    if company_id:
        query = query.filter(Job.company_id == company_id)
    
    return query.offset(skip).limit(limit).all()


def update_job(db: Session, job_id: int, job_update: JobUpdate) -> Job:
    """Update job posting"""
    job = get_job_by_id(db, job_id)
    
    update_data = job_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(job, field, value)
    
    db.commit()
    db.refresh(job)
    
    # Update in Weaviate
    try:
        update_job_in_weaviate(job)
    except Exception as e:
        print(f"Warning: Failed to update job in Weaviate: {e}")
    
    return job


def delete_job(db: Session, job_id: int):
    """Delete job posting"""
    job = get_job_by_id(db, job_id)
    
    # Remove from Weaviate
    try:
        remove_job_from_weaviate(job_id)
    except Exception as e:
        print(f"Warning: Failed to remove job from Weaviate: {e}")
    
    db.delete(job)
    db.commit()


def search_jobs_semantic(query: str, limit: int = 10) -> List[dict]:
    """Search jobs using Weaviate semantic search"""
    try:
        weaviate_client = get_weaviate()
        
        # Check if Job class exists, if not return empty
        if not weaviate_client.schema.exists("Job"):
            return []
        
        # Perform semantic search
        result = (
            weaviate_client.query
            .get("Job", ["job_id", "title", "description", "company", "location", "skills"])
            .with_near_text({"concepts": [query]})
            .with_limit(limit)
            .do()
        )
        
        jobs = []
        if result.get("data") and result["data"].get("Get"):
            for item in result["data"]["Get"].get("Job", []):
                jobs.append({
                    "job_id": item.get("job_id"),
                    "title": item.get("title"),
                    "description": item.get("description"),
                    "company": item.get("company"),
                    "location": item.get("location"),
                    "skills": item.get("skills", [])
                })
        
        return jobs
    except Exception as e:
        print(f"Error in semantic search: {e}")
        return []


def add_job_to_weaviate(job: Job):
    """Add job to Weaviate for semantic search"""
    try:
        weaviate_client = get_weaviate()
        
        # Create Job class schema if it doesn't exist
        if not weaviate_client.schema.exists("Job"):
            weaviate_client.schema.create_class({
                "class": "Job",
                "description": "Job postings for semantic search",
                "properties": [
                    {"name": "job_id", "dataType": ["int"]},
                    {"name": "title", "dataType": ["string"]},
                    {"name": "description", "dataType": ["text"]},
                    {"name": "requirements", "dataType": ["text"]},
                    {"name": "company", "dataType": ["string"]},
                    {"name": "location", "dataType": ["string"]},
                    {"name": "skills", "dataType": ["string[]"]}
                ]
            })
        
        # Create job object
        weaviate_client.data_object.create(
            data_object={
                "job_id": job.id,
                "title": job.title,
                "description": job.description or "",
                "requirements": job.requirements or "",
                "company": job.company.name if job.company else "",
                "location": job.location or "",
                "skills": job.skills or []
            },
            class_name="Job"
        )
    except Exception as e:
        print(f"Error adding job to Weaviate: {e}")
        # Don't raise - allow job creation to continue even if Weaviate fails


def update_job_in_weaviate(job: Job):
    """Update job in Weaviate"""
    try:
        weaviate_client = get_weaviate()
        
        if not weaviate_client.schema.exists("Job"):
            add_job_to_weaviate(job)
            return
        
        # Find existing object
        result = (
            weaviate_client.query
            .get("Job", ["job_id"])
            .with_where({
                "path": ["job_id"],
                "operator": "Equal",
                "valueInt": job.id
            })
            .do()
        )
        
        if result.get("data") and result["data"].get("Get"):
            objects = result["data"]["Get"].get("Job", [])
            if objects:
                # Delete old and create new (Weaviate doesn't have direct update)
                uuid_to_delete = objects[0].get("_additional", {}).get("id")
                if uuid_to_delete:
                    weaviate_client.data_object.delete(uuid_to_delete, class_name="Job")
                add_job_to_weaviate(job)
            else:
                # Create new if not found
                add_job_to_weaviate(job)
    except Exception as e:
        print(f"Error updating job in Weaviate: {e}")


def remove_job_from_weaviate(job_id: int):
    """Remove job from Weaviate"""
    try:
        weaviate_client = get_weaviate()
        
        if not weaviate_client.schema.exists("Job"):
            return
        
        result = (
            weaviate_client.query
            .get("Job", ["job_id"])
            .with_where({
                "path": ["job_id"],
                "operator": "Equal",
                "valueInt": job_id
            })
            .do()
        )
        
        if result.get("data") and result["data"].get("Get"):
            objects = result["data"]["Get"].get("Job", [])
            for obj in objects:
                uuid = obj.get("_additional", {}).get("id")
                if uuid:
                    weaviate_client.data_object.delete(uuid, class_name="Job")
    except Exception as e:
        print(f"Error removing job from Weaviate: {e}")
