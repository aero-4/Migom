import abc
from typing import List

from src.products.domain.entities import Product, ProductCreate, ProductUpdate, SearchData


class IProductRepository(abc.ABC):

    @abc.abstractmethod
    async def get_all(self) -> List[Product]:
        ...

    @abc.abstractmethod
    async def get_by_filters(self, search: SearchData) -> List[Product]:
        ...

    @abc.abstractmethod
    async def get_one(self, id: int) -> Product:
        ...

    @abc.abstractmethod
    async def add(self, product: ProductCreate) -> Product:
        ...

    @abc.abstractmethod
    async def update(self, product: ProductUpdate) -> Product:
        ...

    @abc.abstractmethod
    async def delete(self, id: int) -> Product:
        ...
