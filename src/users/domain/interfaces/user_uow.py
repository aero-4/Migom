import abc

from src.users.domain.interfaces.user_repo import IUserRepository


class IUserUnitOfWork(abc.ABC):
    users: IUserRepository

    async def __aenter__(self):
        return self

    async def __aexit__(self, *args):
        await self.rollback()

    async def commit(self):
        await self._commit()

    @abc.abstractmethod
    async def rollback(self):
        pass

    @abc.abstractmethod
    async def _commit(self):
        pass
