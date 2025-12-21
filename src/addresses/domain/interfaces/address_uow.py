import abc

from src.addresses.domain.interfaces.address_repo import IAddressRepository


class IAddressUnitOfWork(abc.ABC):

    addresses: IAddressRepository

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

