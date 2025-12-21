from src.orders.presentation.dependencies import OrderUoWDeps
from src.users.domain.entities import User


async def active_order(user: User, uow: OrderUoWDeps):
    async with uow:
        order = await uow.orders.get_current(user.id)
    return order
