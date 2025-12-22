from fastapi import APIRouter
from starlette.requests import Request

from src.auth.presentation.dependencies import TokenAuthDep, PasswordHasherDep
from src.auth.presentation.permissions import access_control
from src.users.application.use_cases.information import information
from src.users.application.use_cases.update_password import update_password
from src.users.application.use_cases.update_user import update_user
from src.users.infrastructure.db.orm import UserRole
from src.users.presentation.dependencies import UserUoWDep
from src.users.presentation.dtos import UserPasswordUpdateDTO, UserUpdateDTO

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
async def update_user_role(id: int,
                           user_data: UserUpdateDTO,
                           uow: UserUoWDep,
                           auth: TokenAuthDep):
    await update_user(id, user_data, uow)
    return {"msg": f"User {id} updated"}