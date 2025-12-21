from src.db.engine import async_session_maker
from src.payments.domain.interfaces.payment_uow import IPaymentUnitOfWork
from src.payments.infrastructure.db.repositories import PGPaymentRepository


class PGPaymentUnitOfWork(IPaymentUnitOfWork):

    def __init__(self, session_factory=async_session_maker):
        self.session_factory = session_factory

    async def __aenter__(self):
        self.session = self.session_factory()
        self.payments = PGPaymentRepository(self.session)
        return await super().__aenter__()

    async def __aexit__(self, *args):
        await super().__aexit__(*args)
        await self.session.close()

    async def _commit(self):
        await self.session.commit()

    async def rollback(self):
        await self.session.rollback()
