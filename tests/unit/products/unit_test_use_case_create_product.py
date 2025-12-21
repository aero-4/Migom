import pytest

from src.products.domain.entities import ProductCreate


@pytest.mark.asyncio
async def test_create_product(fake_product_uow):
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

    assert product.name == product_data.name