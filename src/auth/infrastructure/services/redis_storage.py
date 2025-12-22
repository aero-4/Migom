from src.auth.domain.entities import TokenData
from src.auth.domain.interfaces.token_storage import ITokenStorage
from src.core.infrastructure.redis import get_redis_client
from src.utils.datetimes import get_timezone_now


class RedisTokenStorage(ITokenStorage):

    def __init__(self):
        self.redis = get_redis_client()

    async def store_token(self, token_data: TokenData) -> None:
        key = f"tokens:{token_data.jti}"
        ttl = int(
            (token_data.exp - get_timezone_now()).total_seconds()
        )

        await self.redis.setex(key, time=ttl, value=token_data.user_id)
        await self.redis.sadd(f"user_tokens:{token_data.user_id}", token_data.jti)

    async def is_token_active(self, jti: str) -> bool:
        return await self.redis.exists(f"tokens:{jti}") == 1


    async def revoke_tokens_by_user(self, user_id: str) -> None:
        token_keys = await self.redis.smembers(f"user_tokens:{user_id}")
        for jti in token_keys:
            await self.redis.delete(f"tokens:{jti}")
        await self.redis.delete(f"user_tokens:{user_id}")
