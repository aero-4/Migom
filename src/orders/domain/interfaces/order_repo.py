import abc
from typing import List

from src.orders.domain.entities import OrderCreate, Order, OrderUpdate, OrderStatus


class IOrderRepository(abc.ABC):

    @abc.abstractmethod
    async def add(self, order: OrderCreate) -> Order:
        ...

    @abc.abstractmethod
    async def get(self, id: int) -> Order:
        ...

    @abc.abstractmethod
    async def get_all(self, user_id: int) -> List[Order]:
        ...

    @abc.abstractmethod
    async def get_current(self, user_id: int) -> Order:
        ...

    @abc.abstractmethod
    async def delete(self, id: int) -> None:
        ...

    @abc.abstractmethod
    async def update(self, order_data: OrderUpdate) -> Order:
        ...


    @abc.abstractmethod
    async def filter(self, status: OrderStatus) -> List[Order]:
        ...
