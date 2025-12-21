import pytest
import datetime

from unittest.mock import MagicMock, AsyncMock

from src.categories.application.use_cases.collect_categories import collect_categories
from src.categories.application.use_cases.new_categories import add_category
from src.categories.application.use_cases.update_category import update_category
from src.categories.domain.entities import CategoryCreate
from src.categories.domain.interfaces.category_uow import ICategoryUnitOfWork
from src.categories.presentation.dtos import CategoryCreateDTO, CategoryUpdateDTO


@pytest.mark.asyncio
async def test_new_category(monkeypatch, fake_cat_uow):
    category_dto = CategoryCreateDTO(name="Бургеры",
                                 photo="src/photo1.jpg")
    category = await add_category(category_dto, fake_cat_uow)

    category_update_dto = CategoryUpdateDTO(name="Бургеры Русские")

    category_updated = await update_category(category.id, category_update_dto, uow=fake_cat_uow)

    assert category_updated.name == category_update_dto.name
    assert category_updated.name != category_dto.name