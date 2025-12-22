import abc

from src.auth.domain.entities import TokenData


class ITokenStorage(abc.ABC):

    @abc.abstractmethod
    async def store_token(self, token_data: TokenData) -> None: ...

    @abc.abstractmethod
    async def is_token_active(self, jti: str) -> bool: ...


    @abc.abstractmethod
    async def revoke_tokens_by_user(self, user_id: str) -> None: ...