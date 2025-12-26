import datetime
import random

import httpx
import pytest
from aiomoney import authorize_app, YooMoney
from aiomoney.schemas import InvoiceSource

from src.addresses.domain.entities import Address
from src.addresses.presentation.dtos import AddressCreateDTO
from src.categories.domain.entities import Category
from src.categories.presentation.dtos import CategoryCreateDTO
from src.orders.domain.entities import OrderStatus, Order
from src.orders.presentation.dtos import CartItemDTO, OrderCreateDTO
from src.payments.application.use_cases.add_payment import add_payment
from src.payments.domain.entities import PaymentCreate, Payment
from src.payments.infrastructure.db.orm import PaymentsStatus
from src.payments.presentation.dependenscies import PaymentUoWDeps
from src.payments.config import payment_settings
from src.payments.presentation.dtos import PaymentCreateDTO
from src.products.domain.entities import Product, ProductCreate
from src.users.infrastructure.db.orm import UserRole
from src.users.presentation.dtos import UserCreateDTO
from src.utils.strings import generate_random_alphanum

TEST_USER_DTO = UserCreateDTO(
    email=f"olegtinkov{random.randint(100, 999)}@gmail.com",
    password="securepass",
    first_name="Oleg",
    last_name="Tinkov",
    birthday=datetime.date(2025, 1, 1),
    role=UserRole.user
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
        role=UserRole.admin
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
        product_data = ProductCreate(name=f"product {random.randint(100, 999)}",
                                     content="test content",
                                     composition="test composition",
                                     price=100,
                                     count=5,
                                     grams=1,
                                     protein=1,
                                     fats=1,
                                     carbohydrates=1,
                                     kilocalorie=123,
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
    # assert order.status == OrderStatus.CREATED or order.status == OrderStatus.SUCCESS

    return order


@pytest.mark.asyncio
async def test_success_create_payment(clear_db, user_factory):
    async with httpx.AsyncClient(base_url="http://localhost:8000") as client:
        order = await create_order(client, user_factory)
        payment_dto = PaymentCreateDTO(order_id=order.id, amount=order.amount, method="yoomoney")
        response = await client.post("/api/payments/", json=payment_dto.model_dump())
        payment = Payment(**response.json())

        assert payment.order_id == order.id
        assert payment.label == f"Оплата заказа: {order.id}"


@pytest.mark.asyncio
async def test_not_auth_user_create_payment(clear_db, user_factory):
    async with httpx.AsyncClient(base_url="http://localhost:8000") as client:
        order = OrderCreateDTO(order_id=1, amount=123, address_id=1, products=[CartItemDTO(product_id=1, quantity=1)])
        payment_dto = PaymentCreateDTO(order_id=123, amount=123, method="yoomoney")
        response = await client.post("/api/payments/", json=payment_dto.model_dump())

        assert response.status_code == 401
        assert response.json() == {"detail": "Authentication required"}


@pytest.mark.asyncio
async def test_success_get_one(clear_db, user_factory):
    async with httpx.AsyncClient(base_url="http://localhost:8000") as client:
        order1 = await create_order(client, user_factory)
        payment_dto = PaymentCreateDTO(order_id=order1.id, amount=order1.amount, method="yoomoney")
        response = await client.post("/api/payments/", json=payment_dto.model_dump())

        assert response.status_code == 200

        response = await client.get(f"/api/payments/{order1.id}")
        payment = Payment(**response.json())

        assert response.status_code == 200
        assert payment.amount == payment_dto.amount
        assert payment.method == payment_dto.method


@pytest.mark.asyncio
async def test_success_get_all(clear_db, user_factory):
    async with httpx.AsyncClient(base_url="http://localhost:8000") as client:
        order1 = await create_order(client, user_factory)
        payment_dto = PaymentCreateDTO(order_id=order1.id, amount=order1.amount, method="yoomoney")
        response = await client.post("/api/payments/", json=payment_dto.model_dump())

        assert response.status_code == 200

        response = await client.get(f"/api/payments/")
        payments = [Payment(**i) for i in response.json()]

        assert response.status_code == 200
        assert payments[0].amount == payment_dto.amount



@pytest.mark.asyncio
async def test_success_create_and_get_payment(clear_db, user_factory):
    async with httpx.AsyncClient(base_url="http://localhost:8000") as client:
        order1 = await create_order(client, user_factory)

        payment_dto = PaymentCreateDTO(order_id=order1.id, amount=order1.amount, method="yoomoney")
        response = await client.post("/api/payments/", json=payment_dto.model_dump())
        payment = Payment(**response.json())

        assert response.status_code == 200

        response2 = await client.get(f"/api/payments/{payment.id}")
        payment_2 = Payment(**response2.json())

        assert payment_2.status == PaymentsStatus.success


        response3 = await client.get(f"/api/orders/{order1.id}")
        order3 = Order(**response3.json())


        assert response3.status_code == 200
        assert order3.status == OrderStatus.PENDING.value



