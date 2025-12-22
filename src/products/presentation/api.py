from fastapi import APIRouter

from src.auth.presentation.dependencies import TokenAuthDep
from src.auth.presentation.permissions import access_control
from src.products.application.use_cases.collect_product import collect_products, collect_product, collect_products_by_filters
from src.products.application.use_cases.create_product import create_product
from src.products.application.use_cases.delete_product import delete_product
from src.products.application.use_cases.update_product import update_product
from src.products.presentation.dependencies import ProductUoWDep
from src.products.presentation.dtos import ProductCreateDTO, ProductUpdateDTO, SearchDataDTO
from src.users.infrastructure.db.orm import UserRole

products_api_router = APIRouter()


@products_api_router.get("/")
async def get_products(uow: ProductUoWDep):
    return await collect_products(uow)


@products_api_router.get("/{product_id}")
async def get(product_id: int, uow: ProductUoWDep):
    return await collect_product(product_id, uow)



@products_api_router.post("/search")
async def search(search_data: SearchDataDTO, uow: ProductUoWDep):
    return await collect_products_by_filters(search_data, uow)


@products_api_router.post("/")
@access_control(role=UserRole.admin)
async def add(product_data: ProductCreateDTO, uow: ProductUoWDep, auth: TokenAuthDep):
    return await create_product(product_data, uow)


@products_api_router.patch("/{product_id}")
@access_control(role=UserRole.admin)
async def patch(product_id: int, product_data: ProductUpdateDTO, uow: ProductUoWDep, auth: TokenAuthDep):
    return await update_product(product_id, product_data, uow)


@products_api_router.delete("/{product_id}")
@access_control(role=UserRole.admin)
async def delete(product_id: int, uow: ProductUoWDep, auth: TokenAuthDep):
    return await delete_product(product_id, uow)
