import datetime

from src.orders.domain.entities import OrderCreate, Order
from src.orders.domain.interfaces.order_repo import IOrderRepository
from src.orders.domain.interfaces.order_uow import IOrderUnitOfWork


class FakeOrderUnitOfWork(IOrderUnitOfWork):
    orders: IOrderRepository
    committed: bool

    def __init__(self):
        self.orders = FakeOrderRepository()
        self.committed = False

    async def _commit(self):
        self.committed = True

    async def rollback(self):
        pass


class FakeOrderRepository(IOrderRepository):

    def __init__(self):
        self._last_id = 0
        self._orders = []

    async def add(self, order: OrderCreate) -> Order:
        order = Order(id=self._get_id(),
                      created_at=datetime.datetime.now(),
                      update_at=datetime.datetime.now(),
                      status="created", amount=0,
                      products=[i.product_id for i in order.products],
                      creator_id=order.creator_id,
                      delivery_address=order.delivery_address)
        self._orders.append(order)
        return order

    async def update(self, order_data: OrderCreate) -> Order:
        order = await self.get(order_data.id)
        for key, value in order_data.model_dump().items():
            setattr(order, key, value)

        self._orders[self._orders.index(order)] = order
        return order

    async def get(self, id: int) -> Order:
        for order in self._orders:
            if order.id == id:
                return order

    async def get_all(self) -> list[Order]:
        return self._orders

    async def delete(self, id: int) -> None:
        order = await self.get(id)
        self._orders.remove(order)

    def _get_id(self) -> int:
        self._last_id += 1
        return self._last_id
