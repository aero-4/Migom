import abc
from typing import List
from uuid import UUID

from src.categories.domain.entities import CategoryCreate, CategoryUpdate, Category


class ICategoryRepository(abc.ABC):

    @abc.abstractmethod
    async def add(self, category: CategoryCreate) -> Category:
        ...

    @abc.abstractmethod
    async def get_all(self) -> List[Category]:
        ...

    @abc.abstractmethod
    async def get_one(self, id: int) -> Category:
        ...

    @abc.abstractmethod
    async def delete(self, id: int) -> Category:
        ...

    @abc.abstractmethod
    async def update(self, category: CategoryUpdate) -> Category:
        ...
