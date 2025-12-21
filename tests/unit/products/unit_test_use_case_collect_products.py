import random
from unittest.mock import MagicMock, AsyncMock

import pytest
import datetime

from src.categories.application.use_cases.collect_categories import collect_categories
from src.categories.application.use_cases.new_categories import add_category
from src.categories.domain.entities import CategoryCreate
from src.categories.domain.interfaces.category_uow import ICategoryUnitOfWork
from src.categories.presentation.dtos import CategoryCreateDTO
from src.products.application.use_cases.collect_product import collect_products, collect_product
from src.products.application.use_cases.create_product import create_product
from src.products.domain.entities import ProductCreate, SearchData
from src.products.presentation.dtos import ProductCreateDTO


@pytest.mark.asyncio
async def test_collection_products(monkeypatch, fake_product_uow):
    product = ProductCreate(name="Бургер - Бургерный",
                            content="Бургеры в бургерной скале. Почувствуйте новые вкусы!",
                            composition="зеленый лист, соль, сахар, огурцы",
                            price=10,
                            discount_price=10,
                            discount=10,
                            count=10,
                            grams=10,
                            protein=10,
                            fats=10,
                            carbohydrates=10,
                            photo="src/photo1.jpg",
                            category_id=1)
    count: int = random.randint(1, 100)
    for i in range(count):
        await fake_product_uow.products.add(product)

    products = await collect_products(uow=fake_product_uow)

    assert len(products) == count
    assert products[0].name == product.name


@pytest.mark.asyncio
async def test_collect_product(monkeypatch, fake_product_uow):
    product_data = ProductCreate(name="Бургер - Бургерный",
                                 content="Бургеры в бургерной скале. Почувствуйте новые вкусы!",
                                 composition="зеленый лист, соль, сахар, огурцы",
                                 price=10,
                                 discount_price=10,
                                 discount=10,
                                 count=10,
                                 grams=10,
                                 protein=10,
                                 fats=10,
                                 carbohydrates=10,
                                 photo="src/photo1.jpg",
                                 category_id=1)

    product = await fake_product_uow.products.add(product_data)

    collect = await collect_product(product.id, fake_product_uow)

    assert collect.name == product_data.name


@pytest.mark.asyncio
async def test_collect_products_by_filters(monkeypatch, fake_product_uow):
    count: int = random.randint(1, 100)
    for i in range(count):
        product_data = ProductCreate(name=f"Бургер - Бургерный {i}",
                                     content=f"Бургеры в бургерной скале. Почувствуйте новые вкусы!",
                                     composition="зеленый лист, соль, сахар, огурцы",
                                     price=10,
                                     discount_price=10,
                                     discount=10,
                                     count=10,
                                     grams=10,
                                     protein=10,
                                     fats=10,
                                     carbohydrates=10,
                                     photo="src/photo1.jpg",
                                     category_id=1)
        await fake_product_uow.products.add(product_data)

    search_data = SearchData(name="Бургер - Бургерный")
    search_data = SearchData(category_id=1)
    search_data = SearchData(price=10)
    search_data = SearchData(grams=10)
    search_data = SearchData(protein=10)
    search_data = SearchData(fats=10)
    search_data = SearchData(carbohydrates=10)

    search_result = await fake_product_uow.products.get_by_filters(search_data)
    assert len(search_result) == count

