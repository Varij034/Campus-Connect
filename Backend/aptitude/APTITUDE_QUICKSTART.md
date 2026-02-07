# Aptitude Engine - Quick Start Guide

## 🚀 Quick Setup (5 Steps)

### Step 1: Install Dependencies
```bash
cd Backend
pip install sqlalchemy
```
Or install all requirements:
```bash
pip install -r requirements.txt
```

### Step 2: Create Database Tables
```bash
python aptitude/setup_aptitude_db.py
```
This creates the 4 required tables in the database.

### Step 3: Seed Sample Data
```bash
python aptitude/seed_aptitude_data.py
```
This creates a sample test with 10 questions (Test ID: 1).

### Step 4: Start the Server
```bash
python start_server.py
```
Or:
```bash
python main.py
```

### Step 5: Test the API

**Option A: Swagger UI (Recommended)**
- Open: http://localhost:8000/docs
- Navigate to "Aptitude Engine" section
- Try the endpoints!

**Option B: Test Script**
```bash
python aptitude/test_aptitude.py
```
Or from the aptitude folder:
```bash
cd aptitude
python test_aptitude.py
```

**Option C: Manual Testing**
```bash
# Start a test
curl -X POST "http://localhost:8000/aptitude/tests/1/start"

# Get leaderboard
curl "http://localhost:8000/aptitude/tests/1/leaderboard"
```

## 📋 Where Things Live

- **Backend/** (shared)
  - `database.py` – Database configuration (used by the whole app, not just aptitude)
- **Backend/aptitude/** (aptitude module only)
  - `setup_aptitude_db.py` – Creates aptitude database tables
  - `seed_aptitude_data.py` – Adds sample test data
  - `test_aptitude.py` – Automated API tests

## ✅ Verification Checklist

- [ ] SQLAlchemy installed (`pip install sqlalchemy`)
- [ ] Database tables created (`python aptitude/setup_aptitude_db.py`)
- [ ] Sample data seeded (`python aptitude/seed_aptitude_data.py`)
- [ ] Server running (`python start_server.py`)
- [ ] Can access Swagger UI at http://localhost:8000/docs
- [ ] "Aptitude Engine" section visible in Swagger

## 🐛 Troubleshooting

**"ModuleNotFoundError: No module named 'sqlalchemy'"**
- Run: `pip install sqlalchemy`

**"Database connection not configured"**
- Make sure `database.py` exists in the **Backend** folder (it stays there; it’s shared).

**"Test has no questions"**
- Run: `python aptitude/seed_aptitude_data.py`

**"Could not connect to server"**
- Make sure server is running: `python start_server.py`

**Import errors**
- Run scripts from the **Backend** directory (e.g. `python aptitude/setup_aptitude_db.py`), or from inside `aptitude` (e.g. `cd aptitude` then `python setup_aptitude_db.py`).

## 📚 Next Steps

- Read `aptitude/README.md` for full documentation
- Read `aptitude/INTEGRATION.md` for integration details
- Customize questions in `aptitude/seed.py`
- Add more tests via API or database

## 🎯 API Endpoints

1. `POST /aptitude/tests/{test_id}/start` - Start a test
2. `POST /aptitude/tests/{test_id}/submit` - Submit answers
3. `GET /aptitude/tests/{test_id}/leaderboard` - View leaderboard
4. `GET /aptitude/tests/{test_id}/my-rank` - Get your rank

All endpoints are documented in Swagger UI: http://localhost:8000/docs
