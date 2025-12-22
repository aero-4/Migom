import abc
from typing import List

from src.payments.domain.entities import Payment, PaymentCreate, PaymentUpdate


class IPaymentRepository(abc.ABC):
    @abc.abstractmethod
    async def add(self, payment: PaymentCreate) -> Payment:
        ...

    @abc.abstractmethod
    async def get(self, payment_id: int, user_id: int) -> Payment:
        ...

    @abc.abstractmethod
    async def get_all(self) -> List[Payment]:
        ...

    @abc.abstractmethod
    async def update(self, payment: PaymentUpdate) -> None:
        ...
