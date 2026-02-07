"""Add AptitudeTest, AptitudeQuestion, TestAttempt

Revision ID: 005_aptitude
Revises: 004_prep
Create Date: 2025-02-07

"""
from alembic import op
import sqlalchemy as sa

revision = "005_aptitude"
down_revision = "004_prep"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "aptitude_tests",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("title", sa.String(255), nullable=False),
        sa.Column("description", sa.Text()),
        sa.Column("duration_minutes", sa.Integer(), server_default="30"),
        sa.Column("is_active", sa.Boolean(), server_default="true"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    op.create_table(
        "aptitude_questions",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("test_id", sa.Integer(), sa.ForeignKey("aptitude_tests.id"), nullable=False),
        sa.Column("question_text", sa.Text(), nullable=False),
        sa.Column("options_json", sa.JSON()),
        sa.Column("correct_index", sa.Integer(), nullable=False),
        sa.Column("category", sa.String(50)),
        sa.Column("difficulty", sa.String(20)),
    )
    op.create_table(
        "test_attempts",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("test_id", sa.Integer(), sa.ForeignKey("aptitude_tests.id"), nullable=False),
        sa.Column("candidate_id", sa.Integer(), sa.ForeignKey("candidates.id"), nullable=False),
        sa.Column("started_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("submitted_at", sa.DateTime(timezone=True)),
        sa.Column("score", sa.Float()),
        sa.Column("passed", sa.Boolean(), server_default="false"),
        sa.Column("answers_json", sa.JSON()),
    )


def downgrade() -> None:
    op.drop_table("test_attempts")
    op.drop_table("aptitude_questions")
    op.drop_table("aptitude_tests")
