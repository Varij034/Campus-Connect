"""
FastAPI Main Application
Campus Connect Backend API
"""

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import logging
import sys

from app.config import settings
from app.core.middleware import setup_middleware
from app.utils.logger import setup_logging
from app.utils.startup_checks import log_startup_status
from app.database.postgres import Base
from app.database.mongodb import connect_to_mongodb
from app.database.redis_client import connect_to_redis
from app.database.weaviate_client import connect_to_weaviate
from app.database.neo4j_client import connect_to_neo4j

# Setup logging first
setup_logging()
logger = logging.getLogger(__name__)

# Import API routers (after logging setup)
try:
    from app.api.v1 import auth, users, jobs, applications, student, ats, chat
except ImportError as e:
    logger.error(f"Failed to import API routers: {e}")
    raise

# Create FastAPI app
app = FastAPI(
    title=settings.APP_NAME,
    description=settings.APP_DESCRIPTION,
    version=settings.APP_VERSION,
    docs_url="/docs",
    redoc_url="/redoc"
)

# Setup middleware
setup_middleware(app)

# Include API routers
app.include_router(auth.router, prefix="/api/v1")
app.include_router(users.router, prefix="/api/v1")
app.include_router(jobs.router, prefix="/api/v1")
app.include_router(applications.router, prefix="/api/v1")
app.include_router(student.router, prefix="/api/v1")
app.include_router(ats.router, prefix="/api/v1")
app.include_router(chat.router, prefix="/api/v1")


@app.on_event("startup")
async def startup_event():
    """Initialize database connections on startup"""
    logger.info("Starting up Campus Connect API...")
    
    # Check optional component availability
    log_startup_status()
    
    # Connect to databases (non-blocking - app will start even if some fail)
    try:
        await connect_to_mongodb()
    except Exception as e:
        logger.warning(f"Failed to connect to MongoDB: {e}. Chat features may not work.")
    
    try:
        await connect_to_redis()
    except Exception as e:
        logger.warning(f"Failed to connect to Redis: {e}. Caching will be disabled.")
    
    try:
        connect_to_weaviate()
    except Exception as e:
        logger.warning(f"Failed to connect to Weaviate: {e}. Semantic search may not work.")
    
    try:
        connect_to_neo4j()
    except Exception as e:
        logger.warning(f"Failed to connect to Neo4j: {e}. Graph recommendations may not work.")
    
    logger.info("✓ Campus Connect API started successfully")
    logger.info("Note: Some features may be unavailable if dependencies are missing.")


@app.on_event("shutdown")
async def shutdown_event():
    """Close database connections on shutdown"""
    logger.info("Shutting down Campus Connect API...")
    
    from app.database.mongodb import close_mongodb_connection
    from app.database.redis_client import close_redis_connection
    from app.database.neo4j_client import close_neo4j_connection
    
    await close_mongodb_connection()
    await close_redis_connection()
    close_neo4j_connection()
    
    logger.info("✓ Campus Connect API shut down")


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "Campus Connect API",
        "version": settings.APP_VERSION,
        "docs": "/docs",
        "health": "/health"
    }


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": settings.APP_NAME,
        "version": settings.APP_VERSION
    }


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Global exception handler"""
    logger.error(f"Unhandled exception: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={
            "detail": "Internal server error",
            "message": str(exc) if settings.ENVIRONMENT == "development" else "An error occurred"
        }
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host=settings.API_HOST,
        port=settings.API_PORT,
        reload=settings.API_RELOAD
    )
