import datetime
import os
import random
import httpx
import pytest

from src.categories.domain.entities import Category
from src.categories.presentation.dtos import CategoryCreateDTO
from src.products.domain.entities import Product
from src.products.presentation.dtos import ProductCreateDTO, SearchDataDTO
from src.users.infrastructure.db.orm import UserRole
from src.users.presentation.dtos import UserCreateDTO

TEST_CATEGORY_DTO = CategoryCreateDTO(
    name="Бургеры",
    photo="src/photo1.jpg"
)
TEST_PRODUCT_DTO = ProductCreateDTO(
    name="Бургер - Бургерный",
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
    kilocalorie=11,
    photo="src/photo1.jpg",
    category_id=1
)
TEST_SUPER_USER = UserCreateDTO(email="test@test.com", password="test12345", first_name="Test", last_name="Test", birthday=datetime.date(1990, 1, 1), role=UserRole.admin)


async def create_product(client, product=None):
    resp = await client.post("/api/files/",
                             files={"file": open("examples/test (1).jpeg", "rb")}
                             )
    url = resp.json()["url"]

    category = CategoryCreateDTO(
        name=f"Бургеры №{random.randint(1, 1000)}",
        photo=url
    )

    response1 = await client.post("/api/categories/", json=category.model_dump(mode="json"))
    category = Category(**response1.json())
    product = product or ProductCreateDTO(
        name=f"Бургер - Бургерный №{random.randint(1, 2000)} ",
        content=f"Бургеры в бургерной скале. Почувствуйте новые вкусы! №{random.randint(1, 200)}",
        composition="зеленый лист, соль, сахар, огурцы",
        price=1299,
        discount_price=random.randint(1, 100),
        discount=random.randint(1, 100),
        count=random.randint(1, 100),
        grams=random.randint(1, 100),
        protein=random.randint(1, 100),
        fats=random.randint(1, 100),
        carbohydrates=random.randint(1, 100),
        kilocalorie=random.randint(1, 100),
        category_id=category.id,
        photo=url,
    )

    response2 = await client.post("/api/products/", json=product.model_dump())
    product_created = Product(**response2.json())

    assert product_created.name == product.name
    return product_created


async def create_normal_product(client):
    TEST_PHOTOS = [os.path.join("normal", i) for i in os.listdir("normal")]

    CATEGORIES = [
        "Выбор пользователей",
        "Бургеры",
        "Комбо и ланчи",
        "Острые блюда",
        "Закуски",
        "Баскеты",
        "Новинки",
    ]

    PRODUCTS = [
        {
            "name": "Шефбургер оригинальный",
            "content": "Классический бургер с сочным куриным филе в хрустящей панировке и свежими овощами.",
            "composition": "Куриное филе; Булочка бриошь; Салат Айсберг; Томаты; Фирменный соус",
            "price_range": (189, 329),
            "grams": [180, 200, 220],
        },
        {
            "name": "Шефбургер острый",
            "content": "Острый бургер с куриным филе и пикантным соусом для любителей яркого вкуса.",
            "composition": "Куриное филе; Булочка бриошь; Перец халапеньо; Соус острый",
            "price_range": (199, 349),
            "grams": [180, 200, 220],
        },
        {
            "name": "Бургер с сырной котлетой",
            "content": "Сытный бургер с сырной котлетой, свежими овощами и мягкой булочкой.",
            "composition": "Сырная котлета; Булочка; Салат; Соус",
            "price_range": (209, 359),
            "grams": [190, 210, 230],
        },
        {
            "name": "Комбо с курицей",
            "content": "Бургер с курицей, картофель фри и напиток — отличный вариант для обеда.",
            "composition": "Бургер куриный; Картофель фри; Напиток",
            "price_range": (459, 699),
            "grams": [520, 580, 620],
        },
        {
            "name": "Острое комбо",
            "content": "Набор для тех, кто любит поострее: бургер, фри и острый соус.",
            "composition": "Острый бургер; Картофель фри; Соус",
            "price_range": (499, 749),
            "grams": [540, 600, 660],
        },
        {
            "name": "8 острых крылышек",
            "content": "Куриные крылышки в острой глазури с насыщенным вкусом специй.",
            "composition": "Крылышки куриные; Острая глазурь; Специи",
            "price_range": (399, 599),
            "grams": [300, 340, 380],
        },
        {
            "name": "12 крылышек BBQ",
            "content": "Крылышки в соусе BBQ с дымным ароматом и мягким вкусом.",
            "composition": "Крылышки куриные; Соус BBQ",
            "price_range": (549, 799),
            "grams": [420, 480, 540],
        },
        {
            "name": "Картофель фри стандартный",
            "content": "Хрустящий картофель фри, обжаренный до золотистой корочки.",
            "composition": "Картофель; Растительное масло; Соль",
            "price_range": (129, 189),
            "grams": [120, 150, 180],
        },
        {
            "name": "Картофель фри большой",
            "content": "Увеличенная порция картофеля фри для настоящих ценителей.",
            "composition": "Картофель; Растительное масло; Соль",
            "price_range": (179, 249),
            "grams": [220, 260, 300],
        },
        {
            "name": "Куриные наггетсы 6 шт",
            "content": "Нежные куриные наггетсы в хрустящей панировке.",
            "composition": "Куриное филе; Панировка; Специи",
            "price_range": (199, 279),
            "grams": [160, 180],
        },
        {
            "name": "Куриные наггетсы 9 шт",
            "content": "Увеличенная порция куриных наггетсов для компании.",
            "composition": "Куриное филе; Панировка; Специи",
            "price_range": (269, 359),
            "grams": [240, 270],
        },
        {
            "name": "Большой баскет",
            "content": "Большой набор курицы и закусок для компании.",
            "composition": "Куриные кусочки; Картофель фри; Соусы",
            "price_range": (1099, 1799),
            "grams": [900, 1000, 1100],
        },
        {
            "name": "Семейный баскет",
            "content": "Сытный набор для всей семьи с разнообразием вкусов.",
            "composition": "Курица; Наггетсы; Фри; Соусы",
            "price_range": (1399, 2199),
            "grams": [1200, 1300, 1400],
        },
        {
            "name": "Соус сырный",
            "content": "Нежный сливочный соус с выраженным сырным вкусом.",
            "composition": "Сыр; Сливки; Специи",
            "price_range": (59, 89),
            "grams": [30, 40],
        },
        {
            "name": "Соус кисло-сладкий",
            "content": "Лёгкий соус с балансом сладости и кислинки.",
            "composition": "Томатная основа; Сахар; Специи",
            "price_range": (59, 89),
            "grams": [30, 40],
        },
    ]

    created_categories = {}

    for tpl in PRODUCTS:
        photo_path = random.choice(TEST_PHOTOS)

        with open(photo_path, "rb") as f:
            resp = await client.post("/api/files/", files={"file": f})
            url_photo = resp.json()["url"]

        cat_name = random.choice(CATEGORIES)
        if cat_name not in created_categories:
            cat_dto = CategoryCreateDTO(name=cat_name, photo=url_photo)
            resp_cat = await client.post(
                "/api/categories/",
                json=cat_dto.model_dump(mode="json")
            )
            created_categories[cat_name] = Category(**resp_cat.json())

        category = created_categories[cat_name]

        price = random.randint(*tpl["price_range"])
        discount = random.choice([0, 5, 10, 15, 20])
        grams = random.choice(tpl["grams"])

        product_dto = ProductCreateDTO(
            name=tpl["name"],
            content=tpl["content"],
            composition=tpl["composition"],
            price=price,
            discount=discount,
            count=random.randint(20, 500),
            grams=grams,
            protein=random.randrange(10, 40, 5),
            fats=random.randrange(8, 35, 5),
            carbohydrates=random.randrange(15, 60, 5),
            kilocalorie=random.randrange(180, 700, 20),
            category_id=category.id,
            photo=url_photo,
        )

        resp_product = await client.post(
            "/api/products/",
            json=product_dto.model_dump()
        )

        product_created = Product(**resp_product.json())
        assert product_created.name == product_dto.name




@pytest.mark.asyncio(loop_scope="session")
async def test_success_collect_products(clear_db, user_factory):
    async with httpx.AsyncClient(base_url='http://localhost:8000') as client:
        await user_factory(client, TEST_SUPER_USER)

        await client.post("/api/categories/", json=TEST_CATEGORY_DTO.model_dump(mode="json"))
        await client.post("/api/products/", json=TEST_PRODUCT_DTO.model_dump(mode="json"))

        response = await client.get("/api/products/")
        products = response.json()

        assert response.status_code == 200
        assert products[0]['name'] == TEST_PRODUCT_DTO.name


@pytest.mark.asyncio(loop_scope="session")
async def test_null_collect_products(clear_db, user_factory):
    async with httpx.AsyncClient(base_url='http://localhost:8000') as client:
        await user_factory(client, TEST_SUPER_USER)

        response_create = await client.get("/api/products/")
        products = response_create.json()

        assert response_create.status_code == 200
        assert products == []


@pytest.mark.asyncio(loop_scope="session")
async def test_success_get_one_product(clear_db, user_factory):
    async with httpx.AsyncClient(base_url='http://localhost:8000') as client:
        await user_factory(client, TEST_SUPER_USER)
        product: Product = await create_product(client)
        response = await client.get(f"/api/products/{product.id}")
        product_data = Product(**response.json())

        assert response.status_code == 200
        assert product_data.name == product.name


@pytest.mark.asyncio(loop_scope="session")
async def test_not_found_get_one_product(clear_db, user_factory):
    async with httpx.AsyncClient(base_url='http://localhost:8000') as client:
        await user_factory(client, TEST_SUPER_USER)
        product_id = random.randint(1, 100)

        response = await client.get(f"/api/products/{product_id}")

        assert response.status_code == 404
        assert response.json() == {"detail": "Not found"}


@pytest.mark.asyncio(loop_scope="session")
async def test_success_create_product(clear_db, user_factory):
    async with httpx.AsyncClient(base_url="http://localhost:8000") as client:
        await user_factory(client, TEST_SUPER_USER)
        product = await create_product(client, TEST_PRODUCT_DTO)

        assert product.name == TEST_PRODUCT_DTO.name


@pytest.mark.asyncio(loop_scope="session")
async def test_already_exists_create_product(clear_db, user_factory):
    async with httpx.AsyncClient(base_url="http://localhost:8000") as client:
        await user_factory(client, TEST_SUPER_USER)
        await create_product(client, TEST_PRODUCT_DTO)

        response_create = await client.post("/api/products/", json=TEST_PRODUCT_DTO.model_dump(mode="json"))

        assert response_create.status_code == 409
        assert response_create.json() == {"detail": "Already exists"}


@pytest.mark.asyncio(loop_scope="session")
async def test_success_delete_product(clear_db, user_factory):
    async with httpx.AsyncClient(base_url="http://localhost:8000") as client:
        await user_factory(client, TEST_SUPER_USER)
        product = await create_product(client)

        response = await client.delete(f"/api/products/{product.id}")

        assert response.json() is None


@pytest.mark.asyncio(loop_scope="session")
async def test_nof_found_delete_product(clear_db, user_factory):
    async with httpx.AsyncClient(base_url="http://localhost:8000") as client:
        await user_factory(client, TEST_SUPER_USER)
        product_id = 1

        response = await client.delete(f"/api/products/{product_id}")

        assert response.status_code == 404
        assert response.json() == {"detail": "Not found"}


@pytest.mark.asyncio(loop_scope="session")
async def test_success_update_product(clear_db, user_factory):
    async with httpx.AsyncClient(base_url="http://localhost:8000") as client:
        await user_factory(client, TEST_SUPER_USER)

        product: Product = await create_product(client)
        product.name = "Пицца"

        response = await client.patch(f"/api/products/{product.id}", json=product.model_dump())

        assert response.status_code == 200
        assert response.json()["name"] == product.name


@pytest.mark.asyncio(loop_scope="session")
async def test_not_found_update_product(clear_db, user_factory):
    async with httpx.AsyncClient(base_url="http://localhost:8000") as client:
        await user_factory(client, TEST_SUPER_USER)
        product_id = 1
        response = await client.patch(f"/api/products/{product_id}", json=TEST_PRODUCT_DTO.model_dump())

        assert response.status_code == 404
        assert response.json() == {"detail": "Not found"}


@pytest.mark.asyncio(loop_scope="session")
async def test_success_get_all_by_name_filters(clear_db, user_factory):
    async with httpx.AsyncClient(base_url="http://localhost:8000") as client:
        await user_factory(client, TEST_SUPER_USER)

        products = []
        for i in range(2):
            products.append(
                await create_product(client)
            )

        search = SearchDataDTO(name="бур")
        search_response = await client.post("/api/products/search", json=search.model_dump())
        search_result = [Product(**i) for i in search_response.json()]

        assert products == search_result

        search2 = SearchDataDTO(name="ГЕР")
        search_response2 = await client.post("/api/products/search", json=search2.model_dump())
        search_result2 = [Product(**i) for i in search_response2.json()]

        assert products == search_result2

        # search3 = SearchDataDTO(price=1299)
        # search_response3 = await client.post("/api/products/search", json=search3.model_dump())
        # search_result3 = [Product(**i) for i in search_response3.json()]
        #
        # assert products == search_result3

        search4 = SearchDataDTO(name="бургерный")
        search_response4 = await client.post("/api/products/search", json=search4.model_dump())
        search_result4 = [Product(**i) for i in search_response4.json()]

        assert products == search_result4


@pytest.mark.asyncio(loop_scope="session")
async def test_success_get_all_by_category_name():
    async with httpx.AsyncClient(base_url="http://localhost:8000") as client:
        search4 = SearchDataDTO(category_name="Острее киберугроз")
        search_response4 = await client.post("/api/products/search", json=search4.model_dump())
        search_result4 = [Product(**i) for i in search_response4.json()]

        print(search_result4)


@pytest.mark.asyncio(loop_scope="session")
async def test_add_some_test_products_and_categories(clear_db, user_factory, count: int = 25):
    async with httpx.AsyncClient(base_url="http://localhost:8000") as client:
        await user_factory(client, TEST_SUPER_USER)

        for i in range(count):
            await create_product(client)

        response = await client.get("/api/products/")
        products = response.json()

        assert response.status_code == 200
        assert len(products) == count


@pytest.mark.asyncio(loop_scope="session")
async def test_add_some_normal_products_and_categories(clear_db, user_factory):
    async with httpx.AsyncClient(base_url="http://localhost:8000") as client:
        await user_factory(client, TEST_SUPER_USER)

        await create_normal_product(client)

        response = await client.get("/api/products/")
        products = response.json()

        assert response.status_code == 200
