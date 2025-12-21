import asyncio
import uuid

import pytest
from fastapi import Depends

from src.payments.domain.entities import PaymentCreate
from src.payments.domain.interfaces.payment_provider import IPaymentProvider
from src.payments.presentation.dependenscies import get_payment_provider


@pytest.mark.asyncio
async def test_create_payment_yoomoney():
    random_label = str(uuid.uuid4())
    payment = PaymentCreate(amount=10,
                            order_id=1,
                            method="yoomoney",
                            label=random_label)
    provider: IPaymentProvider = get_payment_provider(payment.method)
    payment_url: str = await provider.create(payment)

    assert payment_url is not None

    for _ in range(50):
        print(f"ID: {random_label} / URL: {payment_url} / Check payment status...")

        check_payment = await provider.check_status(payment.label)

        if check_payment:
            print(f"Payment {payment.label} is paid")
            break

        await asyncio.sleep(5)


