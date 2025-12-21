from src.categories.infrastructure.db.unit_of_work import PGCategoryUnitOfWork


async def delete_category(id_pk: int, uow: PGCategoryUnitOfWork) -> None:
    async with uow:
        await uow.categories.delete(id_pk)
        await uow.commit()
