"""
SQLAlchemy models for PostgreSQL database
"""

from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from datetime import datetime

from app.database.postgres import Base


class User(Base):
    """User model for students and HR"""
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(20), nullable=False)  # 'student' or 'hr'
    
    # Profile information
    name = Column(String(255), nullable=True)
    college = Column(String(255), nullable=True)
    branch = Column(String(255), nullable=True)
    year = Column(String(50), nullable=True)
    graduation_year = Column(String(10), nullable=True)
    location = Column(String(255), nullable=True)
    cgpa = Column(String(10), nullable=True)
    phone = Column(String(20), nullable=True)
    
    # Company info (for HR)
    company_name = Column(String(255), nullable=True)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=True)
    
    # Verification
    is_verified = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    applications = relationship("Application", back_populates="student")
    logs = relationship("Log", back_populates="user")
    company = relationship("Company", back_populates="hr_users")


class Company(Base):
    """Company model"""
    __tablename__ = "companies"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False, unique=True)
    description = Column(Text, nullable=True)
    website = Column(String(255), nullable=True)
    logo_url = Column(String(500), nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    jobs = relationship("Job", back_populates="company")
    hr_users = relationship("User", back_populates="company")


class Job(Base):
    """Job posting model"""
    __tablename__ = "jobs"
    
    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    requirements = Column(Text, nullable=True)
    skills = Column(JSON, nullable=True)  # List of skills as JSON
    location = Column(String(255), nullable=True)
    salary = Column(String(100), nullable=True)
    job_type = Column(String(50), nullable=True)  # 'full-time', 'part-time', 'internship'
    
    # ATS Configuration
    minimum_ats_score = Column(Float, default=50.0)
    required_skills = Column(JSON, nullable=True)
    preferred_skills = Column(JSON, nullable=True)
    education_level = Column(String(100), nullable=True)
    years_of_experience = Column(Integer, nullable=True)
    keywords = Column(JSON, nullable=True)
    
    # Status
    status = Column(String(20), default="active")  # 'active', 'closed', 'draft'
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    expires_at = Column(DateTime(timezone=True), nullable=True)
    
    # Relationships
    company = relationship("Company", back_populates="jobs")
    applications = relationship("Application", back_populates="job")


class Application(Base):
    """Job application model"""
    __tablename__ = "applications"
    
    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    job_id = Column(Integer, ForeignKey("jobs.id"), nullable=False)
    
    # Resume information
    resume_path = Column(String(500), nullable=True)
    resume_text = Column(Text, nullable=True)
    
    # ATS Results
    ats_score = Column(Float, nullable=True)
    skill_match_score = Column(Float, nullable=True)
    education_score = Column(Float, nullable=True)
    experience_score = Column(Float, nullable=True)
    keyword_match_score = Column(Float, nullable=True)
    format_score = Column(Float, nullable=True)
    matched_skills = Column(JSON, nullable=True)
    missing_skills = Column(JSON, nullable=True)
    
    # Status
    status = Column(String(50), default="pending")  # 'pending', 'reviewed', 'shortlisted', 'rejected', 'accepted'
    
    # Feedback
    feedback = Column(JSON, nullable=True)  # Store rejection feedback as JSON
    
    # Timestamps
    applied_at = Column(DateTime(timezone=True), server_default=func.now())
    reviewed_at = Column(DateTime(timezone=True), nullable=True)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    student = relationship("User", back_populates="applications")
    job = relationship("Job", back_populates="applications")


class Log(Base):
    """Application activity log"""
    __tablename__ = "logs"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    action = Column(String(100), nullable=False)  # 'login', 'apply', 'create_job', etc.
    endpoint = Column(String(255), nullable=True)
    method = Column(String(10), nullable=True)  # 'GET', 'POST', etc.
    ip_address = Column(String(50), nullable=True)
    user_agent = Column(String(500), nullable=True)
    log_metadata = Column(JSON, nullable=True)  # Additional data as JSON (renamed from 'metadata' - reserved word)
    
    # Timestamps
    timestamp = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    
    # Relationships
    user = relationship("User", back_populates="logs")
