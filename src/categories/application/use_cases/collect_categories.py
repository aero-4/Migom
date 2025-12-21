from src.categories.infrastructure.db.unit_of_work import PGCategoryUnitOfWork


async def collect_categories(
    uow: PGCategoryUnitOfWork,
):
    async with uow:
        categories = await uow.categories.get_all()
        return categories


