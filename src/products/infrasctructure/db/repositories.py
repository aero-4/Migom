from typing import List, Any, Coroutine

from sqlalchemy import select, or_, func
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from src.core.domain.exceptions import AlreadyExists, NotFound
from src.products.domain.entities import Product, ProductCreate, ProductUpdate, SearchData
from src.products.domain.interfaces.product_repo import IProductRepository
from src.products.infrasctructure.db.orm import ProductsOrm


class PGProductsRepository(IProductRepository):

    def __init__(self, session: AsyncSession):
        super().__init__()
        self.session = session

    async def get_all(self) -> list[Product]:
        stmt = select(ProductsOrm)

        result = await self.session.execute(stmt)
        result = result.unique().scalars().all()
        return [
            self._to_domain(product) for product in result
        ]

    async def get_by_filters(self, search: SearchData):
        stmt = (
            select(ProductsOrm)
            .filter(
                or_(ProductsOrm.name.ilike(f"%{search.name}%"),
                    ProductsOrm.category_id == search.category_id,
                    ProductsOrm.price == search.price,
                    ProductsOrm.grams == search.grams,
                    ProductsOrm.protein == search.protein,
                    ProductsOrm.fats == search.fats,
                    ProductsOrm.carbohydrates == search.carbohydrates))
        )
        result = await self.session.execute(stmt)
        result: List[ProductsOrm] = result.scalars().all()

        return [
            self._to_domain(product) for product in result
        ]

    async def get_one(self, id: int) -> Product:
        stmt = select(ProductsOrm).where(ProductsOrm.id == id)

        result = await self.session.execute(stmt)
        obj: ProductsOrm = result.scalar_one_or_none()
        if not obj:
            raise NotFound()

        return self._to_domain(obj)

    async def add(self, product: ProductCreate) -> Product:
        obj: ProductsOrm = ProductsOrm(**product.model_dump(mode="python"))
        self.session.add(obj)

        try:
            await self.session.flush()
        except IntegrityError as e:
            print(e)
            raise AlreadyExists()

        return self._to_domain(obj)

    async def delete(self, id: int) -> None:
        stmt = select(ProductsOrm).where(ProductsOrm.id == id)

        result = await self.session.execute(stmt)
        obj: ProductsOrm = result.scalar_one_or_none()
        if not obj:
            raise NotFound()

        await self.session.delete(obj)
        await self.session.flush()

    async def update(self, product_data: ProductUpdate) -> Product:
        stmt = select(ProductsOrm).where(ProductsOrm.id == product_data.id)

        result = await self.session.execute(stmt)
        obj: ProductsOrm = result.scalar_one_or_none()
        if not obj:
            raise NotFound()

        for key, value in product_data.model_dump(mode="python", exclude_none=True).items():
            setattr(obj, key, value)

        await self.session.flush()

        return self._to_domain(obj)

    @staticmethod
    def _to_domain(product: ProductsOrm):
        return Product(
            id=product.id,
            created_at=product.created_at,
            updated_at=product.updated_at,
            name=product.name,
            content=product.content,
            composition=product.composition,
            price=product.price,
            discount_price=product.discount_price,
            discount=product.discount,
            count=product.count,
            kilocalorie=product.kilocalorie,
            grams=product.grams,
            protein=product.protein,
            fats=product.fats,
            carbohydrates=product.carbohydrates,
            photo=product.photo,
            category_id=product.category_id,
        )
