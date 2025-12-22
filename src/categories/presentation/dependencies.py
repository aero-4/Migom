from typing import Annotated
from fastapi import Depends

from src.categories.domain.interfaces.category_uow import ICategoryUnitOfWork
from src.categories.infrastructure.db.unit_of_work import PGCategoryUnitOfWork


def get_category_uow() -> PGCategoryUnitOfWork:
    return PGCategoryUnitOfWork()


CategoryUoWDep = Annotated[ICategoryUnitOfWork, Depends(get_category_uow)]
