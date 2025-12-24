from fastapi import APIRouter
from starlette.requests import Request

from src.addresses.application.use_cases.add_address import add_address
from src.addresses.application.use_cases.collect_addresses import collect_addresses, collect_all_addresses
from src.addresses.application.use_cases.delete_address import delete_address
from src.addresses.application.use_cases.update_address import update_address
from src.addresses.presentation.dependencies import AddressUoWDeps
from src.addresses.presentation.dtos import AddressUpdateDTO, AddressCreateDTO
from src.auth.presentation.permissions import access_control
from src.users.infrastructure.db.orm import UserRole

addresses_api_router = APIRouter()


@addresses_api_router.post("/")
@access_control(role=UserRole.user)
async def add(request: Request, address_data: AddressCreateDTO, uow: AddressUoWDeps):
    return await add_address(address_data, uow, request.state.user)


@addresses_api_router.get("/")
@access_control(role=UserRole.user)
async def get_all(request: Request, uow: AddressUoWDeps):
    return await collect_addresses(uow, request.state.user)


@addresses_api_router.delete("/{id}")
@access_control(role=UserRole.user)
async def delete(request: Request, id: int, uow: AddressUoWDeps):
    return await delete_address(id, request.state.user, uow)


@addresses_api_router.patch("/{id}")
@access_control(role=UserRole.user)
async def update(request: Request, id: int, address_update: AddressUpdateDTO, uow: AddressUoWDeps):
    return await update_address(id, request.state.user, address_update, uow)


@addresses_api_router.get("/all")
@access_control(role=UserRole.admin)
async def get_all(request: Request, uow: AddressUoWDeps):
    return await collect_all_addresses(uow)