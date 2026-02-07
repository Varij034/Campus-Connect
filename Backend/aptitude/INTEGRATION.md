# Aptitude Engine - Integration Guide

## Quick Start

### 1. Install Dependencies

Add to `requirements.txt`:
```
sqlalchemy>=2.0.0
```

Then install:
```bash
pip install sqlalchemy
```

### 2. Database Setup

The module requires a database connection. It will try to use existing database setup:

**Option A: If you have existing database module**
- Ensure `database/base.py` or `database/__init__.py` exports `Base`
- Ensure `database/dependencies.py` or `database/__init__.py` exports `get_db()`

**Option B: Standalone setup**
Create `database.py` in Backend folder:
```python
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

DATABASE_URL = "sqlite:///./campus_connect.db"  # Or your DB URL

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
```

### 3. Create Database Tables

```python
from aptitude.models import Base
from database import engine

Base.metadata.create_all(bind=engine)
```

Or with Alembic:
```bash
alembic revision --autogenerate -m "Add aptitude tables"
alembic upgrade head
```

### 4. Authentication Setup

The module requires JWT authentication. It will try to use existing auth:

**Option A: If you have existing auth module**
- Ensure `auth/dependencies.py` or `auth/__init__.py` exports `get_current_user()`
- Function should return dict with `{"id": user_id}` or `{"user_id": user_id}`

**Option B: Temporary mock (development only)**
Modify `Backend/aptitude/router.py`:
```python
def get_current_user():
    return {"id": 1}  # Mock user for testing
```

### 5. Seed Sample Data

From Backend folder:
```bash
python aptitude/seed_aptitude_data.py
```

Or in code:
```python
from aptitude.seed import seed_data
from database import get_db

db = next(get_db())
test = seed_data(db)
print(f"Test ID: {test.id}")
```

### 6. Test the API

Start server:
```bash
python start_server.py
```

Access Swagger UI:
```
http://localhost:8000/docs
```

Navigate to "Aptitude Engine" section.

## API Testing Examples

### Using curl

**Start Test:**
```bash
curl -X POST "http://localhost:8000/aptitude/tests/1/start" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Submit Test:**
```bash
curl -X POST "http://localhost:8000/aptitude/tests/1/submit" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "answers": [
      {"question_id": 1, "selected_option": "A"},
      {"question_id": 2, "selected_option": "B"}
    ]
  }'
```

**Get Leaderboard:**
```bash
curl "http://localhost:8000/aptitude/tests/1/leaderboard"
```

**Get My Rank:**
```bash
curl "http://localhost:8000/aptitude/tests/1/my-rank" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Module Structure

**Backend/** (shared, not inside aptitude):
- `database.py` – Database configuration (used by the whole app)

**Backend/aptitude/** (all aptitude-specific code):
```
Backend/aptitude/
├── __init__.py             # Exports router
├── models.py               # SQLAlchemy models (4 tables)
├── schemas.py              # Pydantic schemas
├── services.py             # Business logic
├── router.py               # API endpoints
├── utils.py                # Helper functions
├── constants.py            # Configuration
├── seed.py                 # Sample data (logic)
├── setup_aptitude_db.py    # Script: create DB tables
├── seed_aptitude_data.py   # Script: seed sample test
├── test_aptitude.py        # Script: API tests
├── README.md               # Documentation
└── INTEGRATION.md          # This file
```

## Database Tables Created

1. **aptitude_tests** - Test definitions
2. **aptitude_questions** - Questions (FK to tests)
3. **aptitude_attempts** - Student attempts (FK to tests, references users)
4. **aptitude_responses** - Individual answers (FK to attempts, questions)

## Features Implemented

✅ Start test with randomized questions
✅ Submit test with auto-scoring
✅ Leaderboard with ranking
✅ Student rank and percentile
✅ Time tracking
✅ Difficulty levels
✅ Bulk response insertion (performance)

## Notes

- Module is completely isolated
- No modifications to existing code (except router registration)
- All tables prefixed with `aptitude_` to avoid conflicts
- Works as plug-in on top of existing system
