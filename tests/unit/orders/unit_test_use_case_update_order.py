import pytest

from src.orders.domain.entities import OrderUpdate, OrderStatus, CartItem


@pytest.mark.asyncio
async def test_update_order(monkeypatch, fake_order_uow):
    order_data = OrderUpdate(id=1, creator_id=1, products=[CartItem(product_id=1, quantity=1)], status=OrderStatus.PENDING, amount=100, delivery_address="test")
    order = await fake_order_uow.orders.add(order_data)

    order_updated = await fake_order_uow.orders.update(order_data)

    assert order_updated.id == order.id
    assert order_updated.creator_id == order.creator_id
    assert order_updated.products == order.products
    assert order_updated.status == order.status
    assert order_updated.amount == order.amount
    assert order_updated.delivery_address == order.delivery_address
