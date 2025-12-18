import datetime

from src.core.domain.entities import CustomModel


class User(CustomModel):
    id: int
    first_name: str
    last_name: str
    email: str
    hashed_password: str
    role: int
    birthday: datetime.date | None = None


class UserInfo(CustomModel):
    first_name: str
    last_name: str
    email: str
    birthday: datetime.date | None = None
    role: int


class UserCreate(CustomModel):
    first_name: str
    last_name: str
    email: str
    hashed_password: str
    birthday: datetime.date | None = None
    role: int | None = None


class UserUpdate(CustomModel):
    id: int
    first_name: str | None = None
    last_name: str | None = None
    birthday: datetime.date | None = None
    email: str | None = None
    hashed_password: str | None = None
    role: int | None = None

