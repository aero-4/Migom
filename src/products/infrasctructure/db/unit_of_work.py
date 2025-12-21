from sqlalchemy.ext.asyncio import AsyncSession

from src.db.engine import async_session_maker
from src.products.domain.interfaces.product_uow import IProductUnitOfWork
from src.products.infrasctructure.db.repositories import PGProductsRepository


class PGProductUnitOfWork(IProductUnitOfWork):

    def __init__(self, session_factory=async_session_maker):
        self.session_factory = session_factory

    async def __aenter__(self):
        self.session: AsyncSession = self.session_factory()
        self.products = PGProductsRepository(self.session)

        return await super().__aenter__()

    async def __aexit__(self, *args):
        await super().__aexit__(*args)
        await self.session.close()

    async def _commit(self):
        await self.session.commit()

    async def rollback(self):
        await self.session.rollback()
