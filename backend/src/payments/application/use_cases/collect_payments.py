from typing import List

from src.auth.presentation.dependencies import TokenAuthDep
from src.orders.domain.entities import OrderStatus, OrderUpdate
from src.orders.presentation.dependencies import OrderUoWDeps
from src.payments.domain.entities import Payment, PaymentUpdate
from src.payments.domain.interfaces.payment_provider import IPaymentProvider
from src.payments.infrastructure.db.orm import PaymentsStatus
from src.payments.presentation.dependenscies import PaymentUoWDeps
from src.users.domain.entities import User


async def get_payment(
        id: int,
        user: User,
        uow: PaymentUoWDeps,
        uow_orders: OrderUoWDeps,
        provider: IPaymentProvider,
) -> Payment:
    status = None
    async with uow:
        payment = await uow.payments.get(id, user.id)
        # status = PaymentsStatus.success if await provider.check_status(payment.label) else PaymentsStatus.waiting
        status = PaymentsStatus.success # fake

        if status != payment.status:
            payment_update = PaymentUpdate(id=payment.id, status=status)
            payment.status = status

            await uow.payments.update(payment_update)
            await uow.commit()

    if status == PaymentsStatus.success:

        async with uow_orders:
            order_data = OrderUpdate(id=payment.order_id, status=OrderStatus.PENDING)
            order = await uow_orders.orders.update(order_data)
            await uow_orders.commit()
            print(order)
    return payment


async def collect_payments(
        uow: PaymentUoWDeps,
) -> List[Payment]:
    async with uow:
        payments = await uow.payments.get_all()
    return payments
