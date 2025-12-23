from typing import List

from src.users.domain.entities import User
from src.users.presentation.dependencies import UserUoWDep


async def collect_users(uow: UserUoWDep) -> List[User]:
    async with uow:
        users = await uow.users.get_all()

    return users