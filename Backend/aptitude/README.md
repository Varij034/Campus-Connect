# Aptitude Engine Module

A plug-in module for Campus Connect that provides aptitude testing functionality for students.

## Features

- ✅ Start aptitude tests with randomized questions
- ✅ Submit tests with automatic scoring
- ✅ Real-time leaderboard with ranking
- ✅ Student rank and percentile calculation
- ✅ Time tracking for each attempt
- ✅ Difficulty-based question tagging

## Module Structure

`database.py` lives in **Backend/** (shared by the whole app). All other aptitude files live in **Backend/aptitude/**:

```
aptitude/
├── __init__.py             # Module exports
├── models.py               # SQLAlchemy database models
├── schemas.py              # Pydantic request/response schemas
├── services.py             # Business logic
├── router.py               # FastAPI routes
├── utils.py                # Helper functions (scoring, ranking)
├── constants.py            # Configuration constants
├── seed.py                 # Sample data (logic)
├── setup_aptitude_db.py    # Script: create DB tables
├── seed_aptitude_data.py   # Script: seed sample test
├── test_aptitude.py        # Script: API tests
└── README.md               # This file
```

## Database Setup

This module requires SQLAlchemy and a database connection. The module tries to use existing database setup from the `database` module, but can work standalone.

### Required Dependencies

Add to `requirements.txt`:
```
sqlalchemy>=2.0.0
```

### Database Tables

The module creates 4 new tables:
1. `aptitude_tests` - Test definitions
2. `aptitude_questions` - Questions for each test
3. `aptitude_attempts` - Student test attempts
4. `aptitude_responses` - Individual question responses

### Database Migration

If using Alembic, create a migration:
```bash
alembic revision --autogenerate -m "Add aptitude engine tables"
alembic upgrade head
```

Or create tables manually:
```python
from aptitude.models import Base
from database import engine

Base.metadata.create_all(bind=engine)
```

## Authentication Setup

The module requires JWT authentication. It tries to import from existing `auth` module:

```python
# Expected in auth/dependencies.py or auth/__init__.py
def get_current_user():
    # Should decode JWT and return user dict with 'id' or 'user_id'
    return {"id": user_id, ...}
```

### Fallback Auth (Development Only)

For testing without full auth setup, you can temporarily modify `router.py`:
```python
def get_current_user():
    return {"id": 1, "user_id": 1}  # Mock user
```

## API Endpoints

### 1. Start Test
```
POST /aptitude/tests/{test_id}/start
```
- Creates a new attempt
- Returns randomized questions
- Requires authentication

### 2. Submit Test
```
POST /aptitude/tests/{test_id}/submit
```
- Body: `{"answers": [{"question_id": 1, "selected_option": "A"}, ...]}`
- Auto-calculates score
- Stores responses
- Requires authentication

### 3. Get Leaderboard
```
GET /aptitude/tests/{test_id}/leaderboard?limit=100
```
- Returns top scorers
- Sorted by score (desc) then time (asc)
- Public endpoint

### 4. Get My Rank
```
GET /aptitude/tests/{test_id}/my-rank
```
- Returns student's rank and percentile
- Requires authentication

## Seeding Sample Data

To create a sample test with 10 questions:

```python
from aptitude.seed import seed_data
from database import get_db

db = next(get_db())
test = seed_data(db)
print(f"Created test with ID: {test.id}")
```

Or run as script (after setting up database):
```bash
python -m aptitude.seed
```

## Usage Example

### Start a Test
```python
import requests

headers = {"Authorization": "Bearer <jwt_token>"}
response = requests.post(
    "http://localhost:8000/aptitude/tests/1/start",
    headers=headers
)
data = response.json()
attempt_id = data["attempt_id"]
questions = data["questions"]
```

### Submit Answers
```python
answers = [
    {"question_id": 1, "selected_option": "A"},
    {"question_id": 2, "selected_option": "B"},
    # ... more answers
]

response = requests.post(
    f"http://localhost:8000/aptitude/tests/1/submit",
    json={"answers": answers},
    headers=headers
)
result = response.json()
print(f"Score: {result['score']}%")
```

### Get Leaderboard
```python
response = requests.get(
    "http://localhost:8000/aptitude/tests/1/leaderboard"
)
leaderboard = response.json()
```

## Integration Notes

- **Database**: Module tries to import `Base` from `database.base` or `database`
- **Auth**: Module tries to import `get_current_user` from `auth.dependencies` or `auth`
- **No modifications** to existing code except router registration in `main.py`
- **Isolated tables**: All tables are prefixed with `aptitude_` to avoid conflicts

## Performance Optimizations

- Bulk insert for responses
- Indexed foreign keys (test_id, user_id)
- Efficient leaderboard queries with proper sorting
- Question randomization in memory (fast)

## Testing

### Swagger UI
Test with Swagger UI:
```
http://localhost:8000/docs
```
Navigate to "Aptitude Engine" section to see all endpoints.

### Automated Test Script
Run the test script to verify all endpoints:
```bash
# From Backend folder
python aptitude/test_aptitude.py

# Or from aptitude folder
cd aptitude
python test_aptitude.py
```

## Troubleshooting

### "Database connection not configured"
- Set up database module with `get_db()` dependency
- Or modify `router.py` to use your database setup

### "Authentication not configured"
- Set up auth module with `get_current_user()` dependency
- Or temporarily use mock auth for development

### "Test has no questions"
- Run seed function to create sample data
- Or create test and questions manually via database

## License

Part of Campus Connect project.
