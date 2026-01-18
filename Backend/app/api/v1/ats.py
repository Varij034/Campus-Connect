"""
ATS (Applicant Tracking System) API endpoints
"""

from fastapi import APIRouter, Depends, HTTPException, status, File, UploadFile, Form
from sqlalchemy.orm import Session
from typing import Optional
import os
import uuid
import json

from app.database.postgres import get_db
from app.schemas.ats import (
    CandidateEvaluationRequest, CandidateEvaluationResponse,
    JobRequirement, ResumeData, ATSResult, RejectionFeedback
)
from app.core.dependencies import require_hr
from app.models.postgres_models import User

# Import existing ATS components (lazy import)
import sys
import os as os_module
from typing import Optional

# Add parent directory to path for imports
backend_dir = os_module.path.dirname(os_module.path.dirname(os_module.path.dirname(os_module.path.dirname(__file__))))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

router = APIRouter(prefix="/ats", tags=["ATS"])

# Lazy initialization - only load when needed
_resume_parser: Optional[object] = None
_ats_engine: Optional[object] = None
_feedback_generator: Optional[object] = None

def get_resume_parser():
    """Lazy load resume parser"""
    global _resume_parser
    if _resume_parser is None:
        try:
            from resume_parser import ResumeParser
            _resume_parser = ResumeParser()
        except ImportError as e:
            raise HTTPException(
                status_code=503,
                detail=f"Resume parser not available: {str(e)}"
            )
    return _resume_parser

def get_ats_engine():
    """Lazy load ATS engine"""
    global _ats_engine
    if _ats_engine is None:
        try:
            from ats_engine import ATSEngine
            _ats_engine = ATSEngine()
        except ImportError as e:
            raise HTTPException(
                status_code=503,
                detail=f"ATS engine not available: {str(e)}"
            )
    return _ats_engine

def get_feedback_generator():
    """Lazy load feedback generator"""
    global _feedback_generator
    if _feedback_generator is None:
        try:
            from feedback_generator import FeedbackGenerator
            _feedback_generator = FeedbackGenerator()
        except ImportError as e:
            raise HTTPException(
                status_code=503,
                detail=f"Feedback generator not available: {str(e)}"
            )
    return _feedback_generator

# Upload directory (from config)
from app.config import settings
UPLOAD_DIR = settings.UPLOAD_DIR
if not os.path.exists(UPLOAD_DIR):
    os.makedirs(UPLOAD_DIR)


@router.post("/evaluate", response_model=CandidateEvaluationResponse)
async def evaluate_candidate(
    job_requirement: str = Form(..., description="JSON string of JobRequirement"),
    resume_file: Optional[UploadFile] = File(None, description="Resume file (PDF or DOCX)"),
    resume_text: Optional[str] = Form(None, description="Resume text content"),
    current_user: User = Depends(require_hr),
    db: Session = Depends(get_db)
):
    """
    Evaluate a candidate against job requirements using ATS
    """
    try:
        # Parse job requirement
        try:
            job_req_dict = json.loads(job_requirement)
            job_req = JobRequirement(**job_req_dict)
        except json.JSONDecodeError as e:
            raise HTTPException(status_code=400, detail=f"Invalid JSON in job_requirement: {str(e)}")
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Invalid job requirement format: {str(e)}")
        
        # Validate that either file or text is provided
        if not resume_file and not resume_text:
            raise HTTPException(
                status_code=400,
                detail="Either resume_file or resume_text must be provided"
            )
        
        # Generate unique candidate ID
        candidate_id = str(uuid.uuid4())
        
        # Parse resume
        resume_file_path = None
        try:
            if resume_file:
                # Save uploaded file
                file_extension = os.path.splitext(resume_file.filename)[1] if resume_file.filename else ".pdf"
                resume_file_path = os.path.join(UPLOAD_DIR, f"{candidate_id}{file_extension}")
                
                with open(resume_file_path, "wb") as f:
                    content = await resume_file.read()
                    f.write(content)
                
                resume_parser = get_resume_parser()
                parsed_resume = resume_parser.parse(file_path=resume_file_path)
            else:
                resume_parser = get_resume_parser()
                parsed_resume = resume_parser.parse(resume_text=resume_text)
            
            # Convert to ResumeData model
            resume_data = ResumeData(**parsed_resume)
            
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Error parsing resume: {str(e)}")
        finally:
            # Clean up uploaded file
            if resume_file_path and os.path.exists(resume_file_path):
                try:
                    os.remove(resume_file_path)
                except:
                    pass
        
        # Score resume using ATS
        try:
            ats_engine = get_ats_engine()
            ats_result_dict = ats_engine.score_resume(resume_data, job_req)
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error scoring resume: {str(e)}")
        
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
            try:
                feedback_generator = get_feedback_generator()
                feedback_dict = feedback_generator.generate_feedback(
                    ats_result_dict, parsed_resume, job_req
                )
                
                if feedback_dict:
                    feedback = RejectionFeedback(
                        candidate_id=candidate_id,
                        ats_score=ats_result.ats_score,
                        minimum_required_score=job_req.minimum_ats_score,
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
                        f"(Minimum Required: {job_req.minimum_ats_score}%). "
                        f"Feedback provided."
                    )
            except Exception as e:
                message = f"Candidate rejected. Error generating feedback: {str(e)}"
        else:
            message = (
                f"Candidate PASSED! ATS Score: {ats_result.ats_score:.2f}% "
                f"(Minimum Required: {job_req.minimum_ats_score}%)."
            )
        
        # Build response
        response = CandidateEvaluationResponse(
            candidate_id=candidate_id,
            ats_result=ats_result,
            feedback=feedback,
            message=message
        )
        
        return response
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.post("/evaluate-json", response_model=CandidateEvaluationResponse)
async def evaluate_candidate_json(
    request: CandidateEvaluationRequest,
    current_user: User = Depends(require_hr),
    db: Session = Depends(get_db)
):
    """
    Alternative endpoint that accepts JSON body instead of form data
    """
    try:
        job_req = request.job_requirement
        
        # Validate that either file or text is provided
        if not request.resume_file_path and not request.resume_text:
            raise HTTPException(
                status_code=400,
                detail="Either resume_file_path or resume_text must be provided"
            )
        
        # Generate unique candidate ID
        candidate_id = str(uuid.uuid4())
        
        # Parse resume
        try:
            resume_parser = get_resume_parser()
            if request.resume_file_path:
                parsed_resume = resume_parser.parse(file_path=request.resume_file_path)
            else:
                parsed_resume = resume_parser.parse(resume_text=request.resume_text)
            
            resume_data = ResumeData(**parsed_resume)
            
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Error parsing resume: {str(e)}")
        
        # Score resume using ATS
        try:
            ats_engine = get_ats_engine()
            ats_result_dict = ats_engine.score_resume(resume_data, job_req)
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error scoring resume: {str(e)}")
        
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
            try:
                feedback_generator = get_feedback_generator()
                feedback_dict = feedback_generator.generate_feedback(
                    ats_result_dict, parsed_resume, job_req
                )
                
                if feedback_dict:
                    feedback = RejectionFeedback(
                        candidate_id=candidate_id,
                        ats_score=ats_result.ats_score,
                        minimum_required_score=job_req.minimum_ats_score,
                        rejection_reasons=feedback_dict['rejection_reasons'],
                        missing_critical_skills=feedback_dict['missing_critical_skills'],
                        resume_strengths=feedback_dict['resume_strengths'],
                        resume_weaknesses=feedback_dict['resume_weaknesses'],
                        improvement_recommendations=feedback_dict['improvement_recommendations'],
                        format_issues=feedback_dict['format_issues'],
                        mistake_highlights=feedback_dict['mistake_highlights']
                    )
                    
                    message = "Candidate rejected. Feedback provided."
            except Exception as e:
                message = f"Candidate rejected. Error generating feedback: {str(e)}"
        else:
            message = f"Candidate PASSED! ATS Score: {ats_result.ats_score:.2f}%"
        
        response = CandidateEvaluationResponse(
            candidate_id=candidate_id,
            ats_result=ats_result,
            feedback=feedback,
            message=message
        )
        
        return response
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
