# app/infrastructure/cache.py

import redis
from typing import Optional, Any
import json
import logging
from datetime import timedelta

from app.core.config import settings

logger = logging.getLogger(__name__)

class CacheService:
    """Redis cache service (optional - falls back to no caching if Redis not available)"""
    
    def __init__(self):
        self.redis_client = None
        self._initialize_redis()
    
    def _initialize_redis(self):
        """Initialize Redis connection if available"""
        if settings.REDIS_URL:
            try:
                self.redis_client = redis.from_url(settings.REDIS_URL)
                # Test connection
                self.redis_client.ping()
                logger.info("Redis cache service initialized")
            except Exception as e:
                logger.warning(f"Redis not available, caching disabled: {e}")
                self.redis_client = None
        else:
            logger.info("No Redis URL configured, caching disabled")
    
    def set(self, key: str, value: Any, expire: Optional[timedelta] = None) -> bool:
        """Set a value in cache"""
        if not self.redis_client:
            return False
        
        try:
            # Serialize value to JSON
            serialized_value = json.dumps(value, default=str)
            
            if expire:
                return self.redis_client.setex(
                    key, 
                    int(expire.total_seconds()), 
                    serialized_value
                )
            else:
                return self.redis_client.set(key, serialized_value)
                
        except Exception as e:
            logger.error(f"Cache set error: {e}")
            return False
    
    def get(self, key: str) -> Optional[Any]:
        """Get a value from cache"""
        if not self.redis_client:
            return None
        
        try:
            value = self.redis_client.get(key)
            if value:
                return json.loads(value.decode('utf-8'))
            return None
            
        except Exception as e:
            logger.error(f"Cache get error: {e}")
            return None
    
    def delete(self, key: str) -> bool:
        """Delete a key from cache"""
        if not self.redis_client:
            return False
        
        try:
            return bool(self.redis_client.delete(key))
        except Exception as e:
            logger.error(f"Cache delete error: {e}")
            return False
    
    def exists(self, key: str) -> bool:
        """Check if key exists in cache"""
        if not self.redis_client:
            return False
        
        try:
            return bool(self.redis_client.exists(key))
        except Exception as e:
            logger.error(f"Cache exists error: {e}")
            return False

# Global cache service instance
cache_service = CacheService()