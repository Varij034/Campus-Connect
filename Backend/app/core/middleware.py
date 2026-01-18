"""
Middleware for CORS, logging, and error handling
"""

from fastapi import Request, status
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.base import BaseHTTPMiddleware
import time
import logging

from app.config import settings
from app.database.postgres import SessionLocal
from app.models.postgres_models import Log

logger = logging.getLogger(__name__)


def setup_cors(app):
    """Setup CORS middleware"""
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.CORS_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )


class LoggingMiddleware(BaseHTTPMiddleware):
    """Middleware for request logging"""
    
    async def dispatch(self, request: Request, call_next):
        start_time = time.time()
        
        # Process request
        response = await call_next(request)
        
        # Calculate processing time
        process_time = time.time() - start_time
        
        # Log request
        logger.info(
            f"{request.method} {request.url.path} - "
            f"Status: {response.status_code} - "
            f"Time: {process_time:.3f}s"
        )
        
        # Add processing time header
        response.headers["X-Process-Time"] = str(process_time)
        
        return response


class DatabaseLoggingMiddleware(BaseHTTPMiddleware):
    """Middleware for logging requests to database"""
    
    async def dispatch(self, request: Request, call_next):
        # Skip logging for health checks and static files
        if request.url.path in ["/health", "/docs", "/redoc", "/openapi.json", "/"]:
            return await call_next(request)
        
        db = SessionLocal()
        try:
            # Get user ID from token if available
            user_id = None
            if "authorization" in request.headers:
                try:
                    from app.core.security import get_user_from_token
                    token = request.headers["authorization"].replace("Bearer ", "")
                    user_data = get_user_from_token(token)
                    if user_data:
                        user_id = user_data.get("user_id")
                except:
                    pass
            
            # Process request
            response = await call_next(request)
            
            # Log to database (only if successful)
            try:
                log_entry = Log(
                    user_id=user_id,
                    action=f"{request.method} {request.url.path}",
                    endpoint=request.url.path,
                    method=request.method,
                    ip_address=request.client.host if request.client else None,
                    user_agent=request.headers.get("user-agent"),
                    log_metadata={
                        "status_code": response.status_code,
                        "query_params": dict(request.query_params)
                    }
                )
                db.add(log_entry)
                db.commit()
            except Exception as log_error:
                logger.warning(f"Failed to log to database: {log_error}")
                db.rollback()
            
            return response
        except Exception as e:
            logger.error(f"Error in database logging middleware: {e}")
            return await call_next(request)
        finally:
            db.close()


def setup_middleware(app):
    """Setup all middleware"""
    setup_cors(app)
    app.add_middleware(LoggingMiddleware)
    # Uncomment to enable database logging (can be resource intensive)
    # app.add_middleware(DatabaseLoggingMiddleware)
