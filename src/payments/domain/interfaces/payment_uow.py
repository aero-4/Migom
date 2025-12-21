import abc

from src.payments.domain.interfaces.payment_repo import IPaymentRepository


class IPaymentUnitOfWork(abc.ABC):
    payments: IPaymentRepository

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
