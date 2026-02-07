"""Add PrepModule table

Revision ID: 004_prep
Revises: 003_badges
Create Date: 2025-02-07

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy import inspect

revision = "004_prep"
down_revision = "003_badges"
branch_labels = None
depends_on = None


def upgrade() -> None:
    conn = op.get_bind()
    if "prep_modules" not in set(inspect(conn).get_table_names()):
        op.create_table(
            "prep_modules",
            sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
            sa.Column("title", sa.String(500), nullable=False),
            sa.Column("company", sa.String(255)),
            sa.Column("job_id", sa.Integer(), sa.ForeignKey("jobs.id")),
            sa.Column("job_title_pattern", sa.String(255)),
            sa.Column("content", sa.Text(), nullable=False),
            sa.Column("type", sa.String(50)),
            sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        )


def downgrade() -> None:
    conn = op.get_bind()
    if "prep_modules" in set(inspect(conn).get_table_names()):
        op.drop_table("prep_modules")
