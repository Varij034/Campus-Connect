"""Aptitude test endpoints"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime, timezone

from database.postgres import get_db
from database.models import User, Candidate, AptitudeTest, AptitudeQuestion, TestAttempt
from auth.dependencies import get_current_active_user

router = APIRouter(prefix="/api/v1/aptitude", tags=["Aptitude"])

PASS_THRESHOLD = 0.7  # 70% to pass


class TestListItem(BaseModel):
    id: int
    title: str
    description: Optional[str]
    duration_minutes: int
    question_count: int

    class Config:
        from_attributes = True


class QuestionOut(BaseModel):
    id: int
    question_text: str
    options: List[str]
    category: Optional[str]
    difficulty: Optional[str]


class AttemptStartResponse(BaseModel):
    attempt_id: int
    test_id: int
    questions: List[QuestionOut]
    duration_minutes: int


class SubmitAnswersBody(BaseModel):
    answers: dict  # question_id (int as key in JSON) -> selected_index (int)


class AttemptResultResponse(BaseModel):
    attempt_id: int
    score: float
    passed: bool
    total_questions: int
    correct_count: int


class QuestionResultDetail(BaseModel):
    question_id: int
    question_text: str
    option_a: str
    option_b: str
    option_c: str
    option_d: str
    correct_option: str
    selected_option: Optional[str]
    is_correct: bool
    difficulty_level: str

    class Config:
        from_attributes = True


class DetailedTestResultsResponse(BaseModel):
    attempt_id: int
    test_id: int
    test_title: Optional[str]
    user_id: int
    score: float
    total_questions: int
    correct_answers: int
    incorrect_answers: int
    skipped_questions: int
    time_taken: int
    submitted_at: str
    questions: List[QuestionResultDetail]


@router.get("/tests", response_model=List[TestListItem])
async def list_tests(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """List active aptitude tests (for students)."""
    tests = db.query(AptitudeTest).filter(AptitudeTest.is_active == True).all()
    result = []
    for t in tests:
        count = db.query(AptitudeQuestion).filter(AptitudeQuestion.test_id == t.id).count()
        result.append(TestListItem(
            id=t.id,
            title=t.title,
            description=t.description,
            duration_minutes=t.duration_minutes or 30,
            question_count=count,
        ))
    return result


@router.get("/tests/{test_id}")
async def get_test(
    test_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Get test metadata (no questions - use start to get questions)."""
    t = db.query(AptitudeTest).filter(AptitudeTest.id == test_id, AptitudeTest.is_active == True).first()
    if not t:
        raise HTTPException(status_code=404, detail="Test not found")
    count = db.query(AptitudeQuestion).filter(AptitudeQuestion.test_id == t.id).count()
    return {
        "id": t.id,
        "title": t.title,
        "description": t.description,
        "duration_minutes": t.duration_minutes or 30,
        "question_count": count,
    }


def _get_candidate(current_user: User, db: Session) -> Candidate:
    """Get candidate for current user; create a minimal one if missing (e.g. TPO/recruiter taking test for demo)."""
    c = db.query(Candidate).filter(Candidate.user_id == current_user.id).first()
    if c:
        return c
    # No candidate profile (e.g. logged in as TPO, recruiter, or student not yet in candidates table)
    name = current_user.email.split("@")[0].replace(".", " ").title()
    c = Candidate(
        user_id=current_user.id,
        name=name or "User",
        email=current_user.email,
        skills_json=[],
    )
    db.add(c)
    db.commit()
    db.refresh(c)
    return c


@router.post("/tests/{test_id}/start", response_model=AttemptStartResponse)
async def start_attempt(
    test_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Start an attempt; returns attempt id and questions (without correct answers)."""
    candidate = _get_candidate(current_user, db)
    t = db.query(AptitudeTest).filter(AptitudeTest.id == test_id, AptitudeTest.is_active == True).first()
    if not t:
        raise HTTPException(status_code=404, detail="Test not found")
    questions = db.query(AptitudeQuestion).filter(AptitudeQuestion.test_id == test_id).all()
    if not questions:
        raise HTTPException(status_code=400, detail="Test has no questions")
    attempt = TestAttempt(
        test_id=test_id,
        candidate_id=candidate.id,
    )
    db.add(attempt)
    db.commit()
    db.refresh(attempt)
    questions_out = [
        QuestionOut(
            id=q.id,
            question_text=q.question_text,
            options=q.options_json or [],
            category=q.category,
            difficulty=q.difficulty,
        )
        for q in questions
    ]
    return AttemptStartResponse(
        attempt_id=attempt.id,
        test_id=test_id,
        questions=questions_out,
        duration_minutes=t.duration_minutes or 30,
    )


@router.post("/attempts/{attempt_id}/submit", response_model=AttemptResultResponse)
async def submit_attempt(
    attempt_id: int,
    body: SubmitAnswersBody,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Submit answers and get score."""
    candidate = _get_candidate(current_user, db)
    attempt = db.query(TestAttempt).filter(
        TestAttempt.id == attempt_id,
        TestAttempt.candidate_id == candidate.id,
    ).first()
    if not attempt:
        raise HTTPException(status_code=404, detail="Attempt not found")
    if attempt.submitted_at:
        raise HTTPException(status_code=400, detail="Attempt already submitted")
    questions = db.query(AptitudeQuestion).filter(AptitudeQuestion.test_id == attempt.test_id).all()
    answers = body.answers or {}
    correct = 0
    for q in questions:
        key = str(q.id)
        if key in answers and answers[key] == q.correct_index:
            correct += 1
    total = len(questions)
    score = (correct / total * 100) if total else 0
    passed = score >= (PASS_THRESHOLD * 100)
    attempt.submitted_at = datetime.now(timezone.utc)
    attempt.score = score
    attempt.passed = passed
    attempt.answers_json = {k: int(v) for k, v in answers.items()}
    db.commit()
    return AttemptResultResponse(
        attempt_id=attempt.id,
        score=round(score, 2),
        passed=passed,
        total_questions=total,
        correct_count=correct,
    )


@router.get("/attempts/me")
async def my_attempts(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """List current user's attempts."""
    candidate = _get_candidate(current_user, db)
    attempts = (
        db.query(TestAttempt)
        .filter(TestAttempt.candidate_id == candidate.id)
        .order_by(TestAttempt.started_at.desc())
        .all()
    )
    out = []
    for a in attempts:
        t = a.test
        out.append({
            "id": a.id,
            "test_id": a.test_id,
            "test_title": t.title if t else None,
            "started_at": a.started_at.isoformat() if a.started_at else None,
            "submitted_at": a.submitted_at.isoformat() if a.submitted_at else None,
            "score": a.score,
            "passed": a.passed,
        })
    return out


@router.get("/attempts/{attempt_id}/detailed-results", response_model=DetailedTestResultsResponse)
async def get_detailed_results(
    attempt_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Get detailed results for an attempt including all questions and answers."""
    candidate = _get_candidate(current_user, db)
    attempt = db.query(TestAttempt).filter(
        TestAttempt.id == attempt_id,
        TestAttempt.candidate_id == candidate.id,
    ).first()
    if not attempt:
        raise HTTPException(status_code=404, detail="Attempt not found")
    if not attempt.submitted_at:
        raise HTTPException(status_code=400, detail="Attempt not yet submitted")
    
    test = db.query(AptitudeTest).filter(AptitudeTest.id == attempt.test_id).first()
    questions = db.query(AptitudeQuestion).filter(AptitudeQuestion.test_id == attempt.test_id).all()
    
    user_answers = attempt.answers_json or {}
    questions_detail = []
    correct_count = 0
    skipped_count = 0
    
    # Map for converting index to letter
    index_to_letter = {0: 'A', 1: 'B', 2: 'C', 3: 'D'}
    
    for q in questions:
        user_answer_index = None
        if str(q.id) in user_answers:
            user_answer_index = int(user_answers[str(q.id)])
        
        is_correct = (user_answer_index == q.correct_index) if user_answer_index is not None else False
        if is_correct:
            correct_count += 1
        if user_answer_index is None:
            skipped_count += 1
        
        # Get options from the options_json array or use empty strings
        options = q.options_json or ['', '', '', '']
        option_a = options[0] if len(options) > 0 else ''
        option_b = options[1] if len(options) > 1 else ''
        option_c = options[2] if len(options) > 2 else ''
        option_d = options[3] if len(options) > 3 else ''
        
        # Convert indices to letters
        correct_option = index_to_letter.get(q.correct_index, '')
        selected_option = index_to_letter.get(user_answer_index) if user_answer_index is not None else None
        
        questions_detail.append(QuestionResultDetail(
            question_id=q.id,
            question_text=q.question_text,
            option_a=option_a,
            option_b=option_b,
            option_c=option_c,
            option_d=option_d,
            correct_option=correct_option,
            selected_option=selected_option,
            is_correct=is_correct,
            difficulty_level=q.difficulty or 'medium',
        ))
    
    # Calculate time taken
    time_taken = 0
    if attempt.started_at and attempt.submitted_at:
        time_delta = attempt.submitted_at - attempt.started_at
        time_taken = int(time_delta.total_seconds())
    
    incorrect_count = len(questions) - correct_count - skipped_count
    
    return DetailedTestResultsResponse(
        attempt_id=attempt.id,
        test_id=attempt.test_id,
        test_title=test.title if test else None,
        user_id=current_user.id,
        score=round(attempt.score, 2) if attempt.score else 0,
        total_questions=len(questions),
        correct_answers=correct_count,
        incorrect_answers=incorrect_count,
        skipped_questions=skipped_count,
        time_taken=time_taken,
        submitted_at=attempt.submitted_at.isoformat() if attempt.submitted_at else '',
        questions=questions_detail,
    )
