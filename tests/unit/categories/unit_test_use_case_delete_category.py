import pytest
import datetime

from unittest.mock import MagicMock, AsyncMock

from src.categories.application.use_cases.collect_categories import collect_categories
from src.categories.application.use_cases.delete_category import delete_category
from src.categories.application.use_cases.new_categories import add_category
from src.categories.application.use_cases.update_category import update_category
from src.categories.domain.entities import CategoryCreate
from src.categories.domain.interfaces.category_uow import ICategoryUnitOfWork
from src.categories.presentation.dtos import CategoryCreateDTO, CategoryUpdateDTO


@pytest.mark.asyncio
async def test_delete_category(monkeypatch, fake_cat_uow):
    category_dto = CategoryCreateDTO(name="Бургеры",
                                     photo="src/photo1.jpg")
    category = await add_category(category_dto, fake_cat_uow)

    category_deleted = await delete_category(category.id, uow=fake_cat_uow)
    assert category_deleted is None

    categories = await collect_categories(fake_cat_uow)
    assert len(categories) == 0
