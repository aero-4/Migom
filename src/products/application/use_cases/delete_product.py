from src.products.infrasctructure.db.unit_of_work import PGProductUnitOfWork


async def delete_product(id: int, uow: PGProductUnitOfWork):
    async with uow:
        await uow.products.delete(id)
        await uow.commit()
