"""
MongoDB database connection
"""

from motor.motor_asyncio import AsyncIOMotorClient
from pymongo import MongoClient
from typing import Optional
import os

from app.config import settings

# Async MongoDB client
mongodb_client: Optional[AsyncIOMotorClient] = None
mongodb_db = None

# Sync MongoDB client (for migrations/admin tasks)
sync_mongodb_client: Optional[MongoClient] = None
sync_mongodb_db = None


async def connect_to_mongodb():
    """Connect to MongoDB (async)"""
    global mongodb_client, mongodb_db
    try:
        mongodb_client = AsyncIOMotorClient(
            settings.MONGODB_URL,
            serverSelectionTimeoutMS=5000
        )
        mongodb_db = mongodb_client[settings.MONGODB_DB]
        # Test connection
        await mongodb_client.admin.command('ping')
        print(f"✓ Connected to MongoDB: {settings.MONGODB_DB}")
    except Exception as e:
        print(f"✗ Failed to connect to MongoDB: {e}")
        raise


def connect_to_mongodb_sync():
    """Connect to MongoDB (sync)"""
    global sync_mongodb_client, sync_mongodb_db
    try:
        sync_mongodb_client = MongoClient(
            settings.MONGODB_URL,
            serverSelectionTimeoutMS=5000
        )
        sync_mongodb_db = sync_mongodb_client[settings.MONGODB_DB]
        # Test connection
        sync_mongodb_client.admin.command('ping')
        print(f"✓ Connected to MongoDB (sync): {settings.MONGODB_DB}")
    except Exception as e:
        print(f"✗ Failed to connect to MongoDB (sync): {e}")
        raise


async def close_mongodb_connection():
    """Close MongoDB connection"""
    global mongodb_client, sync_mongodb_client
    if mongodb_client:
        mongodb_client.close()
    if sync_mongodb_client:
        sync_mongodb_client.close()


def get_mongodb():
    """Get MongoDB database instance (async)"""
    if mongodb_db is None:
        raise RuntimeError("MongoDB not connected. Call connect_to_mongodb() first.")
    return mongodb_db


def get_mongodb_sync():
    """Get MongoDB database instance (sync)"""
    if sync_mongodb_db is None:
        raise RuntimeError("MongoDB not connected. Call connect_to_mongodb_sync() first.")
    return sync_mongodb_db
