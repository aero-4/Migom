from src.orders.domain.entities import OrderUpdate, Order, OrderStatus
from src.orders.presentation.dependencies import OrderUoWDeps
from src.orders.presentation.dtos import OrderUpdateDTO
from src.users.domain.entities import User
from src.users.infrastructure.db.orm import UserRole


async def update_order(id: int, user: User, order_data: OrderUpdateDTO, uow: OrderUoWDeps) -> Order:
    async with uow:
        order = OrderUpdate(id=id,
                            **order_data.model_dump())

        if order.status == OrderStatus.DELIVERING.value:
            order.courier_id = user.id if user.role == UserRole.courier else None

        if order.status == OrderStatus.COOKING.value:
            order.cook_id = user.id if user.role == UserRole.cook else None

        order = await uow.orders.update(order)
        await uow.commit()
    return order
