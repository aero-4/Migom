import pytest

from src.orders.domain.entities import OrderCreate, CartItem


@pytest.mark.asyncio
async def test_collect_order(monkeypatch, fake_order_uow):
    order_data = OrderCreate(creator_id=1, delivery_address="г.Москва ул Пушкина д. 10", products=[CartItem(product_id=1, quantity=2)])

    order_added = await fake_order_uow.orders.add(order_data)
    order = await fake_order_uow.orders.get(order_added.id)

    assert order.creator_id == order_added.creator_id and order.delivery_address == order_added.delivery_address and order_added.products == order.products


@pytest.mark.asyncio
async def test_collect_orders(monkeypatch, fake_order_uow):
    order_data = OrderCreate(creator_id=1, delivery_address="г.Москва ул Пушкина д. 10", products=[CartItem(product_id=1, quantity=2)])
    orders = []
    for _ in range(3):
        order_added = await fake_order_uow.orders.add(order_data)
        orders.append(order_added)
    collect_orders = await fake_order_uow.orders.get_all()

    assert collect_orders == orders