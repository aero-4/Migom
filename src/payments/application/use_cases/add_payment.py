from src.payments.domain.entities import PaymentCreate, Payment
from src.payments.domain.interfaces.payment_provider import IPaymentProvider
from src.payments.presentation.dependenscies import PaymentUoWDeps
from src.payments.presentation.dtos import PaymentCreateDTO
from src.users.domain.entities import User


async def add_payment(user: User, payment_data: PaymentCreateDTO, uow: PaymentUoWDeps, provider: IPaymentProvider) -> Payment:
    payment_data = PaymentCreate(amount=payment_data.amount,
                                 order_id=payment_data.order_id,
                                 user_id=user.id,
                                 method=payment_data.method,
                                 label=f"Оплата заказа: {payment_data.order_id}")

    async with uow:
        payment_url: str = await provider.create(payment_data)
        payment_data.url = payment_url
        payment = await uow.payments.add(payment_data)
        await uow.commit()

    return payment
