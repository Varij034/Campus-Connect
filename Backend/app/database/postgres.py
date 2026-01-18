"""
PostgreSQL database connection and session management
"""

from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from typing import Generator, AsyncGenerator

from app.config import settings

# Sync engine and session
engine = create_engine(
    settings.DATABASE_URL,
    pool_pre_ping=True,
    pool_size=10,
    max_overflow=20,
    echo=settings.ENVIRONMENT == "development"
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Async engine and session
async_engine = create_async_engine(
    settings.DATABASE_URL_ASYNC,
    pool_pre_ping=True,
    pool_size=10,
    max_overflow=20,
    echo=settings.ENVIRONMENT == "development"
)

AsyncSessionLocal = async_sessionmaker(
    async_engine,
    class_=AsyncSession,
    expire_on_commit=False
)

# Base class for models
Base = declarative_base()


def get_db() -> Generator[Session, None, None]:
    """
    Dependency for getting database session (sync)
    Use this for sync operations
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


async def get_async_db() -> AsyncGenerator[AsyncSession, None]:
    """
    Dependency for getting async database session
    Use this for async operations
    """
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()
