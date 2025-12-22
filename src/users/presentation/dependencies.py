from typing import Annotated
from fastapi import Depends

from src.users.domain.interfaces.user_uow import IUserUnitOfWork
from src.users.infrastructure.db.unit_of_work import PGUserUnitOfWork


def get_user_uow() -> IUserUnitOfWork:
    return PGUserUnitOfWork()


UserUoWDep = Annotated[IUserUnitOfWork, Depends(get_user_uow)]