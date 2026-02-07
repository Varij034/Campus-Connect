"""Add Candidate verification fields

Revision ID: 002_verify
Revises: 001_tpo
Create Date: 2025-02-07

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy import inspect

# revision identifiers, used by Alembic.
revision = "002_verify"
down_revision = "001_tpo"
branch_labels = None
depends_on = None


def _candidates_columns(conn):
    inspector = inspect(conn)
    return {c["name"] for c in inspector.get_columns("candidates")}


def upgrade() -> None:
    conn = op.get_bind()
    existing = _candidates_columns(conn)
    if "is_verified" not in existing:
        op.add_column("candidates", sa.Column("is_verified", sa.Boolean(), nullable=False, server_default="false"))
    if "verified_at" not in existing:
        op.add_column("candidates", sa.Column("verified_at", sa.DateTime(timezone=True), nullable=True))
    if "verified_by" not in existing:
        op.add_column("candidates", sa.Column("verified_by", sa.Integer(), nullable=True))
    # Only create FK if not already present
    inspector = inspect(conn)
    fks = inspector.get_foreign_keys("candidates")
    if not any(fk.get("name") == "fk_candidates_verified_by" for fk in fks):
        op.create_foreign_key("fk_candidates_verified_by", "candidates", "users", ["verified_by"], ["id"])


def downgrade() -> None:
    conn = op.get_bind()
    inspector = inspect(conn)
    existing = _candidates_columns(conn)
    fks = inspector.get_foreign_keys("candidates")
    if any(fk.get("name") == "fk_candidates_verified_by" for fk in fks):
        op.drop_constraint("fk_candidates_verified_by", "candidates", type_="foreignkey")
    for col in ("verified_by", "verified_at", "is_verified"):
        if col in existing:
            op.drop_column("candidates", col)
