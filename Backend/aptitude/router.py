"""
API Router for Aptitude Engine
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from .services import AptitudeService
from .schemas import (
    TestStartResponse, TestSubmissionRequest, TestSubmissionResponse,
    LeaderboardResponse, StudentRankResponse
)

# Try to import database dependency from existing module
try:
    from database.dependencies import get_db
except ImportError:
    try:
        from database import get_db
    except ImportError:
        # Fallback: create a simple database dependency
        # This should be replaced with actual database connection
        # Try to import from database.py in Backend folder
        try:
            from database import get_db
        except ImportError:
            def get_db():
                """Database dependency - should be replaced with actual implementation"""
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Database connection not configured. Please set up database module."
                )

# Try to import JWT auth dependency from existing module
try:
    from auth.dependencies import get_current_user
except ImportError:
    try:
        from auth import get_current_user
    except ImportError:
        # Fallback: create a simple auth dependency
        # This should be replaced with actual JWT implementation
        def get_current_user():
            """Auth dependency - mock for testing/development"""
            # For development/testing, return a mock user
            # In production, this should decode JWT and return user
            return {"id": 1, "user_id": 1}  # Mock user ID for testing

router = APIRouter()


@router.post(
    "/tests/{test_id}/start",
    response_model=TestStartResponse,
    status_code=status.HTTP_200_OK,
    summary="Start an aptitude test",
    description="Creates a new test attempt and returns randomized questions"
)
async def start_test(
    test_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    Start a test for the authenticated student
    
    - Validates student via JWT
    - Creates attempt record
    - Returns randomized questions
    """
    user_id = current_user.get("id") or current_user.get("user_id")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User ID not found in token"
        )
    
    service = AptitudeService(db)
    return service.start_test(test_id, user_id)


@router.post(
    "/tests/{test_id}/submit",
    response_model=TestSubmissionResponse,
    status_code=status.HTTP_200_OK,
    summary="Submit an aptitude test",
    description="Submits answers, calculates score, and stores responses"
)
async def submit_test(
    test_id: int,
    request: TestSubmissionRequest,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    Submit test with answers
    
    - Auto evaluates answers
    - Calculates score
    - Stores responses
    - Computes time taken
    """
    user_id = current_user.get("id") or current_user.get("user_id")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User ID not found in token"
        )
    
    # Get the latest attempt for this user and test
    service = AptitudeService(db)
    
    # Find the active attempt
    from .models import AptitudeAttempt
    attempt = db.query(AptitudeAttempt).filter(
        AptitudeAttempt.test_id == test_id,
        AptitudeAttempt.user_id == user_id,
        AptitudeAttempt.submitted_at.is_(None)
    ).first()
    
    if not attempt:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No active attempt found. Please start the test first."
        )
    
    # Convert answers to dict format
    answers = [
        {"question_id": ans.question_id, "selected_option": ans.selected_option}
        for ans in request.answers
    ]
    
    return service.submit_test(test_id, user_id, attempt.id, answers)


@router.get(
    "/tests/{test_id}/leaderboard",
    response_model=LeaderboardResponse,
    status_code=status.HTTP_200_OK,
    summary="Get test leaderboard",
    description="Returns top scorers sorted by score (desc) and time (asc)"
)
async def get_leaderboard(
    test_id: int,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """
    Get leaderboard for a test
    
    Returns top scorers with:
    - Rank
    - Score
    - Time taken
    
    Sort priority:
    1. Highest score
    2. Lowest time taken
    """
    service = AptitudeService(db)
    result = service.get_leaderboard(test_id, limit)
    
    from .schemas import LeaderboardEntry
    entries = [LeaderboardEntry(**entry) for entry in result["entries"]]
    
    return LeaderboardResponse(
        test_id=result["test_id"],
        test_title=result["test_title"],
        entries=entries,
        total_participants=result["total_participants"]
    )


@router.get(
    "/tests/{test_id}/my-rank",
    response_model=StudentRankResponse,
    status_code=status.HTTP_200_OK,
    summary="Get student's rank",
    description="Returns student's rank, percentile, and score comparison"
)
async def get_my_rank(
    test_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    Get student's rank information
    
    Returns:
    - Student rank
    - Percentile
    - Score comparison
    """
    user_id = current_user.get("id") or current_user.get("user_id")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User ID not found in token"
        )
    
    service = AptitudeService(db)
    result = service.get_student_rank_info(test_id, user_id)
    
    return StudentRankResponse(**result)
