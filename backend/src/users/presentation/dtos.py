import datetime

from pydantic import Field

from src.core.domain.entities import CustomModel


class UserCreateDTO(CustomModel):
    email: str
    password: str
    first_name: str
    last_name: str
    birthday: datetime.date
    is_super_user: bool | None = False


class UserPasswordUpdateDTO(CustomModel):
    password: str = Field(min_length=8, max_length=32)
    new_password: str = Field(min_length=8, max_length=32)


class UserUpdateDTO(CustomModel):
    email: str | None = None
    password: str | None = None
    first_name: str | None = None
    last_name: str | None = None
    birthday: datetime.date | None = None
    is_super_user: bool | None = False
    role: str | None = None
