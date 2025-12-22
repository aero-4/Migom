import datetime

from pydantic import EmailStr, Field

from src.core.domain.entities import CustomModel


class AuthUserDTO(CustomModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=32)


class RegisterUserDTO(CustomModel):
    first_name: str
    last_name: str
    email: EmailStr
    password: str = Field(min_length=8, max_length=32)
    birthday: datetime.date | None = None
    role: int | None = None


