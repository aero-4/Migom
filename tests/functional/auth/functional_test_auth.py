import datetime
import pytest
import httpx
import random
from src.users.infrastructure.db.orm import UserRole
from src.users.presentation.dtos import UserCreateDTO

TEST_USER_DTO = UserCreateDTO(
    email="olegtinkov@gmail.com",
    password="securepass",
    first_name="Oleg",
    last_name="Tinkov",
    birthday=datetime.date(2025, 1, 1),
)


@pytest.mark.asyncio(loop_scope="session")
async def test_create_all_users_roles(user_factory):
    async with httpx.AsyncClient(base_url='http://localhost:8000') as client:
        TEST_USER_DTO.role = UserRole.admin
        TEST_USER_DTO.email = f"test{random.randint(1000, 9999)}@gmail.com"
        await user_factory(client, TEST_USER_DTO)
        print(f"Role - {UserRole.admin} {TEST_USER_DTO.email} {TEST_USER_DTO.password}")

        TEST_USER_DTO.role = UserRole.courier
        TEST_USER_DTO.email = f"test{random.randint(1000, 9999)}@gmail.com"
        await user_factory(client, TEST_USER_DTO)
        print(f"Role - {UserRole.courier} {TEST_USER_DTO.email} {TEST_USER_DTO.password}")

        TEST_USER_DTO.role = UserRole.cook
        TEST_USER_DTO.email = f"test{random.randint(1000, 9999)}@gmail.com"
        await user_factory(client, TEST_USER_DTO)
        print(f"Role - {UserRole.cook} {TEST_USER_DTO.email} {TEST_USER_DTO.password}")

        TEST_USER_DTO.role = UserRole.user
        TEST_USER_DTO.email = f"test{random.randint(1000, 9999)}@gmail.com"
        await user_factory(client, TEST_USER_DTO)
        print(f"Role - {UserRole.user} {TEST_USER_DTO.email} {TEST_USER_DTO.password}")
