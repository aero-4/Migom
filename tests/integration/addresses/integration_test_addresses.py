import datetime

import httpx
import pytest

from src.addresses.domain.entities import Address
from src.addresses.presentation.dtos import AddressCreateDTO, AddressUpdateDTO
from src.users.infrastructure.db.orm import UserRole
from src.users.presentation.dtos import UserCreateDTO

TEST_USER = UserCreateDTO(email="test@test.com", password="test12345", first_name="Test", last_name="Test", birthday=datetime.date(1990, 1, 1), role=UserRole.user)


@pytest.mark.asyncio
async def test_success_add_address(clear_db, address_factory, user_factory):
    async with httpx.AsyncClient(base_url="http://localhost:8000") as client:
        await user_factory(client, TEST_USER)

        address_data = AddressCreateDTO(city="Москва", street="Колотушкина", house_number=123)
        await address_factory(client, address_data)


@pytest.mark.asyncio
async def test_add_address_not_authenticated(clear_db, address_factory):
    async with httpx.AsyncClient(base_url="http://localhost:8000") as client:
        address_data = AddressCreateDTO(city="Москва", street="Колотушкина", house_number=123)
        response = await client.post("/api/addresses/", json=address_data.model_dump(mode="json"))

        assert response.status_code == 401
        assert response.json() == {"detail": "Authentication required"}


@pytest.mark.asyncio
async def test_success_get_all_addresses(clear_db, address_factory, user_factory):
    async with httpx.AsyncClient(base_url="http://localhost:8000") as client:
        await user_factory(client, TEST_USER)

        address_data = AddressCreateDTO(city="Москва", street="Колотушкина", house_number=123)
        address: Address = await address_factory(client, address_data)

        response = await client.get("/api/addresses/")
        get_address = Address(**response.json()[0])

        assert response.status_code == 200
        assert get_address == address


@pytest.mark.asyncio
async def test_null_get_all_addresses(clear_db, address_factory, user_factory):
    async with httpx.AsyncClient(base_url="http://localhost:8000") as client:
        await user_factory(client, TEST_USER)

        response = await client.get("/api/addresses/")

        assert response.status_code == 200
        assert response.json() == []


@pytest.mark.asyncio
async def test_success_update_address(clear_db, address_factory, user_factory):
    async with httpx.AsyncClient(base_url="http://localhost:8000") as client:
        await user_factory(client, TEST_USER)

        address_data = AddressCreateDTO(city="Москва", street="Колотушкина", house_number=123)
        address: Address = await address_factory(client, address_data)

        address_update = AddressUpdateDTO(city="Санкт-Петербург", street="Пушкина", house_number=1)
        response = await client.patch(f"/api/addresses/{address.id}", json=address_update.model_dump())

        assert response.status_code == 200

        updated_address = Address(**response.json())

        assert updated_address.city == address_update.city
        assert updated_address.street == address_update.street
        assert updated_address.house_number == address_update.house_number


@pytest.mark.asyncio
async def test_not_found_update_address(clear_db, address_factory, user_factory):
    async with httpx.AsyncClient(base_url="http://localhost:8000") as client:
        await user_factory(client, TEST_USER)

        address_update = AddressUpdateDTO(city="Санкт-Петербург", street="Пушкина", house_number=1)
        response = await client.patch(f"/api/addresses/123", json=address_update.model_dump())

        assert response.status_code == 404
        assert response.json() == {"detail": "Not found"}


@pytest.mark.asyncio
async def test_success_delete_address(clear_db, address_factory, user_factory):
    async with httpx.AsyncClient(base_url="http://localhost:8000") as client:
        await user_factory(client, TEST_USER)

        address_data = AddressCreateDTO(city="Москва", street="Колотушкина", house_number=123)
        address: Address = await address_factory(client, address_data)

        response = await client.delete(f"/api/addresses/{address.id}")

        assert response.status_code == 200
        assert response.json() is None


@pytest.mark.asyncio
async def test_not_found_delete_address(clear_db, address_factory, user_factory):
    async with httpx.AsyncClient(base_url="http://localhost:8000") as client:
        await user_factory(client, TEST_USER)

        response = await client.delete(f"/api/addresses/123")

        assert response.status_code == 404
        assert response.json() == {"detail": "Not found"}



