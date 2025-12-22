import abc

from src.payments.domain.entities import PaymentCreate, Payment


class IPaymentProvider:

    @abc.abstractmethod
    async def create(self, payment_data: PaymentCreate) -> str: ...

    @abc.abstractmethod
    async def check_status(self, label: str) -> bool: ...
