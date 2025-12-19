from typing import List

from src.core.domain.entities import CustomModel
from src.orders.domain.entities import OrderStatus


class CartItemDTO(CustomModel):
    product_id: int
    quantity: int


class OrderCreateDTO(CustomModel):
    address_id: int
    products: List[CartItemDTO]


class OrderUpdateDTO(CustomModel):
    status: str | None = [
        OrderStatus.PENDING.value, OrderStatus.COOKING.value
    ]


class OrderSearchDTO(CustomModel):
    status: list[str] = [
        OrderStatus.PENDING.value,
        OrderStatus.COOKING.value,
        OrderStatus.WAITING_COURIER.value,
        OrderStatus.DELIVERING.value,
        OrderStatus.SUCCESS.value,
        OrderStatus.ERROR.value
    ]

