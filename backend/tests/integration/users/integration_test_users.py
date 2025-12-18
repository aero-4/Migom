import datetime
import pytest
import httpx
from httpx import Response

from scripts.create_super_user import create_super_user
from src.auth.application.use_cases.authenication import authenticate
from src.auth.presentation.dtos import AuthUserDTO
from src.users.infrastructure.db.orm import UserRole
from src.users.presentation.dtos import UserCreateDTO, UserPasswordUpdateDTO, UserUpdateDTO
from src.utils.strings import generate_random_alphanum

TEST_USER_DTO = UserCreateDTO(
    email="olegtinkov@gmail.com",
    password="securepass",
    first_name="Oleg",
    last_name="Tinkov",
    birthday=datetime.date(2025, 1, 1),
    role=UserRole.user
)


@pytest.mark.asyncio(loop_scope="session")
async def test_get_me_success(clear_db, user_factory):
    async with httpx.AsyncClient(base_url='http://localhost:8000') as client:
        await user_factory(client, TEST_USER_DTO)

        response2 = await client.get("/api/users/me")

        assert response2.json() == TEST_USER_DTO.model_dump(exclude={"password"}, mode="json")


@pytest.mark.asyncio(loop_scope="session")
async def test_user_permission_denied(clear_db, user_factory):
    async with httpx.AsyncClient(base_url='http://localhost:8000') as client:
        response2 = await client.get("/api/users/me")

        assert response2.status_code == 401
        assert response2.json() == {"detail": "Authentication required"}


@pytest.mark.asyncio(loop_scope="session")
async def test_allowed_paths_user(clear_db, user_factory):
    async with httpx.AsyncClient(base_url='http://localhost:8000') as client:
        # allowed
        user = await user_factory(client, TEST_USER_DTO)

        response2 = await client.get("/api/users/me")

        assert response2.status_code == 200
        assert response2.json() == TEST_USER_DTO.model_dump(exclude={"password"}, mode="json")


@pytest.mark.asyncio(loop_scope="session")
async def test_forbidden_paths_user(clear_db, user_factory):
    async with httpx.AsyncClient(base_url='http://localhost:8000') as client:
        response3 = await client.get("/api/orders/")
        assert response3.status_code == 401

        response4 = await client.get("/api/addresses/")
        assert response4.status_code == 401

        response5 = await client.get("/api/payments/")
        assert response5.status_code == 401


@pytest.mark.asyncio(loop_scope="session")
async def test_success_change_password(clear_db, user_factory):
    async with httpx.AsyncClient(base_url='http://localhost:8000') as client:
        user = await user_factory(client, TEST_USER_DTO)
        password = UserPasswordUpdateDTO(password=TEST_USER_DTO.password, new_password=generate_random_alphanum())
        response = await client.post("/api/users/password", json=password.model_dump())

        assert response.status_code == 200
        assert response.json() == {"msg": "Password changed"}



@pytest.mark.asyncio(loop_scope="session")
async def test_not_valid_old_password_change_password(clear_db, user_factory):
    async with httpx.AsyncClient(base_url='http://localhost:8000') as client:
        user = await user_factory(client, TEST_USER_DTO)
        password = UserPasswordUpdateDTO(password=TEST_USER_DTO.password + "1", new_password=generate_random_alphanum())
        response = await client.post("/api/users/password", json=password.model_dump())

        assert response.status_code == 400
        assert response.json() == {"detail": "Current password is invalid"}


@pytest.mark.asyncio(loop_scope="session")
async def test_fail_change_password(clear_db, user_factory):
    async with httpx.AsyncClient(base_url='http://localhost:8000') as client:
        user = await user_factory(client, TEST_USER_DTO)
        response = await client.post("/api/users/password", json={"password": "newpas", "new_password": "alex2131231"})

        assert response.status_code == 422
        assert response.json()["detail"][0]["msg"] == "String should have at least 8 characters"



@pytest.mark.asyncio(loop_scope="session")
async def test_not_found_user_change_password(clear_db, user_factory):
    async with httpx.AsyncClient(base_url='http://localhost:8000') as client:
        response = await client.post("/api/users/password", json={"password": "newpas12345", "new_password": "alex2131231"})

        assert response.status_code == 401
        assert response.json() == {"detail": "Authentication required"}


@pytest.mark.asyncio(loop_scope="session")
async def test_success_update_user(clear_db, user_factory):
    async with httpx.AsyncClient(base_url='http://localhost:8000') as client:
        TEST_USER_DTO.first_name = f"test{generate_random_alphanum(6)}"
        TEST_USER_DTO.last_name = f"test{generate_random_alphanum(6)}"
        TEST_USER_DTO.email = f"TEST{generate_random_alphanum(12)}@gmail.com"

        email, password = await create_super_user(TEST_USER_DTO.email)
        response = await client.post(f"/api/auth/login",
                                     json=AuthUserDTO(email=email, password=password).model_dump(mode="python"))

        client.cookies.clear()
        client.cookies.set("access_token", response.cookies.get("access_token"))
        client.cookies.set("refresh_token", response.cookies.get("refresh_token"))

        assert response.status_code == 200
        assert response.json() == {"msg": "Login successful"}

        update = UserUpdateDTO(role=UserRole.courier)
        response2 = await client.patch(f"/api/users/1", json=update.model_dump(mode="json"))

        assert response2.status_code == 200
        assert response2.json() == {"msg": f"User 1 updated"}


@pytest.mark.asyncio(loop_scope="session")
async def test_forbidden_update_user(clear_db, user_factory):
    async with httpx.AsyncClient(base_url='http://localhost:8000') as client:
        await user_factory(client, TEST_USER_DTO)

        update = UserUpdateDTO(role=UserRole.courier)
        response = await client.patch(f"/api/users/1", json=update.model_dump(mode="json"))
        assert response.status_code == 403
        assert response.json() == {"detail": f"Permission denied"}