import httpx
import pytest
import pytest_asyncio

from typing import AsyncIterator

from src import app
from src.files.infrastructure.services.s3 import S3Storage

from tests.fakes.categories import FakeCategoryUnitOfWork
from tests.fakes.orders import FakeOrderUnitOfWork
from tests.fakes.products import FakeProductUnitOfWork
from tests.fakes.users import FakeUserUnitOfWork


@pytest_asyncio.fixture(loop_scope="session")
async def client() -> AsyncIterator[httpx.AsyncClient]:
    async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url='http://testserver') as client:
        yield client


@pytest.fixture
def fake_user_uow():
    return FakeUserUnitOfWork()


@pytest.fixture
def fake_cat_uow():
    return FakeCategoryUnitOfWork()


@pytest.fixture
def fake_product_uow():
    return FakeProductUnitOfWork()


@pytest.fixture
def fake_order_uow():
    return FakeOrderUnitOfWork()


@pytest.fixture()
def s3_storage():
    return S3Storage()
