"""
FastAPI Main Application
Campus Connect AI Engine - Complete API with Database Integration
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from datetime import datetime
from sqlalchemy import text
import os

from config import (
    APP_NAME, APP_VERSION, APP_DESCRIPTION,
    CORS_ORIGINS, UPLOAD_DIR
)
from database.postgres import engine, Base
# MongoDB client will be imported where needed to handle None case

# Import routers
from routers import auth, resume, ats, feedback, student, jobs, candidates, chat, vector, recruiter_llm, job_llm, analytics_llm, tpo, hr, badges, prep, aptitude, notifications, mentorship, events, messages

# Initialize FastAPI app
app = FastAPI(
    title=APP_NAME,
    description=APP_DESCRIPTION,
    version=APP_VERSION,
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router)
app.include_router(resume.router)
app.include_router(ats.router)
app.include_router(feedback.router)
app.include_router(student.router)
app.include_router(jobs.router)
app.include_router(candidates.router)
app.include_router(chat.router)
app.include_router(vector.router)
app.include_router(recruiter_llm.router)
app.include_router(job_llm.router)
app.include_router(analytics_llm.router)
app.include_router(tpo.router)
app.include_router(hr.router)
app.include_router(badges.router)
app.include_router(prep.router)
app.include_router(aptitude.router)
app.include_router(notifications.router)
app.include_router(mentorship.router)
app.include_router(events.router)
app.include_router(messages.router)


@app.on_event("startup")
async def startup_event():
    """Initialize database connections on startup"""
    # Create uploads directory if it doesn't exist
    if not os.path.exists(UPLOAD_DIR):
        os.makedirs(UPLOAD_DIR)
        print(f"Created {UPLOAD_DIR} directory")
    
    # Create database tables if they don't exist
    try:
        Base.metadata.create_all(bind=engine)
        print("Database tables created/verified")
    except Exception as e:
        print(f"Warning: Could not create database tables: {e}")
        print("You may need to run migrations manually: alembic upgrade head")
    
    print("="*60)
    print(f"{APP_NAME} - Starting Server")
    print("="*60)
    print("Database connections initialized")
    print("="*60)


@app.on_event("shutdown")
async def shutdown_event():
    """Close database connections on shutdown"""
    if mongo_client is not None:
        try:
            mongo_client.close()
            print("MongoDB connection closed")
        except:
            pass
    print("Shutdown complete")


@app.get("/")
async def root():
    """Root endpoint - API information"""
    return {
        "message": APP_NAME,
        "version": APP_VERSION,
        "description": APP_DESCRIPTION,
        "endpoints": {
            "auth": "/api/v1/auth/*",
            "resume": "/api/v1/resume/*",
            "ats": "/api/v1/ats/*",
            "feedback": "/api/v1/feedback/*",
            "student": "/api/v1/student/*",
            "jobs": "/api/v1/jobs/*",
            "candidates": "/api/v1/candidates/*",
            "chat": "/api/v1/chat/*",
            "docs": "/docs",
            "health": "/health"
        }
    }


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    postgres_status = "unknown"
    mongodb_status = "unknown"
    
    try:
        # Check PostgreSQL connection
        from database.postgres import SessionLocal
        from sqlalchemy import text
        db = SessionLocal()
        try:
            db.execute(text("SELECT 1"))
            postgres_status = "connected"
        except Exception as e:
            postgres_status = f"error: {str(e)[:100]}"
        finally:
            db.close()
    except Exception as e:
        postgres_status = f"error: {str(e)[:100]}"
    
    try:
        # Check MongoDB connection
        from database.mongodb import mongo_client
        if mongo_client is not None:
            mongo_client.server_info()
            mongodb_status = "connected"
        else:
            mongodb_status = "not initialized"
    except Exception as e:
        mongodb_status = f"error: {str(e)[:100]}"
    
    # Determine overall status
    if postgres_status == "connected" and mongodb_status == "connected":
        overall_status = "healthy"
    elif postgres_status == "connected" or mongodb_status == "connected":
        overall_status = "degraded"
    else:
        overall_status = "unavailable"
    
    return {
        "status": overall_status,
        "timestamp": datetime.now().isoformat(),
        "service": APP_NAME,
        "databases": {
            "postgresql": postgres_status,
            "mongodb": mongodb_status
        },
        "message": "API is running. Some features may be unavailable if databases are not connected."
    }


if __name__ == "__main__":
    import uvicorn
    from config import API_HOST, API_PORT
    
    uvicorn.run(
        "main:app",
        host=API_HOST,
        port=API_PORT,
        reload=True
    )
