"""
Seed sample aptitude test data
Run this script to create a sample test with 10 questions.

Run from Backend folder: python aptitude/seed_aptitude_data.py
Or from aptitude folder: python seed_aptitude_data.py
"""

import sys
from pathlib import Path

# Ensure Backend is on path when run from aptitude/
_backend_dir = Path(__file__).resolve().parent.parent
if _backend_dir not in (Path(p).resolve() for p in sys.path):
    sys.path.insert(0, str(_backend_dir))

from database import SessionLocal
from aptitude.seed import seed_data

print("=" * 60)
print("Aptitude Engine - Seed Sample Data")
print("=" * 60)

db = SessionLocal()
try:
    print("Creating sample test and questions...")
    test = seed_data(db)
    print(f"\n✓ Successfully created test!")
    print(f"  Test ID: {test.id}")
    print(f"  Title: {test.title}")
    print(f"  Questions: {len(test.questions)}")
    print(f"  Duration: {test.duration_minutes} minutes")
    print(f"\nYou can now start testing the API!")
    print(f"  Start test: POST /aptitude/tests/{test.id}/start")
except Exception as e:
    print(f"\n✗ Error seeding data: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)
finally:
    db.close()

print("=" * 60)
