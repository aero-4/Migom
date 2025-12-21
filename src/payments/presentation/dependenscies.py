from typing import Annotated

from fastapi import Depends

from src.payments.domain.interfaces.payment_provider import IPaymentProvider
from src.payments.domain.interfaces.payment_uow import IPaymentUnitOfWork
from src.payments.infrastructure.db.unit_of_work import PGPaymentUnitOfWork
from src.payments.infrastructure.services.yoomoney_provider import YoomoneyProvider


def get_payment_uow() -> IPaymentUnitOfWork:
    return PGPaymentUnitOfWork()


def get_payment_provider() -> IPaymentProvider:
    return YoomoneyProvider()


PaymentUoWDeps = Annotated[IPaymentUnitOfWork, Depends(get_payment_uow)]
PaymentProviderDeps = Annotated[IPaymentProvider, Depends(get_payment_provider)]
