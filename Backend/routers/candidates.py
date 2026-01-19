"""Candidate management router"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from database.postgres import get_db
from database.mongodb import get_mongo_db
from database.models import User, Candidate, Application, Evaluation, Job
from database.schemas import (
    CandidateResponse, CandidateCreate, CandidateUpdate,
    ApplicationResponse, EvaluationResponse
)
from models import JobRequirement, ResumeData, CandidateEvaluationRequest, CandidateEvaluationResponse, ATSResult, RejectionFeedback
from resume_parser import ResumeParser
from ats_engine import ATSEngine
from feedback_generator import FeedbackGenerator
from auth.dependencies import get_current_active_user

router = APIRouter(prefix="/api/v1/candidates", tags=["Candidates"])

# Initialize engines
resume_parser = ResumeParser()
ats_engine = ATSEngine()
feedback_generator = FeedbackGenerator()


@router.post("/evaluate", response_model=CandidateEvaluationResponse)
async def evaluate_candidate(
    request: CandidateEvaluationRequest,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Evaluate a candidate against job requirements"""
    # Only recruiters and admins can evaluate
    if current_user.role.value not in ["recruiter", "admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only recruiters and admins can evaluate candidates"
        )
    
    import uuid as uuid_module
    
    try:
        # Parse resume
        if request.resume_file_path:
            parsed_resume = resume_parser.parse(file_path=request.resume_file_path)
        elif request.resume_text:
            parsed_resume = resume_parser.parse(resume_text=request.resume_text)
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Either resume_file_path or resume_text must be provided"
            )
        
        resume_data = ResumeData(**parsed_resume)
        
        # Score resume using ATS
        ats_result_dict = ats_engine.score_resume(resume_data, request.job_requirement)
        
        # Generate candidate ID
        candidate_id = str(uuid_module.uuid4())
        
        # Create ATSResult
        ats_result = ATSResult(
            candidate_id=candidate_id,
            ats_score=ats_result_dict['ats_score'],
            passed=ats_result_dict['passed'],
            skill_match_score=ats_result_dict['skill_match_score'],
            education_score=ats_result_dict['education_score'],
            experience_score=ats_result_dict['experience_score'],
            keyword_match_score=ats_result_dict['keyword_match_score'],
            format_score=ats_result_dict['format_score'],
            matched_skills=ats_result_dict['matched_skills'],
            missing_skills=ats_result_dict['missing_skills'],
            recommendations=[]
        )
        
        # Generate feedback if rejected
        feedback = None
        message = ""
        
        if not ats_result.passed:
            feedback_dict = feedback_generator.generate_feedback(
                ats_result_dict, parsed_resume, request.job_requirement
            )
            
            if feedback_dict:
                feedback = RejectionFeedback(
                    candidate_id=candidate_id,
                    ats_score=ats_result.ats_score,
                    minimum_required_score=request.job_requirement.minimum_ats_score,
                    rejection_reasons=feedback_dict['rejection_reasons'],
                    missing_critical_skills=feedback_dict['missing_critical_skills'],
                    resume_strengths=feedback_dict['resume_strengths'],
                    resume_weaknesses=feedback_dict['resume_weaknesses'],
                    improvement_recommendations=feedback_dict['improvement_recommendations'],
                    format_issues=feedback_dict['format_issues'],
                    mistake_highlights=feedback_dict['mistake_highlights']
                )
                
                message = (
                    f"Candidate rejected. ATS Score: {ats_result.ats_score:.2f}% "
                    f"(Minimum Required: {request.job_requirement.minimum_ats_score}%). "
                    f"Feedback provided."
                )
        else:
            message = (
                f"Candidate PASSED! ATS Score: {ats_result.ats_score:.2f}% "
                f"(Minimum Required: {request.job_requirement.minimum_ats_score}%)."
            )
        
        return CandidateEvaluationResponse(
            candidate_id=candidate_id,
            ats_result=ats_result,
            feedback=feedback,
            message=message
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error evaluating candidate: {str(e)}"
        )


@router.get("", response_model=List[CandidateResponse])
async def list_candidates(
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """List all candidates and automatically create evaluations for applications"""
    # Only recruiters and admins can list candidates
    if current_user.role.value not in ["recruiter", "admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only recruiters and admins can list candidates"
        )
    
    candidates = db.query(Candidate).offset(skip).limit(limit).all()
    
    # Automatically create evaluations for all applications that don't have evaluations
    # Import here to avoid circular imports
    from routers.ats import create_evaluation_for_application
    
    for candidate in candidates:
        if candidate.resume_id:  # Only process candidates with resumes
            # Get all applications for this candidate
            applications = db.query(Application).filter(
                Application.candidate_id == candidate.id
            ).all()
            
            for application in applications:
                # Check if evaluation already exists
                existing_eval = db.query(Evaluation).filter(
                    Evaluation.application_id == application.id
                ).first()
                
                if not existing_eval:
                    # Automatically create evaluation
                    try:
                        create_evaluation_for_application(application, db)
                    except Exception:
                        # Silently fail if evaluation creation fails (e.g., missing resume/job requirements)
                        pass
    
    return candidates


@router.get("/{candidate_id}", response_model=CandidateResponse)
async def get_candidate(
    candidate_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get candidate details"""
    candidate = db.query(Candidate).filter(Candidate.id == candidate_id).first()
    
    if not candidate:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Candidate not found"
        )
    
    # Check access
    if candidate.user_id != current_user.id and current_user.role.value not in ["recruiter", "admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to access this candidate"
        )
    
    return candidate


@router.get("/{candidate_id}/evaluations", response_model=List[EvaluationResponse])
async def get_candidate_evaluations(
    candidate_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get all evaluations for a candidate"""
    candidate = db.query(Candidate).filter(Candidate.id == candidate_id).first()
    
    if not candidate:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Candidate not found"
        )
    
    # Check access
    if candidate.user_id != current_user.id and current_user.role.value not in ["recruiter", "admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to access this candidate's evaluations"
        )
    
    # Get all applications for candidate
    applications = db.query(Application).filter(Application.candidate_id == candidate_id).all()
    application_ids = [app.id for app in applications]
    
    # Get all evaluations
    evaluations = db.query(Evaluation).filter(Evaluation.application_id.in_(application_ids)).all()
    
    return evaluations
