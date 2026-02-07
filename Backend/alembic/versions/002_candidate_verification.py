"""Add Candidate verification fields

Revision ID: 002_verify
Revises: 001_tpo
Create Date: 2025-02-07

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = "002_verify"
down_revision = "001_tpo"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("candidates", sa.Column("is_verified", sa.Boolean(), nullable=False, server_default="false"))
    op.add_column("candidates", sa.Column("verified_at", sa.DateTime(timezone=True), nullable=True))
    op.add_column("candidates", sa.Column("verified_by", sa.Integer(), nullable=True))
    op.create_foreign_key("fk_candidates_verified_by", "candidates", "users", ["verified_by"], ["id"])


def downgrade() -> None:
    op.drop_constraint("fk_candidates_verified_by", "candidates", type_="foreignkey")
    op.drop_column("candidates", "verified_by")
    op.drop_column("candidates", "verified_at")
    op.drop_column("candidates", "is_verified")
