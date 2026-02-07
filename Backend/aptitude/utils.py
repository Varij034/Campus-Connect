"""
Utility functions for Aptitude Engine
Scoring, ranking, and helper functions
"""

import random
from typing import List, Dict, Optional
from sqlalchemy.orm import Session
from .models import AptitudeQuestion, AptitudeResponse, AptitudeAttempt
from .constants import CORRECT_ANSWER_SCORE, INCORRECT_ANSWER_SCORE


def randomize_questions(questions: List[AptitudeQuestion]) -> List[AptitudeQuestion]:
    """
    Randomize the order of questions
    
    Args:
        questions: List of questions to randomize
        
    Returns:
        Randomized list of questions
    """
    questions_list = list(questions)
    random.shuffle(questions_list)
    return questions_list


def calculate_score(responses: List[AptitudeResponse]) -> Dict[str, any]:
    """
    Calculate score from responses
    
    Args:
        responses: List of response objects
        
    Returns:
        Dictionary with score details
    """
    total_questions = len(responses)
    correct_count = sum(1 for r in responses if r.is_correct)
    incorrect_count = total_questions - correct_count
    
    score = (correct_count / total_questions * 100) if total_questions > 0 else 0.0
    
    return {
        "score": round(score, 2),
        "total_questions": total_questions,
        "correct_answers": correct_count,
        "incorrect_answers": incorrect_count
    }


def calculate_time_taken(started_at, submitted_at) -> Optional[int]:
    """
    Calculate time taken in seconds
    
    Args:
        started_at: Start datetime
        submitted_at: Submit datetime
        
    Returns:
        Time taken in seconds or None
    """
    if not submitted_at or not started_at:
        return None
    
    delta = submitted_at - started_at
    return int(delta.total_seconds())


def calculate_percentile(rank: int, total_participants: int) -> float:
    """
    Calculate percentile rank
    
    Args:
        rank: Student's rank (1-based)
        total_participants: Total number of participants
        
    Returns:
        Percentile (0-100)
    """
    if total_participants == 0:
        return 0.0
    
    if rank is None:
        return 0.0
    
    # Percentile = ((total - rank) / total) * 100
    percentile = ((total_participants - rank) / total_participants) * 100
    return round(percentile, 2)


def get_student_rank(
    db: Session,
    test_id: int,
    user_id: int,
    attempts: List[AptitudeAttempt]
) -> Optional[int]:
    """
    Get student's rank in the leaderboard
    
    Args:
        db: Database session
        test_id: Test ID
        user_id: User ID
        attempts: List of all attempts for the test
        
    Returns:
        Rank (1-based) or None if student hasn't taken the test
    """
    # Find student's attempt
    student_attempt = next(
        (a for a in attempts if a.user_id == user_id and a.submitted_at is not None),
        None
    )
    
    if not student_attempt:
        return None
    
    # Sort attempts by score (desc) and time (asc)
    sorted_attempts = sorted(
        [a for a in attempts if a.submitted_at is not None],
        key=lambda x: (-x.score, x.time_taken or float('inf'))
    )
    
    # Find rank (1-based)
    for idx, attempt in enumerate(sorted_attempts, 1):
        if attempt.id == student_attempt.id:
            return idx
    
    return None


def evaluate_answer(question: AptitudeQuestion, selected_option: str) -> bool:
    """
    Evaluate if the selected answer is correct
    
    Args:
        question: Question object
        selected_option: Selected option (A, B, C, or D)
        
    Returns:
        True if correct, False otherwise
    """
    return question.correct_option.upper() == selected_option.upper()
