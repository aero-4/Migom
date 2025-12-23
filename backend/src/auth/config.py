from functools import cached_property
from typing import Literal
from pydantic import SecretStr
from pydantic_settings import BaseSettings


class AuthSettings(BaseSettings):
    """
    Settings for the auth module.
    """

    JWT_ALGORITHM: str = "ES256"
    JWT_PRIVATE_KEY_PATH: str = "secrets/ec_private.pem"
    JWT_PUBLIC_KEY_PATH: str = "secrets/ec_public.pem"

    ACCESS_TOKEN_EXPIRE_SECONDS: int = 60 * 15
    REFRESH_TOKEN_EXPIRE_SECONDS: int = 60 * 60 * 24 * 30
    SECURE_COOKIES: bool = True
    JWT_METHOD: Literal["cookies", "headers", "all"] = "all"
    JWT_ISSUER: str = "auth-service"
    JWT_HEADER_TYPE: str = "Bearer"
    JWT_ACCESS_HEADER_NAME: str = "Authorization"
    JWT_REFRESH_HEADER_NAME: str = "X-Refresh-Token"

    @cached_property
    def JWT_PRIVATE_KEY(self) -> SecretStr:
        with open(self.JWT_PRIVATE_KEY_PATH) as f:
            return SecretStr(f.read())

    @cached_property
    def JWT_PUBLIC_KEY(self) -> SecretStr:
        with open(self.JWT_PUBLIC_KEY_PATH) as f:
            return SecretStr(f.read())


auth_settings = AuthSettings()