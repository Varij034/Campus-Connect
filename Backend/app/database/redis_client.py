"""
Redis cache connection
"""

import redis.asyncio as aioredis
import redis
from typing import Optional
from app.config import settings

# Async Redis client
redis_client: Optional[aioredis.Redis] = None

# Sync Redis client
sync_redis_client: Optional[redis.Redis] = None


async def connect_to_redis():
    """Connect to Redis (async)"""
    global redis_client
    try:
        redis_client = await aioredis.from_url(
            settings.REDIS_URL,
            encoding="utf-8",
            decode_responses=True,
            socket_connect_timeout=5
        )
        # Test connection
        await redis_client.ping()
        print(f"✓ Connected to Redis: {settings.REDIS_HOST}:{settings.REDIS_PORT}")
    except Exception as e:
        print(f"✗ Failed to connect to Redis: {e}")
        raise


def connect_to_redis_sync():
    """Connect to Redis (sync)"""
    global sync_redis_client
    try:
        sync_redis_client = redis.from_url(
            settings.REDIS_URL,
            encoding="utf-8",
            decode_responses=True,
            socket_connect_timeout=5
        )
        # Test connection
        sync_redis_client.ping()
        print(f"✓ Connected to Redis (sync): {settings.REDIS_HOST}:{settings.REDIS_PORT}")
    except Exception as e:
        print(f"✗ Failed to connect to Redis (sync): {e}")
        raise


async def close_redis_connection():
    """Close Redis connection"""
    global redis_client
    if redis_client:
        await redis_client.close()


def get_redis() -> aioredis.Redis:
    """Get Redis client instance (async)"""
    if redis_client is None:
        raise RuntimeError("Redis not connected. Call connect_to_redis() first.")
    return redis_client


def get_redis_sync() -> redis.Redis:
    """Get Redis client instance (sync)"""
    if sync_redis_client is None:
        raise RuntimeError("Redis not connected. Call connect_to_redis_sync() first.")
    return sync_redis_client
