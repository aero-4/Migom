import logging

from functools import lru_cache
from redis.asyncio import Redis

from src.core.config import settings

logger = logging.getLogger(__name__)


@lru_cache
def get_redis_client() -> Redis:
    return Redis.from_url(settings.REDIS_URL, decode_responses=True)


async def check_redis_connection() -> bool:
    try:
        await get_redis_client().ping()
        logger.info("Redis is connected")
        return True
    except Exception as ex:
        logging.exception("Redis is not connected", exc_info=True)
        return False
