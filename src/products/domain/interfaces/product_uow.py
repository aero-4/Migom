import abc

from sqlalchemy.ext.asyncio import AsyncSession

from src.db.engine import async_session_maker
from src.products.domain.interfaces.product_repo import IProductRepository


class IProductUnitOfWork(abc.ABC):
    products: IProductRepository

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
