import datetime

from src.orders.domain.entities import OrderCreate, Order
from src.orders.domain.interfaces.order_repo import IOrderRepository
from src.orders.domain.interfaces.order_uow import IOrderUnitOfWork
from src.payments.domain.entities import PaymentCreate
from src.payments.domain.interfaces.payment_repo import IPaymentRepository


class FakeOrderUnitOfWork(IOrderUnitOfWork):
    payments: IPaymentRepository
    committed: bool

    def __init__(self):
        self.payments = FakePaymentsRepository()
        self.committed = False

    async def _commit(self):
        self.committed = True

    async def rollback(self):
        pass


class FakePaymentsRepository(IPaymentRepository):

    def __init__(self):
        self._last_id = 0
        self._payments = []

    async def add(self, order: OrderCreate) -> Order:
        order = Order(id=self._get_id(),
                      created_at=datetime.datetime.now(),
                      update_at=datetime.datetime.now(),
                      status="created",
                      products=[i.product_id for i in order.products],
                      creator_id=order.creator_id,
                      delivery_address=order.delivery_address)

        self._payments.append(order)
        return order

    async def _get_id(self):
        self._last_id = self._last_id + 1
        return self._last_id
