from fastapi import APIRouter, Depends, HTTPException, status

from src.auth.application.use_cases.authenication import authenticate
from src.auth.application.use_cases.registration import registrate
from src.auth.presentation.dependencies import PasswordHasherDep, TokenAuthDep
from src.auth.presentation.dtos import AuthUserDTO, RegisterUserDTO
from src.users.presentation.dependencies import UserUoWDep

auth_api_router = APIRouter()


@auth_api_router.post("/login")
async def login(credentials: AuthUserDTO,
                pwd_hasher: PasswordHasherDep,
                uow: UserUoWDep,
                auth: TokenAuthDep):
    await authenticate(credentials.email, credentials.password, pwd_hasher, uow, auth)
    return {"msg": "Login successful"}


@auth_api_router.post("/register")
async def register(credentials: RegisterUserDTO,
                   pwd_hasher: PasswordHasherDep,
                   uow: UserUoWDep,
                   auth: TokenAuthDep):
    await registrate(credentials.email, credentials.password, credentials.first_name, credentials.last_name, birthday=credentials.birthday, role=credentials.role, pwd_hasher=pwd_hasher, uow=uow, auth=auth)
    return {"msg": "Register successful"}


@auth_api_router.post("/refresh")
async def refresh(auth: TokenAuthDep):
    await auth.refresh_access_token()
    return {"msg": "Token refreshed"}


@auth_api_router.post("/logout")
async def logout(auth: TokenAuthDep):
    await auth.unset_tokens()
    return {"msg": "Logout successful"}
