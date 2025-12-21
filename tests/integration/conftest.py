import os
import httpx
import pytest_asyncio

from sqlalchemy import text
from src.db.engine import engine
from src.addresses.domain.entities import Address
from src.addresses.presentation.dtos import AddressCreateDTO
from src.users.presentation.dtos import UserCreateDTO
from src.users.domain.entities import User

TABLES_TO_TRUNCATE = [
    "users",
    "categories",
    "products",
    "addresses",
    "orders"
]


@pytest_asyncio.fixture(loop_scope="session")
async def clear_db():
    env = os.environ.get("ENVIRONMENT")
    if env != "testing":
        raise RuntimeError(f"clear_db can only be used in testing environment. Current ENVIRONMENT={env}")

    async with engine.begin() as conn:
        tables = ", ".join(TABLES_TO_TRUNCATE)
        query = f"TRUNCATE TABLE {tables} RESTART IDENTITY CASCADE;"
        await conn.execute(text(query))

    return True


@pytest_asyncio.fixture
def user_factory():
    async def _create(client: httpx.AsyncClient, user: UserCreateDTO) -> User:
        response = await client.post("/api/auth/register", json=user.model_dump(mode="json"))

        assert response.status_code == 200

        data = response.json()

        assert data["msg"] == "Register successful"

        client.cookies.set("access_token", response.cookies.get("access_token"))
        client.cookies.set("refresh_token", response.cookies.get("refresh_token"))

        return user

    return _create


@pytest_asyncio.fixture
def address_factory():
    async def _create(client: httpx.AsyncClient, address: AddressCreateDTO) -> Address:
        response = await client.post("/api/addresses/", json=address.model_dump(mode="json"))
        assert response.status_code == 200

        address_created = Address(**response.json())
        assert address_created.city == address.city
        assert address_created.street == address.street

        return address_created

    return _create

