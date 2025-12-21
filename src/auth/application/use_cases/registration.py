import datetime

from src.auth.domain.interfaces.token_auth import ITokenAuth
from src.users.domain.entities import UserCreate, User
from src.users.domain.interfaces.password_hasher import IPasswordHasher
from src.users.domain.interfaces.user_uow import IUserUnitOfWork


async def registrate(email: str, password: str, first_name: str,
                     last_name: str,
                     pwd_hasher: IPasswordHasher,
                     uow: IUserUnitOfWork,
                     auth: ITokenAuth,
                     birthday: datetime.date = None,
                     role: str = None) -> User:
    async with uow:
        user_create = UserCreate(email=email, hashed_password=pwd_hasher.hash(password), first_name=first_name, last_name=last_name, birthday=birthday, role=role)
        user = await uow.users.add(user_create)
        await auth.set_tokens(user)
        await uow.commit()
    return user
