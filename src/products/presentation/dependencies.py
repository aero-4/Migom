from typing import Annotated

from fastapi import Depends

from src.products.domain.interfaces.product_uow import IProductUnitOfWork
from src.products.infrasctructure.db.unit_of_work import PGProductUnitOfWork


async def get_product_uow() -> PGProductUnitOfWork:
    return PGProductUnitOfWork()


ProductUoWDep = Annotated[IProductUnitOfWork, Depends(get_product_uow)]