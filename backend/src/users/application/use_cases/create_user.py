from src.auth.presentation.dependencies import TokenAuthDep, PasswordHasherDep
from src.users.domain.entities import User, UserCreate
from src.users.presentation.dependencies import UserUoWDep
from src.users.presentation.dtos import UserCreateDTO


async def create_user(user_data: UserCreateDTO, pwd: PasswordHasherDep, uow: UserUoWDep, auth: TokenAuthDep) -> User:
    user_create = UserCreate(email=user_data.email, hashed_password=pwd.hash(user_data.password), first_name=user_data.first_name, last_name=user_data.last_name, birthday=user_data.birthday, role=user_data.role)
    async with uow:
        new_user = await uow.users.add(user_create)
        await uow.commit()
    return new_user
