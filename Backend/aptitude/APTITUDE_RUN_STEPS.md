# Step-by-Step: Run Aptitude Module Successfully

Follow these steps **in order** from the project root or Backend folder.

---

## Prerequisites

- Python 3.8 or higher installed
- Terminal/command prompt

---

## Step 1: Open terminal and go to Backend folder

```bash
cd path/to/Campus-Connect/Backend
```

Example (Windows):
```bash
cd D:\CampusConnect\Campus-Connect\Backend
```

Example (Mac/Linux):
```bash
cd /home/user/Campus-Connect/Backend
```

**Check:** You should see files like `main.py`, `database.py`, and a folder named `aptitude`.

---

## Step 2: (Optional) Create and activate a virtual environment

**Windows:**
```bash
python -m venv venv
venv\Scripts\activate
```

**Mac/Linux:**
```bash
python3 -m venv venv
source venv/bin/activate
```

*(If you prefer to use the system Python, you can skip this step.)*

---

## Step 3: Install dependencies

```bash
pip install -r requirements.txt
```

**Expected output:** Packages like `fastapi`, `uvicorn`, `sqlalchemy`, `pydantic` get installed.

**If you see "No module named 'sqlalchemy'":**
```bash
pip install sqlalchemy
```

---

## Step 4: Create the database tables

From the **Backend** folder, run:

```bash
python aptitude/setup_aptitude_db.py
```

**Expected output:**
```
============================================================
Aptitude Engine - Database Setup
============================================================
Creating database tables...
✓ Database tables created successfully!

Created tables:
  - aptitude_tests
  - aptitude_questions
  - aptitude_attempts
  - aptitude_responses

Next step: Run 'python aptitude/seed_aptitude_data.py' to add sample data
============================================================
```

**Also:** A file `campus_connect.db` will appear in the Backend folder (SQLite database).

---

## Step 5: Add sample test data (1 test, 10 questions)

Still in the **Backend** folder:

```bash
python aptitude/seed_aptitude_data.py
```

**Expected output:**
```
============================================================
Aptitude Engine - Seed Sample Data
============================================================
Creating sample test and questions...

✓ Successfully created test!
  Test ID: 1
  Title: General Aptitude Test - Sample
  Questions: 10
  Duration: 30 minutes

You can now start testing the API!
  Start test: POST /aptitude/tests/1/start
============================================================
```

**If you see "Test already exists":** That’s fine. The sample test (ID: 1) is already there.

---

## Step 6: Start the server

```bash
python start_server.py
```

**Expected output (something like):**
```
============================================================
Campus Connect AI Engine - Starting Server
============================================================
Server will run on: http://0.0.0.0:8000
API Documentation: http://0.0.0.0:8000/docs
...
```

**Leave this terminal open.** The server must keep running.

---

## Step 7: Verify the Aptitude API

### Option A: Swagger UI (easiest)

1. Open a browser.
2. Go to: **http://localhost:8000/docs**
3. Scroll to the section **"Aptitude Engine"**.
4. Try:
   - **POST /aptitude/tests/1/start** → Click "Try it out" → "Execute".  
     You should get `attempt_id`, test info, and 10 questions.
   - **GET /aptitude/tests/1/leaderboard** → "Try it out" → "Execute".  
     You should get `test_title`, `entries`, `total_participants`.

**Submitting a test (POST /aptitude/tests/1/submit):**  
Use the **Request body** that appears when you click "Try it out". It should look like:
```json
{
  "answers": [
    {"question_id": 1, "selected_option": "A"},
    {"question_id": 2, "selected_option": "B"},
    {"question_id": 3, "selected_option": "C"},
    {"question_id": 4, "selected_option": "D"},
    {"question_id": 5, "selected_option": "A"},
    {"question_id": 6, "selected_option": "B"},
    {"question_id": 7, "selected_option": "A"},
    {"question_id": 8, "selected_option": "C"},
    {"question_id": 9, "selected_option": "B"},
    {"question_id": 10, "selected_option": "B"}
  ]
}
```
The **question_id** values must match the `id` of each question returned from **POST /aptitude/tests/1/start**. If your start response has different IDs (e.g. 1–10), use those. **selected_option** must be one of **A**, **B**, **C**, or **D**. If you get **422 Unprocessable Entity**, check that the body is exactly in this shape and that every `selected_option` is A, B, C, or D.

If both start and submit work, the Aptitude module is running successfully.

### Option B: Automated test script

Open a **new** terminal, go to Backend, and run:

```bash
cd path/to/Campus-Connect/Backend
python aptitude/test_aptitude.py
```

Press Enter when it asks. It will call start, submit, leaderboard, and my-rank.  
If you see "✓" for each step and "All tests completed!", the module is working.

### Option C: curl (from another terminal)

```bash
# Start a test
curl -X POST "http://localhost:8000/aptitude/tests/1/start"

# Leaderboard
curl "http://localhost:8000/aptitude/tests/1/leaderboard"
```

You should get JSON responses, not connection errors.

---

## Quick reference: all commands in order

Run these from **Backend** folder, one after another:

| Step | Command |
|------|--------|
| 1 | `cd path/to/Campus-Connect/Backend` |
| 2 | *(optional)* `python -m venv venv` then `venv\Scripts\activate` (Windows) or `source venv/bin/activate` (Mac/Linux) |
| 3 | `pip install -r requirements.txt` |
| 4 | `python aptitude/setup_aptitude_db.py` |
| 5 | `python aptitude/seed_aptitude_data.py` |
| 6 | `python start_server.py` |
| 7 | Open http://localhost:8000/docs and test "Aptitude Engine" |

---

## Troubleshooting

| Problem | What to do |
|--------|------------|
| **"No module named 'database'"** | Run all commands from the **Backend** folder (where `database.py` is). |
| **"No module named 'sqlalchemy'"** | Run: `pip install sqlalchemy` |
| **"Test has no questions"** | Run Step 5 again: `python aptitude/seed_aptitude_data.py` |
| **"Database connection not configured"** | Ensure `database.py` exists in **Backend** (not inside aptitude). |
| **Browser can’t open localhost:8000** | Start the server (Step 6) and wait until you see "Uvicorn running". |
| **Port 8000 already in use** | Stop the other app using 8000, or change port in `config.py` / `start_server.py`. |

---

## Summary

1. **cd** to Backend  
2. **pip install -r requirements.txt**  
3. **python aptitude/setup_aptitude_db.py**  
4. **python aptitude/seed_aptitude_data.py**  
5. **python start_server.py**  
6. Open **http://localhost:8000/docs** and use **Aptitude Engine** endpoints  

After this, the Aptitude module is running successfully.
