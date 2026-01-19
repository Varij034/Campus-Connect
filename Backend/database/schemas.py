"""Pydantic schemas for API requests and responses"""

from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional, Dict, Any, Union
from datetime import datetime
from enum import Enum


# User Schemas
class UserRole(str, Enum):
    STUDENT = "student"
    RECRUITER = "recruiter"
    ADMIN = "admin"


class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6)
    role: UserRole = UserRole.STUDENT


class UserResponse(BaseModel):
    id: int
    email: str
    role: UserRole
    created_at: datetime

    class Config:
        from_attributes = True


# Auth Schemas
class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    email: Optional[str] = None


# Job Schemas
class JobCreate(BaseModel):
    title: str
    company: str
    description: Optional[str] = None
    location: Optional[str] = None
    salary: Optional[str] = None
    requirements_json: Dict[str, Any]  # JobRequirement as dict


class JobUpdate(BaseModel):
    title: Optional[str] = None
    company: Optional[str] = None
    description: Optional[str] = None
    location: Optional[str] = None
    salary: Optional[str] = None
    requirements_json: Optional[Dict[str, Any]] = None


class JobResponse(BaseModel):
    id: int
    title: str
    company: str
    description: Optional[str]
    location: Optional[str]
    salary: Optional[str]
    requirements_json: Dict[str, Any]
    created_by: int
    created_at: datetime
    updated_at: Optional[datetime]
    application_count: Optional[int] = 0  # Number of applications for this job

    class Config:
        from_attributes = True


# Candidate Schemas
class CandidateCreate(BaseModel):
    name: str
    email: EmailStr
    phone: Optional[str] = None
    skills: List[str] = []


class CandidateUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    skills: Optional[List[str]] = None


class CandidateResponse(BaseModel):
    id: int
    user_id: int
    name: str
    email: str
    phone: Optional[str]
    skills_json: Optional[List[str]]
    resume_id: Optional[str]
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True


# Application Schemas
class ApplicationStatus(str, Enum):
    PENDING = "pending"
    REVIEWING = "reviewing"
    SHORTLISTED = "shortlisted"
    REJECTED = "rejected"
    ACCEPTED = "accepted"


class ApplicationCreate(BaseModel):
    job_id: int


class ApplicationUpdate(BaseModel):
    status: Optional[ApplicationStatus] = None


class ApplicationResponse(BaseModel):
    id: int
    job_id: int
    candidate_id: int
    status: ApplicationStatus
    applied_at: datetime
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True


# Evaluation Schemas
class EvaluationResponse(BaseModel):
    id: int
    application_id: int
    ats_score: float
    passed: bool
    skill_match_score: Optional[float]
    education_score: Optional[float]
    experience_score: Optional[float]
    keyword_match_score: Optional[float]
    format_score: Optional[float]
    matched_skills_json: Optional[List[str]]
    missing_skills_json: Optional[List[str]]
    feedback_id: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


# Resume Schemas
class ResumeParseRequest(BaseModel):
    resume_text: Optional[str] = None


class ResumeParseResponse(BaseModel):
    resume_id: str
    parsed_data: Dict[str, Any]
    message: str


# ATS Schemas
class ATSScoreRequest(BaseModel):
    resume_id: Optional[str] = None
    resume_text: Optional[str] = None
    job_requirement: Dict[str, Any]  # JobRequirement as dict
    
    class Config:
        # Allow resume_id or resume_text, but at least one must be provided
        pass


class ATSScoreResponse(BaseModel):
    evaluation_id: int
    ats_score: float
    passed: bool
    skill_match_score: float
    education_score: float
    experience_score: float
    keyword_match_score: float
    format_score: float
    matched_skills: List[str]
    missing_skills: List[str]


# Feedback Schemas
class FeedbackResponse(BaseModel):
    feedback_id: str
    evaluation_id: int
    rejection_reasons: List[str]
    missing_critical_skills: List[str]
    resume_strengths: List[str]
    resume_weaknesses: List[str]
    improvement_recommendations: List[str]
    format_issues: List[str]
    mistake_highlights: List[str]


# Student Engine Schemas
class JobSearchRequest(BaseModel):
    query: str
    student_skills: List[str]
    top_k: int = Field(default=10, ge=1, le=50)


class JobSearchResponse(BaseModel):
    job_id: int
    title: str
    company: str
    location: Optional[str]
    salary: Optional[str]
    match_score: float
    application_status: str
    missing_skills: List[str]
    matched_skills: List[str]
    message: str
    required_skills: List[str]


class SkillGapRequest(BaseModel):
    student_skills: List[str]
    job_skills: List[str]
    job_role: Optional[str] = None


class SkillGapResponse(BaseModel):
    missing_skills: List[str]
    matched_skills: List[str]
    match_percentage: float
    total_required_skills: int
    student_skill_count: int
    recommendations: List[Dict[str, Any]]
    learning_path: Optional[List[str]]
    explanation: str


class ResumeFeedbackRequest(BaseModel):
    resume_text: str
    job_description: str
    job_requirements: str
    skill_gap_output: Dict[str, Any]


class RejectionInterpretRequest(BaseModel):
    rejection_feedback: str
    job_title: str
    student_skills: List[str]


class RejectionInterpretResponse(BaseModel):
    rejection_category: str
    student_friendly_explanation: str
    improvement_suggestions: List[str]
    motivational_message: str
    next_steps: List[str]
    raw_feedback: str


# Chat Schemas
class ChatMessageRequest(BaseModel):
    message: str
    conversation_id: Optional[str] = None


class ChatMessageResponse(BaseModel):
    response: str
    data: Optional[Union[Dict[str, Any], List[Any]]] = None
    conversation_id: Optional[str] = None
