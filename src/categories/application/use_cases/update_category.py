from src.categories.domain.entities import Category
from src.categories.infrastructure.db.unit_of_work import PGCategoryUnitOfWork
from src.categories.presentation.dtos import CategoryUpdateDTO
from src.utils.strings import generate_slug


async def update_category(
        id: int,
        category_data: CategoryUpdateDTO,
        uow: PGCategoryUnitOfWork
) -> Category:
    async with uow:
        slug = generate_slug(category_data.name)
        category = category_data.to_entity(id, slug)
        category = await uow.categories.update(category)
        await uow.commit()
    return category
