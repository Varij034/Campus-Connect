"""Add MentorProfile and MentorshipRequest, MENTOR role

Revision ID: 006_mentorship
Revises: 005_aptitude
Create Date: 2025-02-07

"""
from alembic import op
import sqlalchemy as sa

revision = "006_mentorship"
down_revision = "005_aptitude"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute("ALTER TYPE userrole ADD VALUE IF NOT EXISTS 'mentor'")
    op.create_table(
        "mentor_profiles",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("headline", sa.String(500)),
        sa.Column("bio", sa.Text()),
        sa.Column("skills_json", sa.JSON()),
        sa.Column("company", sa.String(255)),
        sa.Column("years_experience", sa.Integer()),
        sa.Column("linkedin_url", sa.String(500)),
        sa.Column("is_available", sa.Boolean(), server_default="true"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    op.create_index("ix_mentor_profiles_user_id", "mentor_profiles", ["user_id"], unique=True)
    op.create_table(
        "mentorship_requests",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("mentor_id", sa.Integer(), sa.ForeignKey("mentor_profiles.id"), nullable=False),
        sa.Column("student_id", sa.Integer(), sa.ForeignKey("candidates.id"), nullable=False),
        sa.Column("message", sa.Text()),
        sa.Column("status", sa.String(20), server_default="pending"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("responded_at", sa.DateTime(timezone=True)),
    )


def downgrade() -> None:
    op.drop_table("mentorship_requests")
    op.drop_index("ix_mentor_profiles_user_id", table_name="mentor_profiles")
    op.drop_table("mentor_profiles")
    # userrole enum: leave 'mentor' in place (PostgreSQL doesn't support remove)
