from src.payments.domain.entities import PaymentUpdate, Payment
from src.payments.presentation.dependenscies import PaymentUoWDeps
from src.payments.presentation.dtos import PaymentUpdateDTO


async def update_payment(id: int, payment: PaymentUpdateDTO, uow: PaymentUoWDeps) -> Payment:
    payment_data = PaymentUpdate(id=id, **payment.model_dump())

    async with uow:
        updated_payment = await uow.payments.update(payment_data)
    return updated_payment
