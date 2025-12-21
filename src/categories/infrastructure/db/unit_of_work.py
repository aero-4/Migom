from sqlalchemy.ext.asyncio import AsyncSession

from src.categories.domain.interfaces.category_uow import ICategoryUnitOfWork
from src.categories.infrastructure.db.repositories import PGCategoriesRepository
from src.db.engine import async_session_maker


class PGCategoryUnitOfWork(ICategoryUnitOfWork):

    def __init__(self, session_factory=async_session_maker):
        self.session_factory = session_factory

    async def __aenter__(self):
        self.session: AsyncSession = self.session_factory()
        self.categories = PGCategoriesRepository(self.session)

        return await super().__aenter__()

    async def __aexit__(self, *args):
        await super().__aexit__(*args)
        await self.session.close()

    async def _commit(self):
        await self.session.commit()

    async def rollback(self):
        await self.session.rollback()
