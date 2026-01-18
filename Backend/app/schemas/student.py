"""
Student engine schemas
"""

from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any


class JobSearchRequest(BaseModel):
    """Natural language job search request"""
    query: str = Field(..., description="Natural language search query")
    student_skills: List[str] = Field(default_factory=list)
    top_k: int = Field(default=10, ge=1, le=50)


class JobSearchResult(BaseModel):
    """Job search result"""
    job_id: int
    title: str
    company: str
    location: str
    salary: str
    match_score: float
    application_status: str  # 'Direct Apply Eligible' or 'Recommended'
    missing_skills: List[str] = []
    matched_skills: List[str] = []
    message: str
    required_skills: List[str] = []


class SkillGapRequest(BaseModel):
    """Skill gap analysis request"""
    student_skills: List[str]
    job_skills: List[str]
    job_role: Optional[str] = None


class SkillGapResponse(BaseModel):
    """Skill gap analysis response"""
    missing_skills: List[str]
    matched_skills: List[str]
    match_percentage: float
    total_required_skills: int
    student_skill_count: int
    recommendations: List[Dict[str, Any]]
    learning_path: Optional[List[str]] = None
    explanation: str


class ResumeFeedbackRequest(BaseModel):
    """Resume feedback request"""
    resume_text: str
    job_description: str
    job_requirements: str
    skill_gap_output: Dict[str, Any]


class ResumeFeedbackResponse(BaseModel):
    """Resume feedback response"""
    overall_feedback: str
    ats_score: float
    ats_interpretation: str
    strengths: List[str]
    weaknesses: List[str]
    keyword_suggestions: List[str]
    missing_skills_in_resume: List[str]
    actionable_improvements: List[str]


class RejectionInterpretRequest(BaseModel):
    """Rejection interpretation request"""
    rejection_feedback: str
    job_title: str
    student_skills: List[str]


class RejectionInterpretResponse(BaseModel):
    """Rejection interpretation response"""
    rejection_category: str
    student_friendly_explanation: str
    improvement_suggestions: List[str]
    motivational_message: str
    next_steps: List[str]
    raw_feedback: str


class JobRecommendationRequest(BaseModel):
    """Job recommendation request"""
    student_id: int
    limit: int = Field(default=10, ge=1, le=50)


class CareerPathRequest(BaseModel):
    """Career path analysis request"""
    student_id: int
    target_role: Optional[str] = None


class CareerPathResponse(BaseModel):
    """Career path response"""
    current_skills: List[str]
    target_skills: List[str]
    skill_gaps: List[str]
    recommended_path: List[Dict[str, Any]]
    estimated_time: str
    milestones: List[str]
