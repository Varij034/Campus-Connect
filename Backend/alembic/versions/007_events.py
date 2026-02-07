"""Add Event and EventRegistration

Revision ID: 007_events
Revises: 006_mentorship
Create Date: 2025-02-07

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy import inspect

revision = "007_events"
down_revision = "006_mentorship"
branch_labels = None
depends_on = None


def upgrade() -> None:
    conn = op.get_bind()
    tables = set(inspect(conn).get_table_names())
    if "events" not in tables:
        op.create_table(
            "events",
            sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
            sa.Column("title", sa.String(255), nullable=False),
            sa.Column("description", sa.Text()),
            sa.Column("type", sa.String(50), nullable=False),
            sa.Column("start_date", sa.DateTime(timezone=True), nullable=False),
            sa.Column("end_date", sa.DateTime(timezone=True), nullable=False),
            sa.Column("location", sa.String(255)),
            sa.Column("registration_deadline", sa.DateTime(timezone=True)),
            sa.Column("max_participants", sa.Integer()),
            sa.Column("is_active", sa.Boolean(), server_default="true"),
            sa.Column("created_by", sa.Integer(), sa.ForeignKey("users.id")),
            sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        )
    if "event_registrations" not in tables:
        op.create_table(
            "event_registrations",
            sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
            sa.Column("event_id", sa.Integer(), sa.ForeignKey("events.id"), nullable=False),
            sa.Column("candidate_id", sa.Integer(), sa.ForeignKey("candidates.id"), nullable=False),
            sa.Column("status", sa.String(20), server_default="registered"),
            sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
            sa.UniqueConstraint("event_id", "candidate_id", name="uq_event_candidate"),
        )


def downgrade() -> None:
    conn = op.get_bind()
    tables = set(inspect(conn).get_table_names())
    if "event_registrations" in tables:
        op.drop_table("event_registrations")
    if "events" in tables:
        op.drop_table("events")
