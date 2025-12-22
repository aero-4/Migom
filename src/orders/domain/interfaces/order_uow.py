import abc

from src.orders.domain.interfaces.order_repo import IOrderRepository


class IOrderUnitOfWork(abc.ABC):
    orders: IOrderRepository

    async def __aenter__(self):
        return self

    async def __aexit__(self, *args):
        await self.rollback()

    async def commit(self):
        await self._commit()

    @abc.abstractmethod
    async def _commit(self):
        ...

    @abc.abstractmethod
    async def rollback(self):
        ...
