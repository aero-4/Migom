from unittest.mock import MagicMock, AsyncMock

import pytest
import datetime

from src.categories.application.use_cases.collect_categories import collect_categories
from src.categories.application.use_cases.new_categories import add_category
from src.categories.domain.entities import CategoryCreate
from src.categories.domain.interfaces.category_uow import ICategoryUnitOfWork
from src.categories.presentation.dtos import CategoryCreateDTO


@pytest.mark.asyncio
async def test_collection_categories(monkeypatch, fake_cat_uow):
    category = CategoryCreateDTO(name="Бургеры",
                                 photo="src/photo1.jpg")
    await add_category(category, uow=fake_cat_uow)

    categories = await collect_categories(uow=fake_cat_uow)

    assert len(categories) == 1
    assert categories[0].name == category.name


