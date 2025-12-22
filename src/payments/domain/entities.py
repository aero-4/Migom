from src.core.domain.entities import CustomModel


class Payment(CustomModel):
    id: int
    amount: int
    label: str
    order_id: int
    user_id: int
    method: str
    status: str
    url: str | None = None


class PaymentCreate(CustomModel):
    user_id: int
    order_id: int
    amount: int
    method: str
    label: str
    url: str | None = None


class PaymentUpdate(CustomModel):
    id: int
    status: str | None = None
    method: str | None = None


