import abc

from src.auth.domain.entities import TokenData


class ITokenProvider(abc.ABC):

    def create_access_token(self, data: dict) -> str: ...

    def create_refresh_token(self, data: dict) -> str: ...

    def read_token(self, token: str) -> TokenData | None: ...
