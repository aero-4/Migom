import datetime

import pytest

from src.auth.application.use_cases.authenication import authenticate
from src.auth.presentation.dtos import AuthUserDTO
from src.orders.application.use_cases.new_order import new_order
from src.orders.domain.entities import OrderCreate, Order
from src.orders.domain.interfaces.order_uow import IOrderUnitOfWork
from src.orders.presentation.dtos import OrderCreateDTO
from src.products.domain.entities import ProductCreate
from src.products.domain.interfaces.product_uow import IProductUnitOfWork
from src.users.domain.entities import UserCreate, User
from src.users.domain.interfaces.user_uow import IUserUnitOfWork
from unittest.mock import MagicMock, AsyncMock


@pytest.mark.asyncio
async def test_new_order(monkeypatch, fake_order_uow: IOrderUnitOfWork, fake_user_uow: IUserUnitOfWork, fake_product_uow: IProductUnitOfWork):
    user = UserCreate(first_name="Oleg",
                      last_name="Petrov",
                      hashed_password="random_password",
                      birthday=datetime.date(2000, 9, 11),
                      email="olegpetrov@gmail.com")
    user_data: User = await fake_user_uow.users.add(user)

    for i in range(3):
        product = ProductCreate(name=f"product {i}",
                                content="test content",
                                composition="test composition",
                                price=100,
                                discount_price=100,
                                discount=10,
                                count=1, grams=1, protein=1, fats=1,
                                carbohydrates=1,
                                photo="test photo")
        await fake_product_uow.products.add(product)

    order = OrderCreateDTO(creator_id=user_data.id,
                           products=[i.id for i in await fake_product_uow.products.get_all()],
                           delivery_address="Ул Пушкина д. 10, кв. 1, г. Москва")

    result: Order = await new_order(
        order=order,
        uow=fake_order_uow,
    )

    assert result.products == order.products and result.delivery_address == order.delivery_address and result.amount == order.amount
