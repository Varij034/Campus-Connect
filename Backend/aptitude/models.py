"""
SQLAlchemy database models for Aptitude Engine
"""

from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Boolean, Enum as SQLEnum
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from datetime import datetime
import enum

# Try to use existing Base if available, otherwise create new one
try:
    from database.base import Base
except ImportError:
    try:
        from database import Base
    except ImportError:
        # Fallback: create base if no database module exists
        Base = declarative_base()


class DifficultyLevel(str, enum.Enum):
    """Difficulty level enum"""
    EASY = "easy"
    MEDIUM = "medium"
    HARD = "hard"


class AptitudeTest(Base):
    """Aptitude test table"""
    __tablename__ = "aptitude_tests"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False, index=True)
    description = Column(String(1000), nullable=True)
    duration_minutes = Column(Integer, nullable=False, default=30)
    total_questions = Column(Integer, nullable=False, default=10)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    # Relationships
    questions = relationship("AptitudeQuestion", back_populates="test", cascade="all, delete-orphan")
    attempts = relationship("AptitudeAttempt", back_populates="test", cascade="all, delete-orphan")


class AptitudeQuestion(Base):
    """Aptitude question table"""
    __tablename__ = "aptitude_questions"
    
    id = Column(Integer, primary_key=True, index=True)
    test_id = Column(Integer, ForeignKey("aptitude_tests.id", ondelete="CASCADE"), nullable=False, index=True)
    question_text = Column(String(2000), nullable=False)
    option_a = Column(String(500), nullable=False)
    option_b = Column(String(500), nullable=False)
    option_c = Column(String(500), nullable=False)
    option_d = Column(String(500), nullable=False)
    correct_option = Column(String(1), nullable=False)  # 'A', 'B', 'C', or 'D'
    difficulty_level = Column(SQLEnum(DifficultyLevel), nullable=False, default=DifficultyLevel.MEDIUM, index=True)
    
    # Relationships
    test = relationship("AptitudeTest", back_populates="questions")
    responses = relationship("AptitudeResponse", back_populates="question")


class AptitudeAttempt(Base):
    """Aptitude test attempt table"""
    __tablename__ = "aptitude_attempts"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=False, index=True)  # FK to existing users table (reference only)
    test_id = Column(Integer, ForeignKey("aptitude_tests.id", ondelete="CASCADE"), nullable=False, index=True)
    score = Column(Float, nullable=False, default=0.0)
    started_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    submitted_at = Column(DateTime, nullable=True)
    time_taken = Column(Integer, nullable=True)  # Time taken in seconds
    
    # Relationships
    test = relationship("AptitudeTest", back_populates="attempts")
    responses = relationship("AptitudeResponse", back_populates="attempt", cascade="all, delete-orphan")


class AptitudeResponse(Base):
    """Aptitude response table"""
    __tablename__ = "aptitude_responses"
    
    id = Column(Integer, primary_key=True, index=True)
    attempt_id = Column(Integer, ForeignKey("aptitude_attempts.id", ondelete="CASCADE"), nullable=False, index=True)
    question_id = Column(Integer, ForeignKey("aptitude_questions.id", ondelete="CASCADE"), nullable=False, index=True)
    selected_option = Column(String(1), nullable=True)  # 'A', 'B', 'C', 'D', or None
    is_correct = Column(Boolean, nullable=False, default=False)
    
    # Relationships
    attempt = relationship("AptitudeAttempt", back_populates="responses")
    question = relationship("AptitudeQuestion", back_populates="responses")
