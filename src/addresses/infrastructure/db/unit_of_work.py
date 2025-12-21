from sqlalchemy.ext.asyncio import AsyncSession

from src.addresses.domain.interfaces.address_uow import IAddressUnitOfWork
from src.addresses.infrastructure.db.repositories import PGAddressRepository
from src.db.engine import async_session_maker


class AddressUnitOfWork(IAddressUnitOfWork):

    def __init__(self, session_factory=async_session_maker):
        self.session_factory = session_factory

    async def __aenter__(self):
        self.session: AsyncSession = self.session_factory()
        self.addresses = PGAddressRepository(self.session)

        return await super().__aenter__()

    async def __aexit__(self, *args):
        await super().__aexit__(*args)
        await self.session.close()

    async def _commit(self):
        await self.session.commit()

    async def rollback(self):
        await self.session.rollback()
