from sqlalchemy.ext.asyncio import AsyncSession

from src.db.engine import async_session_maker
from src.orders.domain.interfaces.order_uow import IOrderUnitOfWork
from src.orders.infrastructure.db.repositories import PGOrdersRepository


class PGOrderUnitOfWork(IOrderUnitOfWork):
    def __init__(self, session_factory=async_session_maker):
        self.session_factory = session_factory

    async def __aenter__(self):
        self.session: AsyncSession = self.session_factory()
        self.orders = PGOrdersRepository(self.session)

        return await super().__aenter__()

    async def __aexit__(self, *args):
        await super().__aexit__(*args)
        await self.session.close()

    async def _commit(self):
        await self.session.commit()

    async def rollback(self):
        await self.session.rollback()
