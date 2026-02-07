"""
Business logic services for Aptitude Engine
"""

from sqlalchemy.orm import Session
from sqlalchemy import desc, asc, func
from typing import List, Optional, Dict
from datetime import datetime
from fastapi import HTTPException, status

from .models import (
    AptitudeTest, AptitudeQuestion, AptitudeAttempt, AptitudeResponse
)
from .schemas import QuestionResponse, TestStartResponse, TestSubmissionResponse
from .utils import (
    randomize_questions, calculate_score, calculate_time_taken,
    evaluate_answer, get_student_rank, calculate_percentile
)
from .constants import LEADERBOARD_LIMIT


class AptitudeService:
    """Service class for aptitude test operations"""
    
    def __init__(self, db: Session):
        self.db = db
    
    def get_test(self, test_id: int) -> AptitudeTest:
        """Get test by ID"""
        test = self.db.query(AptitudeTest).filter(AptitudeTest.id == test_id).first()
        if not test:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Test with ID {test_id} not found"
            )
        return test
    
    def start_test(self, test_id: int, user_id: int) -> TestStartResponse:
        """
        Start a test for a user
        
        Args:
            test_id: Test ID
            user_id: User ID from JWT
            
        Returns:
            TestStartResponse with questions
        """
        # Get test
        test = self.get_test(test_id)
        
        # Check if user already has an active attempt
        existing_attempt = self.db.query(AptitudeAttempt).filter(
            AptitudeAttempt.test_id == test_id,
            AptitudeAttempt.user_id == user_id,
            AptitudeAttempt.submitted_at.is_(None)
        ).first()
        
        if existing_attempt:
            # Return existing attempt
            questions = self.db.query(AptitudeQuestion).filter(
                AptitudeQuestion.test_id == test_id
            ).all()
            
            questions = randomize_questions(questions)
            # Use model_validate for Pydantic v2, fallback to from_orm for v1
            try:
                question_responses = [
                    QuestionResponse.model_validate(q) for q in questions
                ]
            except AttributeError:
                question_responses = [
                    QuestionResponse.from_orm(q) for q in questions
                ]
            
            return TestStartResponse(
                attempt_id=existing_attempt.id,
                test=test,
                questions=question_responses,
                started_at=existing_attempt.started_at,
                duration_minutes=test.duration_minutes
            )
        
        # Create new attempt
        attempt = AptitudeAttempt(
            user_id=user_id,
            test_id=test_id,
            score=0.0,
            started_at=datetime.utcnow()
        )
        self.db.add(attempt)
        self.db.flush()  # Get the attempt ID
        
        # Get questions and randomize
        questions = self.db.query(AptitudeQuestion).filter(
            AptitudeQuestion.test_id == test_id
        ).all()
        
        if not questions:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Test has no questions"
            )
        
        questions = randomize_questions(questions)
        
        # Convert to response schema (without correct answers)
        # Use model_validate for Pydantic v2, fallback to from_orm for v1
        try:
            question_responses = [
                QuestionResponse.model_validate(q) for q in questions
            ]
        except AttributeError:
            question_responses = [
                QuestionResponse.from_orm(q) for q in questions
            ]
        
        self.db.commit()
        
        return TestStartResponse(
            attempt_id=attempt.id,
            test=test,
            questions=question_responses,
            started_at=attempt.started_at,
            duration_minutes=test.duration_minutes
        )
    
    def submit_test(
        self,
        test_id: int,
        user_id: int,
        attempt_id: int,
        answers: List[Dict[str, any]]
    ) -> TestSubmissionResponse:
        """
        Submit a test with answers
        
        Args:
            test_id: Test ID
            user_id: User ID from JWT
            attempt_id: Attempt ID
            answers: List of answers with question_id and selected_option
            
        Returns:
            TestSubmissionResponse with score
        """
        # Get attempt
        attempt = self.db.query(AptitudeAttempt).filter(
            AptitudeAttempt.id == attempt_id,
            AptitudeAttempt.test_id == test_id,
            AptitudeAttempt.user_id == user_id
        ).first()
        
        if not attempt:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Attempt not found"
            )
        
        if attempt.submitted_at:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Test already submitted"
            )
        
        # Get test
        test = self.get_test(test_id)
        
        # Get all questions for this test
        questions_dict = {
            q.id: q for q in self.db.query(AptitudeQuestion).filter(
                AptitudeQuestion.test_id == test_id
            ).all()
        }
        
        # Create responses and evaluate
        responses = []
        for answer in answers:
            question_id = answer.get("question_id")
            selected_option = answer.get("selected_option")
            
            if question_id not in questions_dict:
                continue  # Skip invalid question IDs
            
            question = questions_dict[question_id]
            is_correct = evaluate_answer(question, selected_option)
            
            response = AptitudeResponse(
                attempt_id=attempt_id,
                question_id=question_id,
                selected_option=selected_option.upper(),
                is_correct=is_correct
            )
            responses.append(response)
        
        # Bulk insert responses
        self.db.bulk_save_objects(responses)
        
        # Calculate score
        score_data = calculate_score(responses)
        
        # Update attempt
        submitted_at = datetime.utcnow()
        time_taken = calculate_time_taken(attempt.started_at, submitted_at)
        
        attempt.score = score_data["score"]
        attempt.submitted_at = submitted_at
        attempt.time_taken = time_taken
        
        self.db.commit()
        
        return TestSubmissionResponse(
            attempt_id=attempt.id,
            score=score_data["score"],
            total_questions=score_data["total_questions"],
            correct_answers=score_data["correct_answers"],
            time_taken=time_taken or 0,
            submitted_at=submitted_at
        )
    
    def get_leaderboard(self, test_id: int, limit: int = LEADERBOARD_LIMIT) -> Dict:
        """
        Get leaderboard for a test
        
        Args:
            test_id: Test ID
            limit: Maximum number of entries
            
        Returns:
            Dictionary with leaderboard data
        """
        test = self.get_test(test_id)
        
        # Get all submitted attempts, sorted by score (desc) and time (asc)
        attempts = self.db.query(AptitudeAttempt).filter(
            AptitudeAttempt.test_id == test_id,
            AptitudeAttempt.submitted_at.isnot(None)
        ).order_by(
            desc(AptitudeAttempt.score),
            asc(AptitudeAttempt.time_taken)
        ).limit(limit).all()
        
        # Build leaderboard entries
        entries = []
        for rank, attempt in enumerate(attempts, 1):
            entries.append({
                "rank": rank,
                "user_id": attempt.user_id,
                "score": attempt.score,
                "time_taken": attempt.time_taken or 0,
                "submitted_at": attempt.submitted_at
            })
        
        total_participants = self.db.query(AptitudeAttempt).filter(
            AptitudeAttempt.test_id == test_id,
            AptitudeAttempt.submitted_at.isnot(None)
        ).count()
        
        return {
            "test_id": test_id,
            "test_title": test.title,
            "entries": entries,
            "total_participants": total_participants
        }
    
    def get_student_rank_info(self, test_id: int, user_id: int) -> Dict:
        """
        Get student's rank information
        
        Args:
            test_id: Test ID
            user_id: User ID
            
        Returns:
            Dictionary with rank information
        """
        test = self.get_test(test_id)
        
        # Get all submitted attempts
        all_attempts = self.db.query(AptitudeAttempt).filter(
            AptitudeAttempt.test_id == test_id,
            AptitudeAttempt.submitted_at.isnot(None)
        ).all()
        
        # Get student's attempt
        student_attempt = next(
            (a for a in all_attempts if a.user_id == user_id),
            None
        )
        
        if not student_attempt:
            return {
                "test_id": test_id,
                "test_title": test.title,
                "user_id": user_id,
                "rank": None,
                "score": None,
                "time_taken": None,
                "percentile": None,
                "total_participants": len(all_attempts),
                "submitted_at": None
            }
        
        # Calculate rank
        rank = get_student_rank(self.db, test_id, user_id, all_attempts)
        percentile = calculate_percentile(rank, len(all_attempts)) if rank else None
        
        return {
            "test_id": test_id,
            "test_title": test.title,
            "user_id": user_id,
            "rank": rank,
            "score": student_attempt.score,
            "time_taken": student_attempt.time_taken,
            "percentile": percentile,
            "total_participants": len(all_attempts),
            "submitted_at": student_attempt.submitted_at
        }
