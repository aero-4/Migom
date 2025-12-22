import logging
from abc import ABC
from typing import List

from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from src.core.domain.exceptions import AlreadyExists, NotFound
from src.payments.domain.entities import Payment, PaymentCreate, PaymentUpdate
from src.payments.domain.interfaces.payment_repo import IPaymentRepository
from src.payments.infrastructure.db.orm import PaymentsOrm


class PGPaymentRepository(IPaymentRepository):

    def __init__(self, session: AsyncSession):
        super().__init__()
        self.session = session

    async def add(self, payment: PaymentCreate) -> Payment:
        obj: PaymentsOrm = PaymentsOrm(**payment.model_dump(mode="python"))
        self.session.add(obj)

        try:
            await self.session.flush()
        except IntegrityError as e:
            logging.error(e)
            raise AlreadyExists()

        return self._to_domain(obj)

    async def get(self, payment_id: int, user_id: int) -> Payment:
        stmt = select(PaymentsOrm).where(PaymentsOrm.id == payment_id and PaymentsOrm.user_id == user_id)
        result = await self.session.execute(stmt)
        obj = result.scalar_one_or_none()

        if not obj:
            raise NotFound()

        return self._to_domain(obj)

    async def get_all(self) -> List[Payment]:
        stmt = select(PaymentsOrm)

        result = await self.session.execute(stmt)
        objs: List[PaymentsOrm] = result.scalars().all()

        return [self._to_domain(obj) for obj in objs]

    async def update(self, payment: PaymentUpdate) -> Payment:
        stmt = select(PaymentsOrm).where(PaymentsOrm.id == payment.id)
        result = await self.session.execute(stmt)
        obj: PaymentsOrm = result.scalar_one_or_none()
        if not obj:
            raise NotFound()

        for field, value in payment.model_dump(exclude_none=True).items():
            setattr(obj, field, value)

        await self.session.flush()

        return self._to_domain(obj)

    @staticmethod
    def _to_domain(obj: PaymentsOrm) -> Payment:
        return Payment(
            id=obj.id,
            label=obj.label,
            amount=obj.amount,
            order_id=obj.order_id,
            user_id=obj.user_id,
            method=obj.method,
            status=obj.status,
            url=obj.url
        )
