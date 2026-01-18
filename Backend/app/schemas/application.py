"""
Application schemas
"""

from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime


class ApplicationBase(BaseModel):
    """Base application schema"""
    job_id: int
    resume_text: Optional[str] = None


class ApplicationCreate(ApplicationBase):
    """Application creation schema"""
    pass


class ApplicationUpdate(BaseModel):
    """Application update schema"""
    status: Optional[str] = None
    feedback: Optional[Dict[str, Any]] = None


class ApplicationResponse(ApplicationBase):
    """Application response schema"""
    id: int
    student_id: int
    resume_path: Optional[str] = None
    ats_score: Optional[float] = None
    skill_match_score: Optional[float] = None
    education_score: Optional[float] = None
    experience_score: Optional[float] = None
    keyword_match_score: Optional[float] = None
    format_score: Optional[float] = None
    matched_skills: Optional[List[str]] = None
    missing_skills: Optional[List[str]] = None
    status: str
    feedback: Optional[Dict[str, Any]] = None
    applied_at: datetime
    reviewed_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True
