import datetime

from src.core.domain.entities import CustomModel


class User(CustomModel):
    id: int
    first_name: str
    last_name: str
    email: str
    hashed_password: str
    is_super_user: bool
    birthday: datetime.date | None = None


class UserInfo(CustomModel):
    first_name: str
    last_name: str
    email: str
    birthday: datetime.date | None = None


class UserCreate(CustomModel):
    first_name: str
    last_name: str
    email: str
    hashed_password: str
    birthday: datetime.date | None = None
    is_super_user: bool = False


class UserUpdate(CustomModel):
    id: int
    first_name: str | None = None
    last_name: str | None = None
    birthday: datetime.date | None = None
    email: str | None = None
    hashed_password: str | None = None
    role: str | None = None

