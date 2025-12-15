import datetime
import enum
from typing import List

from src.core.domain.entities import CustomModel


class OrderStatus(enum.Enum):
    CREATED = "created"
    PENDING = "pending"
    DELIVERING = "delivering"
    SUCCESS = "success"
    ERROR = "error"


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
    address_id: int
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

