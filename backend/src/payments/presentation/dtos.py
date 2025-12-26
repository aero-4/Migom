from pydantic import BaseModel

from src.payments.infrastructure.db.orm import PaymentsStatus


class PaymentCreateDTO(BaseModel):
    order_id: int
    amount: int
    method: str | None = None


class PaymentUpdateDTO(BaseModel):
    status: str | None = [
        PaymentsStatus.waiting, PaymentsStatus.success, PaymentsStatus.created, PaymentsStatus.expired
    ]
