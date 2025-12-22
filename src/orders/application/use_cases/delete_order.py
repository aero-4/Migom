from src.orders.presentation.dependencies import OrderUoWDeps


async def delete_order(id: int, uow: OrderUoWDeps) -> None:
    async with uow:
        await uow.orders.delete(id)
        await uow.commit()
