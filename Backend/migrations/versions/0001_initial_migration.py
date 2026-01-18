"""Initial migration

Revision ID: 0001_initial
Revises: 
Create Date: 2024-01-01 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '0001_initial'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Create companies table
    op.create_table(
        'companies',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('website', sa.String(length=255), nullable=True),
        sa.Column('logo_url', sa.String(length=500), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('name')
    )
    
    # Create users table
    op.create_table(
        'users',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('email', sa.String(length=255), nullable=False),
        sa.Column('password_hash', sa.String(length=255), nullable=False),
        sa.Column('role', sa.String(length=20), nullable=False),
        sa.Column('name', sa.String(length=255), nullable=True),
        sa.Column('college', sa.String(length=255), nullable=True),
        sa.Column('branch', sa.String(length=255), nullable=True),
        sa.Column('year', sa.String(length=50), nullable=True),
        sa.Column('graduation_year', sa.String(length=10), nullable=True),
        sa.Column('location', sa.String(length=255), nullable=True),
        sa.Column('cgpa', sa.String(length=10), nullable=True),
        sa.Column('phone', sa.String(length=20), nullable=True),
        sa.Column('company_name', sa.String(length=255), nullable=True),
        sa.Column('company_id', sa.Integer(), nullable=True),
        sa.Column('is_verified', sa.Boolean(), server_default='false', nullable=True),
        sa.Column('is_active', sa.Boolean(), server_default='true', nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['company_id'], ['companies.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_users_email'), 'users', ['email'], unique=True)
    op.create_index(op.f('ix_users_id'), 'users', ['id'], unique=False)
    
    # Create jobs table
    op.create_table(
        'jobs',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('company_id', sa.Integer(), nullable=False),
        sa.Column('title', sa.String(length=255), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('requirements', sa.Text(), nullable=True),
        sa.Column('skills', postgresql.JSON(astext_type=sa.Text()), nullable=True),
        sa.Column('location', sa.String(length=255), nullable=True),
        sa.Column('salary', sa.String(length=100), nullable=True),
        sa.Column('job_type', sa.String(length=50), nullable=True),
        sa.Column('minimum_ats_score', sa.Float(), server_default='50.0', nullable=True),
        sa.Column('required_skills', postgresql.JSON(astext_type=sa.Text()), nullable=True),
        sa.Column('preferred_skills', postgresql.JSON(astext_type=sa.Text()), nullable=True),
        sa.Column('education_level', sa.String(length=100), nullable=True),
        sa.Column('years_of_experience', sa.Integer(), nullable=True),
        sa.Column('keywords', postgresql.JSON(astext_type=sa.Text()), nullable=True),
        sa.Column('status', sa.String(length=20), server_default='active', nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('expires_at', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['company_id'], ['companies.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_jobs_id'), 'jobs', ['id'], unique=False)
    
    # Create applications table
    op.create_table(
        'applications',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('student_id', sa.Integer(), nullable=False),
        sa.Column('job_id', sa.Integer(), nullable=False),
        sa.Column('resume_path', sa.String(length=500), nullable=True),
        sa.Column('resume_text', sa.Text(), nullable=True),
        sa.Column('ats_score', sa.Float(), nullable=True),
        sa.Column('skill_match_score', sa.Float(), nullable=True),
        sa.Column('education_score', sa.Float(), nullable=True),
        sa.Column('experience_score', sa.Float(), nullable=True),
        sa.Column('keyword_match_score', sa.Float(), nullable=True),
        sa.Column('format_score', sa.Float(), nullable=True),
        sa.Column('matched_skills', postgresql.JSON(astext_type=sa.Text()), nullable=True),
        sa.Column('missing_skills', postgresql.JSON(astext_type=sa.Text()), nullable=True),
        sa.Column('status', sa.String(length=50), server_default='pending', nullable=True),
        sa.Column('feedback', postgresql.JSON(astext_type=sa.Text()), nullable=True),
        sa.Column('applied_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('reviewed_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['job_id'], ['jobs.id'], ),
        sa.ForeignKeyConstraint(['student_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_applications_id'), 'applications', ['id'], unique=False)
    
    # Create logs table
    op.create_table(
        'logs',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=True),
        sa.Column('action', sa.String(length=100), nullable=False),
        sa.Column('endpoint', sa.String(length=255), nullable=True),
        sa.Column('method', sa.String(length=10), nullable=True),
    sa.Column('ip_address', sa.String(length=50), nullable=True),
    sa.Column('user_agent', sa.String(length=500), nullable=True),
    sa.Column('log_metadata', postgresql.JSON(astext_type=sa.Text()), nullable=True),
    sa.Column('timestamp', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_logs_id'), 'logs', ['id'], unique=False)
    op.create_index(op.f('ix_logs_timestamp'), 'logs', ['timestamp'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_logs_timestamp'), table_name='logs')
    op.drop_index(op.f('ix_logs_id'), table_name='logs')
    op.drop_table('logs')
    op.drop_index(op.f('ix_applications_id'), table_name='applications')
    op.drop_table('applications')
    op.drop_index(op.f('ix_jobs_id'), table_name='jobs')
    op.drop_table('jobs')
    op.drop_index(op.f('ix_users_id'), table_name='users')
    op.drop_index(op.f('ix_users_email'), table_name='users')
    op.drop_table('users')
    op.drop_table('companies')
