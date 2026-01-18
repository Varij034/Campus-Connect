"""
Redis cache service wrapper
"""

from typing import Optional, Any
import json
from app.database.redis_client import get_redis


async def get_cache(key: str) -> Optional[Any]:
    """Get value from cache"""
    try:
        redis = get_redis()
        value = await redis.get(key)
        if value:
            try:
                return json.loads(value)
            except:
                return value
        return None
    except Exception as e:
        print(f"Cache get error: {e}")
        return None


async def set_cache(key: str, value: Any, expire: int = 3600):
    """Set value in cache with expiration (default 1 hour)"""
    try:
        redis = get_redis()
        if isinstance(value, (dict, list)):
            value = json.dumps(value)
        await redis.setex(key, expire, value)
    except Exception as e:
        print(f"Cache set error: {e}")


async def delete_cache(key: str):
    """Delete key from cache"""
    try:
        redis = get_redis()
        await redis.delete(key)
    except Exception as e:
        print(f"Cache delete error: {e}")


async def clear_cache_pattern(pattern: str):
    """Clear all keys matching pattern"""
    try:
        redis = get_redis()
        keys = await redis.keys(pattern)
        if keys:
            await redis.delete(*keys)
    except Exception as e:
        print(f"Cache clear error: {e}")
