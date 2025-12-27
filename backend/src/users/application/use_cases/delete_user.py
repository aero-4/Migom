from src.users.presentation.dependencies import UserUoWDep


async def delete_user(id: int, uow: UserUoWDep) -> None:
    async with uow:
        await uow.users.delete(id)
        await uow.commit()
    return None