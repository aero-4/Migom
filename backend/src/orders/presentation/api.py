from fastapi import APIRouter
from starlette.requests import Request

from src.auth.presentation.dependencies import TokenAuthDep
from src.auth.presentation.permissions import access_control
from src.orders.application.use_cases.collect_orders import collect_order, collect_orders, search_orders
from src.orders.application.use_cases.delete_order import delete_order
from src.orders.application.use_cases.new_order import new_order
from src.orders.application.use_cases.update_order import update_order
from src.orders.presentation.dependencies import OrderUoWDeps
from src.orders.presentation.dtos import OrderCreateDTO, OrderUpdateDTO, OrderSearchDTO

orders_api_router = APIRouter()


@orders_api_router.post("/")
@access_control(open=False)
async def create(request: Request, order: OrderCreateDTO, uow: OrderUoWDeps):
    return await new_order(order, uow, request.state.user)


@orders_api_router.get("/")
@access_control(open=False)
async def get_all(request: Request, uow: OrderUoWDeps):
    return await collect_orders(uow, request.state.user)


@orders_api_router.post("/search")
@access_control(superuser=True)
async def search(order_data: OrderSearchDTO, uow: OrderUoWDeps, auth: TokenAuthDep):
    return await search_orders(order_data.status, uow)


@orders_api_router.patch("/{id}")
@access_control(superuser=True)
async def update(id: int, order: OrderUpdateDTO, uow: OrderUoWDeps, auth: TokenAuthDep):
    return await update_order(id, order, uow)


@orders_api_router.delete("/{id}")
@access_control(superuser=True)
async def delete(id: int, uow: OrderUoWDeps, auth: TokenAuthDep):
    return await delete_order(id, uow)


@orders_api_router.get("/{id}")
@access_control(superuser=True)
async def get_one(id: int, uow: OrderUoWDeps, auth: TokenAuthDep):
    return await collect_order(id, uow)
