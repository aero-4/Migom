from src.auth.presentation.dependencies import TokenAuthDep, PasswordHasherDep
from src.users.domain.entities import User, UserUpdate
from src.users.presentation.dependencies import UserUoWDep
from src.users.presentation.dtos import UserUpdateDTO


async def update_user(id: int,
                      user_data: UserUpdateDTO,
                      uow: UserUoWDep) -> User:
    user_update = UserUpdate(id=id, **user_data.model_dump())
    async with uow:
        user = await uow.users.update(user_update)
        await uow.commit()

    return user
