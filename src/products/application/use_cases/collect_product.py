from typing import List

from src.products.domain.entities import Product, SearchData
from src.products.infrasctructure.db.unit_of_work import PGProductUnitOfWork
from src.products.presentation.dtos import SearchDataDTO


async def collect_products(
        uow: PGProductUnitOfWork,
) -> List[Product]:
    async with uow:
        products = await uow.products.get_all()
    return products


async def collect_products_by_filters(search: SearchDataDTO, uow: PGProductUnitOfWork) -> List[Product]:
    search_data = SearchData(**search.model_dump())

    async with uow:
        products = await uow.products.get_by_filters(search_data)
    return products


async def collect_product(
        id_pk: int,
        uow: PGProductUnitOfWork,
) -> Product:
    async with uow:
        product = await uow.products.get_one(id_pk)
    return product
