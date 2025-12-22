from typing import Annotated

from fastapi import Depends

from src.orders.domain.interfaces.order_uow import IOrderUnitOfWork
from src.orders.infrastructure.db.unit_of_work import PGOrderUnitOfWork


def get_order_uow() -> PGOrderUnitOfWork:
    return PGOrderUnitOfWork()


OrderUoWDeps = Annotated[IOrderUnitOfWork, Depends(get_order_uow)]
