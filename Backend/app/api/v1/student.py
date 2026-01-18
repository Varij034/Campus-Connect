"""
Student engine API endpoints
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.database.postgres import get_db
from app.schemas.student import (
    JobSearchRequest, JobSearchResult, SkillGapRequest, SkillGapResponse,
    ResumeFeedbackRequest, ResumeFeedbackResponse, RejectionInterpretRequest,
    RejectionInterpretResponse, JobRecommendationRequest, CareerPathRequest, CareerPathResponse
)
from app.core.dependencies import require_student
from app.models.postgres_models import User, Job
from app.services.graph_service import get_job_recommendations, get_career_path

# Import existing student engine (lazy import to avoid startup errors)
import sys
import os
from typing import Optional

# Add parent directory to path for imports
backend_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(__file__))))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

router = APIRouter(prefix="/student", tags=["Student Engine"])

# Lazy initialization - only load when needed
_student_engine: Optional[object] = None

def get_student_engine():
    """Lazy load student engine to avoid startup errors"""
    global _student_engine
    if _student_engine is None:
        try:
            from student_engine import CampusConnectStudentEngine
            _student_engine = CampusConnectStudentEngine()
        except ImportError as e:
            raise HTTPException(
                status_code=503,
                detail=f"Student engine not available: {str(e)}. Ensure all dependencies are installed."
            )
        except Exception as e:
            raise HTTPException(
                status_code=503,
                detail=f"Failed to initialize student engine: {str(e)}"
            )
    return _student_engine


@router.post("/jobs/search", response_model=List[JobSearchResult])
async def search_jobs_natural_language(
    search_request: JobSearchRequest,
    current_user: User = Depends(require_student),
    db: Session = Depends(get_db)
):
    """Natural language job search"""
    # Get all active jobs
    jobs = db.query(Job).filter(Job.status == "active").all()
    
    # Convert to dict format expected by student engine
    jobs_data = []
    for job in jobs:
        jobs_data.append({
            "id": job.id,
            "title": job.title,
            "description": job.description or "",
            "requirements": job.requirements or "",
            "company": job.company.name if job.company else "Unknown",
            "location": job.location or "Not specified",
            "salary": job.salary or "Not specified"
        })
    
    # Use student engine to search
    student_engine = get_student_engine()
    engine_results = student_engine.search_jobs(
        search_request.query,
        jobs_data,
        search_request.student_skills,
        search_request.top_k
    )
    
    # Map to JobSearchResult schema
    results = []
    for result in engine_results:
        results.append(JobSearchResult(
            job_id=result.get("job_id", 0),
            title=result.get("title", ""),
            company=result.get("company", "Unknown"),
            location=result.get("location", "Not specified"),
            salary=result.get("salary", "Not specified"),
            match_score=result.get("match_score", 0.0),
            application_status=result.get("application_status", "Recommended"),
            missing_skills=result.get("missing_skills", []),
            matched_skills=result.get("matched_skills", []),
            message=result.get("message", ""),
            required_skills=result.get("required_skills", [])
        ))
    
    return results


@router.post("/skill-gap", response_model=SkillGapResponse)
async def analyze_skill_gap(
    skill_gap_request: SkillGapRequest,
    current_user: User = Depends(require_student)
):
    """Analyze skill gap between student and job requirements"""
    student_engine = get_student_engine()
    result = student_engine.analyze_skill_gap(
        skill_gap_request.student_skills,
        skill_gap_request.job_skills,
        skill_gap_request.job_role
    )
    return result


@router.post("/resume-feedback", response_model=ResumeFeedbackResponse)
async def get_resume_feedback(
    feedback_request: ResumeFeedbackRequest,
    current_user: User = Depends(require_student)
):
    """Get resume feedback and ATS optimization suggestions"""
    student_engine = get_student_engine()
    result = student_engine.get_resume_feedback(
        feedback_request.resume_text,
        feedback_request.job_description,
        feedback_request.job_requirements,
        feedback_request.skill_gap_output
    )
    return result


@router.post("/rejection-interpret", response_model=RejectionInterpretResponse)
async def interpret_rejection(
    interpret_request: RejectionInterpretRequest,
    current_user: User = Depends(require_student)
):
    """Interpret company rejection feedback into student-friendly explanation"""
    student_engine = get_student_engine()
    result = student_engine.interpret_rejection(
        interpret_request.rejection_feedback,
        interpret_request.job_title,
        interpret_request.student_skills
    )
    return result


@router.get("/recommendations", response_model=List[dict])
async def get_recommendations(
    request: JobRecommendationRequest,
    current_user: User = Depends(require_student),
    db: Session = Depends(get_db)
):
    """Get personalized job recommendations using Neo4j"""
    recommendations = get_job_recommendations(db, current_user.id, request.limit)
    return recommendations


@router.get("/career-path", response_model=CareerPathResponse)
async def get_career_path_suggestions(
    request: CareerPathRequest,
    current_user: User = Depends(require_student),
    db: Session = Depends(get_db)
):
    """Get career path suggestions using Neo4j"""
    career_path = get_career_path(db, current_user.id, request.target_role)
    return career_path
