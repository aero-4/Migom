from src.orders.domain.entities import Order, OrderCreate
from src.orders.domain.interfaces.order_uow import IOrderUnitOfWork
from src.orders.presentation.dtos import OrderCreateDTO
from src.users.domain.entities import User


async def new_order(order: OrderCreateDTO, uow: IOrderUnitOfWork, user: User) -> Order:
    async with uow:
        order = OrderCreate(creator_id=user.id, **order.model_dump())
        order = await uow.orders.add(order)
        await uow.commit()
    return order
