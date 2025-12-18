import datetime
import enum

from src.core.domain.entities import CustomModel


class TokenType(enum.StrEnum):
    ACCESS = "access"
    REFRESH = "refresh"


class TokenData(CustomModel):
    user_id: int
    aud: str | None = None
    iss: str | None = None
    jti: str | None = None
    exp: datetime.datetime


class AnonymousUser(CustomModel):
    id: str = None
    first_name: str | None = None
    last_name: str | None = None
    birthday: datetime.date | None = None
    email: str | None = None
    role: int | None = None
