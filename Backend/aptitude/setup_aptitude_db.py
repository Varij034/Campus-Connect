"""
Setup script to create aptitude database tables
Run this script once to initialize the database tables.

Run from Backend folder: python aptitude/setup_aptitude_db.py
Or from aptitude folder: python setup_aptitude_db.py
"""

import sys
from pathlib import Path

# Ensure Backend is on path when run from aptitude/
_backend_dir = Path(__file__).resolve().parent.parent
if _backend_dir not in (Path(p).resolve() for p in sys.path):
    sys.path.insert(0, str(_backend_dir))

from sqlalchemy import create_engine
from aptitude.models import Base
import os

# Use same database URL as database.py
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./campus_connect.db")

print("=" * 60)
print("Aptitude Engine - Database Setup")
print("=" * 60)

# Create engine
if DATABASE_URL.startswith("sqlite"):
    engine = create_engine(
        DATABASE_URL,
        connect_args={"check_same_thread": False}
    )
else:
    engine = create_engine(DATABASE_URL)

try:
    # Create all tables
    print("Creating database tables...")
    Base.metadata.create_all(bind=engine)
    print("✓ Database tables created successfully!")
    print("\nCreated tables:")
    print("  - aptitude_tests")
    print("  - aptitude_questions")
    print("  - aptitude_attempts")
    print("  - aptitude_responses")
    print("\nNext step: Run 'python aptitude/seed_aptitude_data.py' to add sample data")
except Exception as e:
    print(f"✗ Error creating tables: {e}")
    raise

print("=" * 60)
