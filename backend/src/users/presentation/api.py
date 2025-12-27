from fastapi import APIRouter
from starlette.requests import Request

from src.auth.application.use_cases.registration import registrate
from src.auth.presentation.dependencies import TokenAuthDep, PasswordHasherDep
from src.auth.presentation.dtos import RegisterUserDTO
from src.auth.presentation.permissions import access_control
from src.users.application.use_cases.create_user import create_user
from src.users.application.use_cases.delete_user import delete_user
from src.users.application.use_cases.information import information
from src.users.application.use_cases.update_password import update_password
from src.users.application.use_cases.update_user import update_user
from src.users.application.use_cases.collect_users import collect_users
from src.users.infrastructure.db.orm import UserRole
from src.users.presentation.dependencies import UserUoWDep
from src.users.presentation.dtos import UserPasswordUpdateDTO, UserUpdateDTO, UserCreateDTO

users_api_router = APIRouter()


@users_api_router.get("/me")
@access_control(role=UserRole.user)
async def get_user_info(uow: UserUoWDep,
                        auth: TokenAuthDep):
    return await information(uow, auth)


@users_api_router.post("/password")
@access_control(role=UserRole.user)
async def update_user_password(request: Request,
                               password_data: UserPasswordUpdateDTO,
                               pwd_hasher: PasswordHasherDep,
                               uow: UserUoWDep,
                               auth: TokenAuthDep):
    await update_password(password_data, request.state.user, auth, pwd_hasher, uow)
    return {"msg": "Password changed"}


@users_api_router.patch("/{id}")
@access_control(role=UserRole.admin)
async def update(id: int,
                 user_data: UserUpdateDTO,
                 uow: UserUoWDep,
                 auth: TokenAuthDep):
    await update_user(id, user_data, uow)
    return {"msg": f"User {id} updated"}


@users_api_router.get("/")
@access_control(role=UserRole.admin)
async def get_users(uow: UserUoWDep, auth: TokenAuthDep):
    return await collect_users(uow)


@users_api_router.post("/")
@access_control(role=UserRole.admin)
async def create(credentials: UserCreateDTO,
                 pwd_hasher: PasswordHasherDep,
                 uow: UserUoWDep,
                 auth: TokenAuthDep):
    return await create_user(credentials,
                             pwd_hasher,
                             uow,
                             auth)


@users_api_router.delete("/{id}")
@access_control(role=UserRole.admin)
async def delete(id: int,
                 uow: UserUoWDep,
                 auth: TokenAuthDep):
    return await delete_user(id, uow)
