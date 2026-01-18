"""
Job schemas
"""

from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime


class JobBase(BaseModel):
    """Base job schema"""
    title: str
    description: Optional[str] = None
    requirements: Optional[str] = None
    skills: Optional[List[str]] = None
    location: Optional[str] = None
    salary: Optional[str] = None
    job_type: Optional[str] = None


class JobCreate(JobBase):
    """Job creation schema"""
    company_id: int
    required_skills: Optional[List[str]] = None
    preferred_skills: Optional[List[str]] = None
    education_level: Optional[str] = None
    years_of_experience: Optional[int] = None
    keywords: Optional[List[str]] = None
    minimum_ats_score: float = Field(default=50.0, ge=0, le=100)


class JobUpdate(BaseModel):
    """Job update schema"""
    title: Optional[str] = None
    description: Optional[str] = None
    requirements: Optional[str] = None
    skills: Optional[List[str]] = None
    location: Optional[str] = None
    salary: Optional[str] = None
    job_type: Optional[str] = None
    required_skills: Optional[List[str]] = None
    preferred_skills: Optional[List[str]] = None
    education_level: Optional[str] = None
    years_of_experience: Optional[int] = None
    keywords: Optional[List[str]] = None
    minimum_ats_score: Optional[float] = Field(None, ge=0, le=100)
    status: Optional[str] = None


class JobResponse(JobBase):
    """Job response schema"""
    id: int
    company_id: int
    required_skills: Optional[List[str]] = None
    preferred_skills: Optional[List[str]] = None
    education_level: Optional[str] = None
    years_of_experience: Optional[int] = None
    keywords: Optional[List[str]] = None
    minimum_ats_score: float
    status: str
    created_at: datetime
    updated_at: Optional[datetime] = None
    expires_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True


class JobSearchRequest(BaseModel):
    """Job search request"""
    query: str
    location: Optional[str] = None
    job_type: Optional[str] = None
    limit: int = Field(default=10, ge=1, le=100)


class JobRecommendationResponse(BaseModel):
    """Job recommendation response"""
    job_id: int
    title: str
    company_name: str
    match_score: float
    reason: str
