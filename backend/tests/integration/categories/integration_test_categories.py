import datetime
import random

import pytest
import httpx
from httpx import Response

from src.categories.domain.entities import CategoryUpdate, Category
from src.categories.presentation.dtos import CategoryCreateDTO
from src.users.infrastructure.db.orm import UserRole
from src.users.presentation.dtos import UserCreateDTO

TEST_CATEGORY_DTO = CategoryCreateDTO(
    name="Пицца",
    photo="src/pizza.jpg"
)

TEST_SUPER_USER = UserCreateDTO(email="test@test.com", password="test12345", first_name="Test", last_name="Test", birthday=datetime.date(1990, 1, 1), role=UserRole.admin)


@pytest.mark.asyncio(loop_scope="session")
async def test_success_collect_categories(clear_db, user_factory):
    async with httpx.AsyncClient(base_url='http://localhost:8000') as client:
        await user_factory(client, TEST_SUPER_USER)
        await client.post("/api/categories/", json=TEST_CATEGORY_DTO.model_dump(mode="python"))
        response = await client.get("/api/categories/")
        categories = response.json()

        assert response.status_code == 200
        assert categories[0]['name'] == TEST_CATEGORY_DTO.name and categories[0]['photo'] == TEST_CATEGORY_DTO.photo


@pytest.mark.asyncio(loop_scope="session")
async def test_success_delete_category(clear_db, user_factory):
    async with httpx.AsyncClient(base_url='http://localhost:8000') as client:
        await user_factory(client, TEST_SUPER_USER)
        category_data = TEST_CATEGORY_DTO.model_dump()
        response = await client.post("/api/categories/", json=category_data)
        category = response.json()
        response_del = await client.delete(f"/api/categories/{category["id"]}")

        assert response_del.json() is None


@pytest.mark.asyncio(loop_scope="session")
async def test_not_found_delete_category(clear_db, user_factory):
    async with httpx.AsyncClient(base_url='http://localhost:8000') as client:
        await user_factory(client, TEST_SUPER_USER)
        category_data = TEST_CATEGORY_DTO.model_dump()
        response = await client.post("/api/categories/", json=category_data)
        category = response.json()
        category["id"] = random.randint(1, 100)
        deleted_response = await client.delete(f"/api/categories/{category["id"]}")

        assert deleted_response.status_code == 404
        assert deleted_response.json() == {"detail": f"Category with id {category["id"]} not found"}


@pytest.mark.asyncio(loop_scope="session")
async def test_success_update_category(clear_db, user_factory):
    async with httpx.AsyncClient(base_url="http://localhost:8000") as client:
        await user_factory(client, TEST_SUPER_USER)
        category_data = TEST_CATEGORY_DTO.model_dump()
        response = await client.post("/api/categories/", json=category_data)

        category_update = CategoryUpdate(**response.json())
        category_update.name = "Пирожки"

        updated = await client.patch(f"/api/categories/{category_update.id}", json=category_update.model_dump(mode="python"))
        updated = CategoryUpdate(**updated.json())

        assert response.status_code == 200
        assert updated.name == category_update.name


@pytest.mark.asyncio(loop_scope="session")
async def test_not_found_update_category(clear_db, user_factory):
    async with httpx.AsyncClient(base_url="http://localhost:8000") as client:
        await user_factory(client, TEST_SUPER_USER)
        category_data = TEST_CATEGORY_DTO.model_dump()
        response = await client.post("/api/categories/", json=category_data)

        category_update = CategoryUpdate(**response.json())
        category_update.name = "Пирожки"

        category_update.id = 2
        updated_response = await client.patch(f"/api/categories/{category_update.id}", json=category_update.model_dump(mode="python"))

        assert updated_response.status_code == 404
        assert updated_response.json() == {"detail": f"Category with id {category_update.id} not found"}


@pytest.mark.asyncio(loop_scope="session")
async def test_success_add_category(clear_db, user_factory):
    async with httpx.AsyncClient(base_url="http://localhost:8000") as client:
        await user_factory(client, TEST_SUPER_USER)
        category_data = TEST_CATEGORY_DTO.model_dump()
        response = await client.post("/api/categories/", json=category_data)
        category = Category(**response.json())

        assert response.status_code == 200
        assert category.name == TEST_CATEGORY_DTO.name and category.photo == TEST_CATEGORY_DTO.photo


@pytest.mark.asyncio(loop_scope="session")
async def test_already_exists_add_category(clear_db, user_factory):
    async with httpx.AsyncClient(base_url="http://localhost:8000") as client:
        await user_factory(client, TEST_SUPER_USER)
        category_data = TEST_CATEGORY_DTO.model_dump()
        response1 = await client.post("/api/categories/", json=category_data)
        response2 = await client.post("/api/categories/", json=category_data)

        assert response2.status_code == 409
        assert response2.json()["detail"] == f"Already exists"
