import datetime
import pytest
import httpx

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
async def test_login_success(clear_db, user_factory):
    async with httpx.AsyncClient(base_url='http://localhost:8000') as client:
        await user_factory(client=client, user=TEST_USER_DTO)

        login_data = {"email": TEST_USER_DTO.email, "password": TEST_USER_DTO.password}
        await _login_and_set_cookies(client, login_data)


async def _login_and_set_cookies(client: httpx.AsyncClient, login_data: dict):
    response = await client.post("/api/auth/login", json=login_data)

    for token in ["access_token", "refresh_token"]:
        client.cookies.set(token, response.cookies.get(token))

    assert response.status_code == 200
    assert response.json() == {"msg": "Login successful"}
    assert (response.cookies.get("access_token") is not None and
            response.cookies.get("refresh_token") is not None)


@pytest.mark.asyncio(loop_scope="session")
async def test_login_not_found_user(clear_db, user_factory):
    async with httpx.AsyncClient(base_url='http://localhost:8000') as client:
        login_data = {"email": TEST_USER_DTO.email, "password": "123456791"}
        response = await client.post("/api/auth/login", json=login_data)

        assert response.status_code == 404
        assert response.json() == {"detail": f"User with email {TEST_USER_DTO.email} not found"}


@pytest.mark.asyncio(loop_scope="session")
async def test_login_invalid_credentials(clear_db, user_factory):
    async with httpx.AsyncClient(base_url='http://localhost:8000') as client:
        await user_factory(client=client, user=TEST_USER_DTO)
        login_data = {"email": TEST_USER_DTO.email, "password": "12345678"}
        response = await client.post("/api/auth/login", json=login_data)

        assert response.status_code == 401
        assert response.json() == {"detail": "Invalid email or password"}


@pytest.mark.asyncio(loop_scope="session")
async def test_register_already_user_exists(clear_db, user_factory):
    async with httpx.AsyncClient(base_url='http://localhost:8000') as client:
        # 1 try
        await user_factory(client=client, user=TEST_USER_DTO)

        # 2 try already exists
        response = await client.post("/api/auth/register", json=TEST_USER_DTO.model_dump(mode="json"))
        assert response.status_code == 409
        assert response.json() == {"detail": "Email is already taken"}


@pytest.mark.asyncio(loop_scope="session")
async def test_success_refresh_token(clear_db, user_factory):
    async with httpx.AsyncClient(base_url="http://localhost:8000") as client:
        user = await user_factory(client, TEST_USER_DTO)

        response = await client.post("/api/auth/refresh")

        assert response.json() == {"msg": "Token refreshed"}


@pytest.mark.asyncio(loop_scope="session")
async def test_not_authenticated_refresh_token(clear_db, user_factory):
    async with httpx.AsyncClient(base_url="http://localhost:8000") as client:
        response = await client.post("/api/auth/refresh")

        assert response.json() == {"detail": "Refresh token is not valid"}


@pytest.mark.asyncio(loop_scope="session")
async def test_without_access_refresh_token(clear_db, user_factory):
    async with httpx.AsyncClient(base_url="http://localhost:8000") as client1:
        await user_factory(client1, TEST_USER_DTO)

        response1 = await client1.post("/api/auth/refresh")

        response1.cookies.pop("access_token")

        assert response1.json() == {"msg": "Token refreshed"}


@pytest.mark.asyncio(loop_scope="session")
async def test_success_logout_user(clear_db, user_factory):
    async with httpx.AsyncClient(base_url="http://localhost:8000") as client:
        await user_factory(client, TEST_USER_DTO)

        response1 = await client.get("/api/users/me")

        assert response1.json()["first_name"] == TEST_USER_DTO.first_name

        response = await client.post("/api/auth/logout")

        assert response.status_code == 200
        assert response.json() == {"msg": "Logout successful"}




@pytest.mark.asyncio(loop_scope="session")
async def test_failed_logout_user(clear_db, user_factory):
    async with httpx.AsyncClient(base_url="http://localhost:8000") as client:
        async with httpx.AsyncClient(base_url="http://localhost:8000") as client:
            await user_factory(client, TEST_USER_DTO)

            response1 = await client.get("/api/users/me")
            assert response1.json()["first_name"] == TEST_USER_DTO.first_name

            response2 = await client.post("/api/auth/logout")

            assert response2.status_code == 200
            assert response2.json() == {"msg": "Logout successful"}

            response3 = await client.get("/api/users/me")

            assert response3.status_code == 401
            assert response3.json() == {"detail": "Authentication required"}





