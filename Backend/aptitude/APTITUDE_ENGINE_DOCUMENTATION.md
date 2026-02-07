# Aptitude Engine – Team Documentation

**Campus Connect – Aptitude Test Module**  
**Version:** 1.0  
**Purpose:** Detailed documentation for integration, usage, and handoff to the team.

---

## Table of Contents

1. [Overview](#1-overview)
2. [What It Does](#2-what-it-does)
3. [Features](#3-features)
4. [Architecture](#4-architecture)
5. [Setup & Run](#5-setup--run)
6. [API Reference](#6-api-reference)
7. [User Flows](#7-user-flows)
8. [Integration Guide for Teammates](#8-integration-guide-for-teammates)
9. [Testing](#9-testing)
10. [Ready to Push / Handoff Checklist](#10-ready-to-push--handoff-checklist)

---

## 1. Overview

The **Aptitude Engine** is a plug-in backend module for **Campus Connect** that lets **students** take timed aptitude tests, get instant scores, and see their rank on a leaderboard. It is designed to be self-contained and to plug into the existing FastAPI app without changing existing auth, database, or routers.

- **Audience:** Students (test-takers).
- **Scope:** Create tests, attempt tests, submit answers, view leaderboard and own rank.
- **Stack:** FastAPI, SQLAlchemy, Pydantic; uses existing app DB and (when available) JWT auth.

---

## 2. What It Does

| Capability | Description |
|------------|-------------|
| **Tests** | Each test has a title, description, duration (minutes), and a fixed set of questions. |
| **Questions** | Multiple-choice (A/B/C/D), one correct option, optional difficulty (easy/medium/hard). |
| **Attempts** | One student can have one active attempt per test; starting a test creates an attempt and returns randomized questions. |
| **Scoring** | On submit, answers are auto-evaluated; score = (correct / total) × 100. |
| **Leaderboard** | Per test: ranked by score (high first), then by time taken (low first). |
| **My Rank** | For the current user: rank, score, time taken, percentile, and total participants. |

---

## 3. Features

- **Start test** – Creates attempt, returns randomized questions (no correct answer exposed).
- **Submit test** – Sends list of `question_id` + `selected_option`; backend calculates score and stores responses.
- **Leaderboard** – Top N participants for a test (configurable limit).
- **My rank** – Current user’s rank, percentile, and score for a test.
- **Time tracking** – `started_at`, `submitted_at`, `time_taken` (seconds) per attempt.
- **Difficulty tagging** – Questions can be tagged easy/medium/hard (for future use, e.g. analytics).
- **Bulk insert** – All answers for a submit are inserted in one go for better performance.
- **Indexing** – `test_id`, `user_id`, and related FKs are used for efficient queries.

---

## 4. Architecture

### 4.1 Folder Layout

```
Backend/
├── database.py                    # Shared DB (engine, SessionLocal, get_db, Base)
├── main.py                        # App entry; includes aptitude router
├── APTITUDE_ENGINE_DOCUMENTATION.md   # This file
├── APTITUDE_QUICKSTART.md         # Short run/setup guide
├── APTITUDE_RUN_STEPS.md          # Step-by-step run procedure
│
└── aptitude/                      # Aptitude Engine module
    ├── __init__.py                # Exports aptitude_router
    ├── models.py                  # SQLAlchemy models (4 tables)
    ├── schemas.py                 # Pydantic request/response models
    ├── services.py                # Business logic (start, submit, leaderboard, rank)
    ├── router.py                  # FastAPI routes (prefix /aptitude)
    ├── utils.py                   # Helpers (scoring, ranking, randomization)
    ├── constants.py               # Options, difficulty levels, limits
    ├── seed.py                    # Logic to create sample test + questions
    ├── setup_aptitude_db.py       # Script: create aptitude tables
    ├── seed_aptitude_data.py      # Script: seed one sample test (10 questions)
    ├── test_aptitude.py           # Script: hit all API endpoints
    ├── README.md                  # Module-level readme
    └── INTEGRATION.md             # Integration notes
```

### 4.2 Database Tables (New Only)

All tables are **new** and **isolated**; no changes to existing user or other tables.

| Table | Purpose |
|-------|---------|
| **aptitude_tests** | Test metadata: id, title, description, duration_minutes, total_questions, created_at. |
| **aptitude_questions** | Questions: test_id (FK), question_text, option_a/b/c/d, correct_option (A/B/C/D), difficulty_level. |
| **aptitude_attempts** | One row per student per test attempt: user_id (reference to existing users), test_id, score, started_at, submitted_at, time_taken. |
| **aptitude_responses** | One row per answered question: attempt_id, question_id, selected_option, is_correct. |

- **user_id** in `aptitude_attempts` is a logical reference to your existing users table (no DB FK to avoid touching existing schema).
- Indexes on `test_id`, `user_id`, and related FKs for performance.

### 4.3 API Prefix and Tags

- All routes are under **prefix:** `/aptitude`.
- In OpenAPI/Swagger they appear under tag **"Aptitude Engine"**.

---

## 5. Setup & Run

**Assumption:** Teammate is in project root or `Backend` and has Python 3.8+.

1. **Install dependencies**  
   From `Backend`:  
   `pip install -r requirements.txt`  
   (includes `sqlalchemy>=2.0.0`.)

2. **Create aptitude tables**  
   From `Backend`:  
   `python aptitude/setup_aptitude_db.py`  
   Uses `database.py` and creates the 4 tables (e.g. in SQLite: `campus_connect.db`).

3. **Seed sample data (optional but recommended)**  
   From `Backend`:  
   `python aptitude/seed_aptitude_data.py`  
   Creates one test (e.g. ID 1) with 10 questions.

4. **Start server**  
   From `Backend`:  
   `python start_server.py`  
   (or `uvicorn main:app --reload --host 0.0.0.0 --port 8000`.)

5. **Verify**  
   Open `http://localhost:8000/docs` and use the **Aptitude Engine** section (e.g. `POST /aptitude/tests/1/start`, then `POST /aptitude/tests/1/submit` with the example body).

Detailed steps and troubleshooting: **APTITUDE_RUN_STEPS.md**.

---

## 6. API Reference

Base URL (local): `http://localhost:8000`. All aptitude endpoints: `http://localhost:8000/aptitude/...`.

### 6.1 POST `/aptitude/tests/{test_id}/start`

- **Purpose:** Start a test for the current user; creates an attempt and returns randomized questions.
- **Auth:** Required (JWT). Uses `current_user["id"]` or `current_user["user_id"]`.
- **Path:** `test_id` (int) – e.g. `1` for the seeded sample test.

**Response (200):**

```json
{
  "attempt_id": 1,
  "test": {
    "id": 1,
    "title": "General Aptitude Test - Sample",
    "description": "...",
    "duration_minutes": 30,
    "total_questions": 10,
    "created_at": "..."
  },
  "questions": [
    {
      "id": 1,
      "question_text": "...",
      "option_a": "...",
      "option_b": "...",
      "option_c": "...",
      "option_d": "...",
      "difficulty_level": "easy"
    }
  ],
  "started_at": "...",
  "duration_minutes": 30
}
```

- Use the **`id`** of each object in `questions` as `question_id` when submitting.

---

### 6.2 POST `/aptitude/tests/{test_id}/submit`

- **Purpose:** Submit answers for the current user’s active attempt; compute score and store responses.
- **Auth:** Required.
- **Body:**

```json
{
  "answers": [
    { "question_id": 1, "selected_option": "A" },
    { "question_id": 2, "selected_option": "B" }
  ]
}
```

- **Rules:**  
  - `question_id` must match IDs from the `/start` response.  
  - `selected_option` must be one of `"A"`, `"B"`, `"C"`, `"D"` (case-insensitive).

**Response (200):**

```json
{
  "attempt_id": 1,
  "score": 70.0,
  "total_questions": 10,
  "correct_answers": 7,
  "time_taken": 120,
  "submitted_at": "..."
}
```

- **422** – Invalid body or validation (e.g. wrong option, missing/invalid fields).

---

### 6.3 GET `/aptitude/tests/{test_id}/leaderboard`

- **Purpose:** Get top participants for a test.
- **Auth:** Not required (public).
- **Query:** `limit` (optional, default 100).

**Response (200):**

```json
{
  "test_id": 1,
  "test_title": "General Aptitude Test - Sample",
  "entries": [
    {
      "rank": 1,
      "user_id": 1,
      "score": 90.0,
      "time_taken": 100,
      "submitted_at": "..."
    }
  ],
  "total_participants": 5
}
```

- Sorted by **score descending**, then **time_taken ascending**.

---

### 6.4 GET `/aptitude/tests/{test_id}/my-rank`

- **Purpose:** Get the current user’s rank and stats for a test.
- **Auth:** Required.

**Response (200):**

```json
{
  "test_id": 1,
  "test_title": "General Aptitude Test - Sample",
  "user_id": 1,
  "rank": 2,
  "score": 80.0,
  "time_taken": 150,
  "percentile": 60.0,
  "total_participants": 5,
  "submitted_at": "..."
}
```

- If the user has not submitted that test: `rank`, `score`, `time_taken`, `percentile`, `submitted_at` can be `null`.

---

## 7. User Flows

### Flow 1: Student takes a test

1. Student opens “Aptitude” (or equivalent) in the app.
2. Frontend calls **GET** (or a list endpoint if you add one) to know available tests; for now, use a known `test_id` (e.g. `1`).
3. Student clicks “Start test”.  
   Frontend: **POST** `/aptitude/tests/1/start` with JWT.  
   Backend returns `attempt_id`, `test`, `questions`, `duration_minutes`.
4. Frontend shows questions (e.g. one per page or all at once), starts a timer if desired.
5. Student submits.  
   Frontend: **POST** `/aptitude/tests/1/submit` with body `{ "answers": [ { "question_id": <id>, "selected_option": "A"|"B"|"C"|"D" }, ... ] }` using the `id`s from step 3.
6. Backend returns score, correct_answers, time_taken.  
   Frontend shows result (e.g. “Score: 70%”, “7/10 correct”).

### Flow 2: Student sees leaderboard

1. Frontend: **GET** `/aptitude/tests/1/leaderboard` (no auth).  
2. Display list: rank, user_id (or resolve to name if you have a users API), score, time_taken.

### Flow 3: Student sees own rank

1. Frontend: **GET** `/aptitude/tests/1/my-rank` with JWT.  
2. Display: “Your rank: #2”, “Score: 80%”, “Top 60%” (percentile), etc.

---

## 8. Integration Guide for Teammates

### 8.1 What’s Already Done

- Router registered in `main.py`:  
  `app.include_router(aptitude_router, prefix="/aptitude", tags=["Aptitude Engine"])`
- Shared **database**: `Backend/database.py` provides `get_db`, `engine`, `Base`, `SessionLocal`. Aptitude models use `Base` and the same engine.
- **Auth fallback:** If no `auth` module exists, `router.py` uses a mock `get_current_user()` returning `{"id": 1, "user_id": 1}` so the API can be tried without real JWT.

### 8.2 What Teammates Should Do

1. **Use real auth (production)**  
   - Implement or reuse JWT auth and expose a dependency, e.g. `get_current_user`, that returns a dict with **`id`** or **`user_id`** (integer).  
   - In `aptitude/router.py`, ensure the router uses that dependency (e.g. import from `auth.dependencies` or `auth`).  
   - Remove or bypass the mock `get_current_user` in production.

2. **Keep database wiring**  
   - If the app already has a `database` module with `get_db` and `Base`, aptitude will use it.  
   - If not, keep `Backend/database.py` and run `python aptitude/setup_aptitude_db.py` so aptitude tables exist on the same DB.

3. **Frontend integration**  
   - Use the four endpoints above with your API base URL.  
   - Send JWT for start, submit, and my-rank (e.g. `Authorization: Bearer <token>`).  
   - For submit, build `answers` from the question IDs returned by `/start`.

4. **Optional: list tests**  
   - Currently there is no “list all tests” endpoint; frontend can use a known `test_id` or you can add a small endpoint that returns test list from `aptitude_tests`.

5. **Optional: admin**  
   - Adding/editing tests and questions is out of scope; can be done via DB, seed scripts, or a future admin API.

### 8.3 Environment

- **DATABASE_URL** (optional): Default is `sqlite:///./campus_connect.db`. Set for PostgreSQL/MySQL etc.  
- No other env vars required for the aptitude module itself.

---

## 9. Testing

- **Swagger:** `http://localhost:8000/docs` → **Aptitude Engine** → Try each endpoint. Use `test_id=1` after seeding. For submit, use the example request body (question_id 1–10, selected_option A/B/C/D).
- **Script:** From `Backend`, run `python aptitude/test_aptitude.py` (server must be running). It runs start → submit → leaderboard → my-rank.
- **Manual:** e.g. `curl -X POST "http://localhost:8000/aptitude/tests/1/start"` and then submit with a JSON body as in the API reference.

---

## 10. Ready to Push / Handoff Checklist

Use this to confirm the module is ready to hand off and for the team to integrate.

### For the person pushing

- [ ] All code under `Backend/aptitude/` and `Backend/database.py` (if used) is committed.
- [ ] `Backend/main.py` includes the aptitude router (already done).
- [ ] `requirements.txt` includes `sqlalchemy>=2.0.0`.
- [ ] Docs are in place: this file, APTITUDE_QUICKSTART.md, APTITUDE_RUN_STEPS.md, and `aptitude/README.md`, `aptitude/INTEGRATION.md`.
- [ ] From `Backend`: `python aptitude/setup_aptitude_db.py` and `python aptitude/seed_aptitude_data.py` run without errors.
- [ ] Server starts and Swagger shows **Aptitude Engine**; start and submit (with valid body) return 200.

### For the teammate integrating

- [ ] Pull repo; install deps; run setup and seed (see [Setup & Run](#5-setup--run)).
- [ ] Replace mock auth with real JWT and ensure `get_current_user` returns `id` or `user_id`.
- [ ] Point frontend to `/aptitude/...` and implement flows in [User Flows](#7-user-flows).
- [ ] (Optional) Add a “list tests” endpoint or hardcode/test with `test_id=1`.
- [ ] (Optional) Add admin or tooling to create more tests/questions.

### Summary

- **Ready to push:** Yes, once the checklist above is satisfied.  
- **Usable by team:** Yes: run setup/seed, wire auth, call APIs from frontend.  
- **Designed for:** Drop-in use with minimal changes to existing app; no changes to existing DB tables or auth logic except wiring the same `get_db` and `get_current_user` the rest of the app uses.

---

**End of documentation.** For quick run steps, see **APTITUDE_RUN_STEPS.md**. For module-level details, see **aptitude/README.md** and **aptitude/INTEGRATION.md**.
