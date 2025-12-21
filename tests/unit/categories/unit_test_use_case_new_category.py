
from unittest.mock import MagicMock, AsyncMock

import pytest
import datetime

from src.categories.application.use_cases.collect_categories import collect_categories
from src.categories.application.use_cases.new_categories import add_category
from src.categories.domain.entities import CategoryCreate
from src.categories.domain.interfaces.category_uow import ICategoryUnitOfWork
from src.categories.presentation.dtos import CategoryCreateDTO


@pytest.mark.asyncio
async def test_new_category(monkeypatch, fake_cat_uow):
    category_dto = CategoryCreateDTO(name="Бургеры",
                                 photo="src/photo1.jpg")
    category = await add_category(category_dto, uow=fake_cat_uow)

    assert category_dto.name == category.name
    assert category_dto.photo == category.photo
