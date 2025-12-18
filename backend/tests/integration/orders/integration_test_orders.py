import datetime
import random
import pytest
import httpx

from src.addresses.domain.entities import Address
from src.addresses.presentation.dtos import AddressCreateDTO
from src.auth.presentation.dtos import RegisterUserDTO
from src.categories.domain.entities import Category
from src.categories.presentation.dtos import CategoryCreateDTO
from src.orders.domain.entities import Order, OrderStatus
from src.orders.presentation.dtos import OrderCreateDTO, CartItemDTO, OrderUpdateDTO, OrderSearchDTO
from src.products.domain.entities import ProductCreate, Product
from src.users.infrastructure.db.orm import UserRole
from src.users.presentation.dtos import UserCreateDTO
from src.users.domain.entities import User
from src.utils.strings import generate_random_alphanum

TEST_USER_DTO = UserCreateDTO(
    email=f"olegtinkov{random.randint(100, 999)}@gmail.com",
    password="securepass",
    first_name="Oleg",
    last_name="Tinkov",
    birthday=datetime.date(2025, 1, 1),
)


async def create_address(client) -> Address:
    address = AddressCreateDTO(city="Москва", street="Ул Пушкина", house_number=random.randint(10, 100))
    response = await client.post("/api/addresses/", json=address.model_dump())
    address = Address(**response.json())
    return address


async def create_order(client, user_factory) -> Order:
    user_data = UserCreateDTO(
        email=f"olegtinkov{random.randint(100, 999)}@gmail.com",
        password=f"securepass{random.randint(100, 999)}",
        first_name=f"Oleg{random.randint(100, 999)}",
        last_name=f"Tinkov{random.randint(100, 999)}",
        birthday=datetime.date(2025, 1, 1),
        is_super_user=True,
        role=UserRole.courier
    )

    # register admin user
    await user_factory(client, user_data)

    # create category
    category = CategoryCreateDTO(name=generate_random_alphanum(),
                                 photo="src/pizza.jpg")

    response = await client.post("/api/categories/", json=category.model_dump())
    category = Category(**response.json())

    # create products
    products = []
    for i in range(3):
        product_data = ProductCreate(name=f"Product {random.randint(1, 99999)}",
                                     content="test content",
                                     composition="test composition",
                                     price=100,
                                     count=5,
                                     grams=1,
                                     protein=1,
                                     fats=1,
                                     kilocalorie=12,
                                     carbohydrates=1,
                                     photo="test photo",
                                     category_id=category.id)
        response = await client.post("/api/products/", json=product_data.model_dump())

        assert response.status_code == 200

        product = Product(**response.json())

        assert product.name == product_data.name and product.photo == product_data.photo

        products.append(product)

    # create address
    address = await create_address(client)

    # create order
    TEST_ORDER_DTO = OrderCreateDTO(
        creator_id=1,
        products=[CartItemDTO(product_id=p.id, quantity=p.count) for p in products],
        address_id=address.id,
    )
    response = await client.post("/api/orders/", json=TEST_ORDER_DTO.model_dump())
    order: Order = Order(**response.json())

    assert response.status_code == 200
    assert order.products == [p.product_id for p in TEST_ORDER_DTO.products]
    assert order.status == OrderStatus.CREATED.value

    return order


@pytest.mark.asyncio(loop_scope="session")
async def test_success_new_order(clear_db, user_factory):
    async with httpx.AsyncClient(base_url='http://localhost:8000') as client:
        await create_order(client, user_factory)


@pytest.mark.asyncio(loop_scope="session")
async def test_not_found_products_new_order(clear_db, user_factory):
    async with httpx.AsyncClient(base_url='http://localhost:8000') as client:
        # create user
        user: User = await user_factory(client, TEST_USER_DTO)

        # create category
        category = CategoryCreateDTO(name="Пицца американская",
                                     photo="src/pizza.jpg")

        response = await client.post("/api/categories/", json=category.model_dump())
        category = Category(**response.json())

        # create products
        products = []
        random_id = 12345
        for i in range(3):
            product_data = ProductCreate(name=f"product {i}",
                                         content="test content",
                                         composition="test composition",
                                         price=100,
                                         count=5,
                                         grams=1,
                                         protein=1,
                                         fats=1,
                                         kilocalorie=123,
                                         carbohydrates=1,
                                         photo="test photo",
                                         category_id=category.id)
            response = await client.post("/api/products/", json=product_data.model_dump())

            assert response.status_code == 200

            product = Product(**response.json())

            assert product.name == product_data.name and product.photo == product_data.photo

            products.append(product)

        address = await create_address(client)

        # create order's
        TEST_ORDER_DTO = OrderCreateDTO(
            creator_id=1,
            products=[CartItemDTO(product_id=random_id, quantity=p.count) for p in products],
            address_id=address.id,
        )
        response = await client.post("/api/orders/", json=TEST_ORDER_DTO.model_dump())

        assert response.status_code == 404
        assert response.json() == {"detail": f"Product with id {random_id} not found"}


@pytest.mark.asyncio(loop_scope="session")
async def test_success_delete_order(clear_db, user_factory):
    async with httpx.AsyncClient(base_url='http://localhost:8000') as client:
        order = await create_order(client, user_factory)
        response = await client.delete(f"/api/orders/{order.id}")

        assert response.status_code == 200
        assert response.json() is None


@pytest.mark.asyncio(loop_scope="session")
async def test_not_found_delete_order(clear_db, user_factory):
    async with httpx.AsyncClient(base_url='http://localhost:8000') as client:
        random_id = 123
        response = await client.delete(f"/api/orders/{random_id}")

        assert response.status_code == 403
        assert response.json() == {'detail': 'Permission denied'}


@pytest.mark.asyncio(loop_scope="session")
async def test_success_get_one_order(clear_db, user_factory):
    async with httpx.AsyncClient(base_url='http://localhost:8000') as client:
        order: Order = await create_order(client, user_factory)
        response = await client.get(f"/api/orders/{order.id}")
        order_get = Order(**response.json())

        assert response.status_code == 200
        assert order_get.address_id == order.address_id and order_get.id == order.id


@pytest.mark.asyncio(loop_scope="session")
async def test_not_found_get_one_order(clear_db, user_factory):
    async with httpx.AsyncClient(base_url='http://localhost:8000') as client:
        random_id = 1234
        response = await client.get(f"/api/orders/{random_id}")

        assert response.status_code == 403
        assert response.json() == {"detail": "Permission denied"}


@pytest.mark.asyncio(loop_scope="session")
async def test_collect_orders(clear_db, user_factory):
    async with httpx.AsyncClient(base_url='http://localhost:8000') as client:
        orders = []
        order = await create_order(client, user_factory)
        orders.append(order)

        response = await client.get(f"/api/orders/")
        collect_orders = [Order(**o) for o in response.json()]

        assert response.status_code == 200
        assert collect_orders == orders


@pytest.mark.asyncio(loop_scope="session")
async def test_null_collect_orders(clear_db, user_factory):
    async with httpx.AsyncClient(base_url='http://localhost:8000') as client:
        response = await client.get(f"/api/orders/")
        collect_orders = [Order(**o) for o in response.json()]

        assert response.status_code == 200
        assert collect_orders == []


@pytest.mark.asyncio(loop_scope="session")
async def test_success_update_order(clear_db, user_factory):
    async with httpx.AsyncClient(base_url='http://localhost:8000') as client:
        orders = []
        for i in range(3):
            order = await create_order(client, user_factory)
            orders.append(order)

        address = await create_address(client)
        address2 = await create_address(client)

        order: Order = random.choice(orders)

        order_data = OrderUpdateDTO(creator_id=1,
                                    address_id=address2.id,
                                    amount=1234)

        response = await client.patch(f"/api/orders/{order.id}", json=order_data.model_dump())
        order_updated = Order(**response.json())

        assert response.status_code == 200
        assert order_updated.address_id == order_data.address_id
        assert order_data.amount == order_updated.amount


@pytest.mark.asyncio(loop_scope="session")
async def test_success_update_order_statuses(clear_db, user_factory):
    async with httpx.AsyncClient(base_url='http://localhost:8000') as client:
        TEST_USER_DTO.is_super_user = True
        TEST_USER_DTO.role = UserRole.courier

        orders = []
        for i in range(3):
            order = await create_order(client, user_factory)
            orders.append(order)

        order: Order = random.choice(orders)

        # update statuses
        for status in [OrderStatus.CREATED, OrderStatus.PENDING, OrderStatus.DELIVERING, OrderStatus.SUCCESS]:
            order_data = OrderUpdateDTO(status=status)
            response = await client.patch(f"/api/orders/{order.id}", json=order_data.model_dump())
            order_updated = Order(**response.json())

            assert response.status_code == 200
            assert order_updated.status == order_data.status


@pytest.mark.asyncio(loop_scope="session")
async def test_not_found_update_order(clear_db, user_factory):
    async with httpx.AsyncClient(base_url='http://localhost:8000') as client:
        orders = []
        for i in range(3):
            order = await create_order(client, user_factory)
            orders.append(order)

        random_id = random.randint(100, 999)
        order_data = OrderUpdateDTO(creator_id=1,
                                    status=OrderStatus.DELIVERING)
        response = await client.patch(f"/api/orders/{random_id}", json=order_data.model_dump())

        assert response.status_code == 404
        assert response.json() == {"detail": "Not found"}


@pytest.mark.asyncio(loop_scope="session")
async def test_success_search_orders_for_delivering(clear_db, user_factory):
    async with httpx.AsyncClient(base_url='http://localhost:8000') as client:
        orders = []
        order = await create_order(client, user_factory)
        order.status = OrderStatus.PENDING
        order = await client.patch(f"/api/orders/{order.id}", json=order.model_dump(mode="json"))
        orders.append(
            Order(**order.json())
        )


        order_data = OrderSearchDTO(status=OrderStatus.PENDING)
        response = await client.post(f"/api/orders/search", json=order_data.model_dump(mode="json"))

        assert response.status_code == 200
        assert response.json() == [i.model_dump(mode="json") for i in orders]



@pytest.mark.asyncio(loop_scope="session")
async def test_failed_search_orders_not_rights(clear_db, user_factory):
    async with httpx.AsyncClient(base_url='http://localhost:8000') as client:
        order_data = OrderSearchDTO(status=OrderStatus.PENDING)
        response = await client.post(f"/api/orders/search", json=order_data.model_dump(mode="json"))

        assert response.status_code == 403
        assert response.json() == {"detail": "Permission denied"}