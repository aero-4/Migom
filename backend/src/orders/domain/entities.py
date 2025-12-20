import datetime
import enum
from typing import List

from src.addresses.domain.entities import Address
from src.core.domain.entities import CustomModel


class OrderStatus(enum.Enum):
    CREATED = "created"  # когда только создан и не оплачен
    PENDING = "pending"  # оплачен, ждет подтверждения от ресторана
    COOKING = "cooking"  # готовится
    WAITING_COURIER = "waiting-courier"  # приготовлен, поиск курьера доставки
    DELIVERING = "delivering"  # доставляется курьером
    SUCCESS = "success"  # доставлен
    ERROR = "error"  # любая проблема с заказом по чьей либо вине


class CartItem(CustomModel):
    product_id: int
    quantity: int


class Order(CustomModel):
    id: int
    created_at: datetime.datetime
    update_at: datetime.datetime
    creator_id: int
    products: List
    status: str
    address: Address
    amount: int



class OrderCreate(CustomModel):
    creator_id: int
    address_id: int
    products: List[CartItem]


class OrderUpdate(CustomModel):
    id: int
    creator_id: int | None = None
    status: str | None = None
    amount: int | None = None
    address_id: int | None = None
