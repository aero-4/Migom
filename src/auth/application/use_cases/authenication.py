import datetime

from src.auth.domain.interfaces.token_auth import ITokenAuth
from src.users.domain.entities import UserCreate, User
from src.users.domain.exceptions import InvalidCredentials
from src.users.domain.interfaces.password_hasher import IPasswordHasher
from src.users.domain.interfaces.user_uow import IUserUnitOfWork


async def authenticate(email: str, password: str, pwd_hasher: IPasswordHasher, uow: IUserUnitOfWork, auth: ITokenAuth) -> User:
    async with uow:
        user = await uow.users.get_by_email(email)

        if not pwd_hasher.verify(password, user.hashed_password):
            raise InvalidCredentials()

        await auth.set_tokens(user)
    return user



