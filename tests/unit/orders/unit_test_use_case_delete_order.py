import datetime

import pytest

from src.orders.application.use_cases.delete_order import delete_order
from src.orders.domain.entities import OrderCreate, CartItem
from src.orders.presentation.dtos import OrderCreateDTO, CartItemDTO
from src.products.domain.entities import ProductCreate
from src.users.domain.entities import User, UserCreate


@pytest.mark.asyncio
async def test_delete_order(monkeypatch, fake_order_uow, fake_user_uow, fake_product_uow):
    order_data = OrderCreate(creator_id=1,
                        products=[CartItem(product_id=123, quantity=2)],
                        delivery_address="Ул Пушкина д. 10, кв. 1, г. Москва")

    order = await fake_order_uow.orders.add(order_data)

    assert order_data.delivery_address == order.delivery_address

    assert await fake_order_uow.orders.delete(order.id) is None
