"""
ATS (Applicant Tracking System) schemas
"""

from pydantic import BaseModel, Field
from typing import List, Optional


class JobRequirement(BaseModel):
    """Model for job requirements posted by recruiters"""
    job_title: str = Field(..., description="Title of the job position")
    required_skills: List[str] = Field(..., description="List of required skills")
    preferred_skills: List[str] = Field(default_factory=list, description="List of preferred skills")
    education_level: Optional[str] = Field(None, description="Required education level (e.g., Bachelor's, Master's)")
    years_of_experience: Optional[int] = Field(None, description="Required years of experience")
    job_description: Optional[str] = Field(None, description="Detailed job description")
    keywords: List[str] = Field(default_factory=list, description="Important keywords for the role")
    minimum_ats_score: float = Field(50.0, ge=0, le=100, description="Minimum ATS score required to pass")


class ResumeData(BaseModel):
    """Parsed resume data"""
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    skills: List[str] = []
    education: List[dict] = []
    experience: List[dict] = []
    certifications: List[str] = []
    projects: List[dict] = []
    raw_text: str = ""


class ATSResult(BaseModel):
    """ATS scoring result"""
    candidate_id: str
    ats_score: float = Field(..., ge=0, le=100)
    passed: bool
    skill_match_score: float
    education_score: float
    experience_score: float
    keyword_match_score: float
    format_score: float
    matched_skills: List[str] = []
    missing_skills: List[str] = []
    recommendations: List[str] = []


class RejectionFeedback(BaseModel):
    """Rejection feedback"""
    candidate_id: str
    ats_score: float
    minimum_required_score: float
    rejection_reasons: List[str]
    missing_critical_skills: List[str] = []
    resume_strengths: List[str] = []
    resume_weaknesses: List[str] = []
    improvement_recommendations: List[str]
    format_issues: List[str] = []
    mistake_highlights: List[str] = []


class CandidateEvaluationRequest(BaseModel):
    """Candidate evaluation request"""
    job_requirement: JobRequirement
    resume_file_path: Optional[str] = None
    resume_text: Optional[str] = None


class CandidateEvaluationResponse(BaseModel):
    """Candidate evaluation response"""
    candidate_id: str
    ats_result: ATSResult
    feedback: Optional[RejectionFeedback] = None
    message: str
