"""Add Badge and CandidateBadge tables

Revision ID: 003_badges
Revises: 002_verify
Create Date: 2025-02-07

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy import inspect

revision = "003_badges"
down_revision = "002_verify"
branch_labels = None
depends_on = None


def upgrade() -> None:
    conn = op.get_bind()
    inspector = inspect(conn)
    tables = set(inspector.get_table_names())
    if "badges" not in tables:
        op.create_table(
            "badges",
            sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
            sa.Column("name", sa.String(255), nullable=False),
            sa.Column("description", sa.Text()),
            sa.Column("skill_key", sa.String(100), index=True),
            sa.Column("criteria_json", sa.JSON()),
            sa.Column("image_url", sa.String(500)),
            sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        )
    if "candidate_badges" not in tables:
        op.create_table(
            "candidate_badges",
            sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
            sa.Column("candidate_id", sa.Integer(), sa.ForeignKey("candidates.id"), nullable=False),
            sa.Column("badge_id", sa.Integer(), sa.ForeignKey("badges.id"), nullable=False),
            sa.Column("awarded_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
            sa.Column("source", sa.String(50)),
        )
        op.create_unique_constraint("uq_candidate_badge", "candidate_badges", ["candidate_id", "badge_id"])


def downgrade() -> None:
    conn = op.get_bind()
    inspector = inspect(conn)
    tables = set(inspector.get_table_names())
    if "candidate_badges" in tables:
        op.drop_table("candidate_badges")
    if "badges" in tables:
        op.drop_table("badges")
