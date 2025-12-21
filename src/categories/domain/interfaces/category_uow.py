import abc

from src.categories.domain.interfaces.category_repo import ICategoryRepository


class ICategoryUnitOfWork(abc.ABC):
    categories: ICategoryRepository

    async def __aenter__(self):
        return self

    async def __aexit__(self, *args):
        return await self.rollback()

    async def commit(self):
        await self._commit()

    @abc.abstractmethod
    async def rollback(self):
        pass

    @abc.abstractmethod
    async def _commit(self):
        pass
