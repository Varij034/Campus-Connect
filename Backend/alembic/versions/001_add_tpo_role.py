"""Add TPO to UserRole enum

Revision ID: 001_tpo
Revises:
Create Date: 2025-02-07

"""
from alembic import op

# revision identifiers, used by Alembic.
revision = "001_tpo"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # PostgreSQL: add new value to existing enum
    op.execute("ALTER TYPE userrole ADD VALUE IF NOT EXISTS 'tpo'")


def downgrade() -> None:
    # PostgreSQL does not support removing enum values easily; leave enum as-is
    pass
