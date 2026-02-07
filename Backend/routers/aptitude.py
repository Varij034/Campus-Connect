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


def _get_candidate(user_id: int, db: Session) -> Candidate:
    c = db.query(Candidate).filter(Candidate.user_id == user_id).first()
    if not c:
        raise HTTPException(status_code=400, detail="Candidate profile required to take tests")
    return c


@router.post("/tests/{test_id}/start", response_model=AttemptStartResponse)
async def start_attempt(
    test_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Start an attempt; returns attempt id and questions (without correct answers)."""
    candidate = _get_candidate(current_user.id, db)
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
    candidate = _get_candidate(current_user.id, db)
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
    candidate = _get_candidate(current_user.id, db)
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
