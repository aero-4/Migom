from typing import Annotated

from fastapi import Depends
from starlette.requests import Request
from starlette.responses import Response

from src.auth.config import auth_settings
from src.auth.domain.entities import TokenType
from src.auth.domain.interfaces.token_auth import ITokenAuth
from src.auth.domain.interfaces.token_storage import ITokenStorage
from src.auth.infrastructure.services.jwt_provider import JWTAuth, JWTProvider
from src.users.domain.interfaces.password_hasher import IPasswordHasher
from src.users.infrastructure.services.password_hasher import BcryptPasswordHasher
from src.auth.infrastructure.services.redis_storage import RedisTokenStorage
from src.auth.infrastructure.transports.cookie import CookieTransport
from src.auth.infrastructure.transports.header import HeaderTransport


def get_password_hasher() -> IPasswordHasher:
    return BcryptPasswordHasher()


def get_token_storage() -> ITokenStorage:
    return RedisTokenStorage()


def get_token_auth(request: Request = None, response: Response = None) -> JWTAuth:
    jwt_provider = JWTProvider()

    access_transports = []
    refresh_transports = []

    if auth_settings.JWT_METHOD in ['cookie', 'all']:
        access_transports.append(
            CookieTransport(cookie_name="access_token", cookie_max_age=auth_settings.ACCESS_TOKEN_EXPIRE_SECONDS)
        )
        refresh_transports.append(
            CookieTransport(cookie_name="refresh_token", cookie_max_age=auth_settings.REFRESH_TOKEN_EXPIRE_SECONDS)
        )

    if auth_settings.JWT_METHOD in ['header', 'all']:
        access_transports.append(HeaderTransport(auth_settings.JWT_ACCESS_HEADER_NAME, auth_settings.JWT_HEADER_TYPE))
        refresh_transports.append(HeaderTransport(auth_settings.JWT_REFRESH_HEADER_NAME, auth_settings.JWT_HEADER_TYPE))

    transports = {
        TokenType.ACCESS: access_transports,
        TokenType.REFRESH: refresh_transports
    }

    return JWTAuth(jwt_provider, transports, get_token_storage(), request=request, response=response)


TokenAuthDep = Annotated[ITokenAuth, Depends(get_token_auth)]
TokenStorageDep = Annotated[ITokenStorage, Depends(get_token_storage)]
PasswordHasherDep = Annotated[IPasswordHasher, Depends(get_password_hasher)]
