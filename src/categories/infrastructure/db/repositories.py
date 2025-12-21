from abc import ABC
from typing import List
from uuid import UUID

from sqlalchemy import select, delete
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from src.categories.domain.entities import Category, CategoryCreate, CategoryUpdate
from src.categories.domain.interfaces.category_repo import ICategoryRepository
from src.categories.infrastructure.db.orm import CategoriesOrm
from src.core.domain.exceptions import NotFound, AlreadyExists


class PGCategoriesRepository(ICategoryRepository):

    def __init__(self, session: AsyncSession):
        super().__init__()
        self.session = session

    async def get_all(self) -> List[Category]:
        stmt = select(CategoriesOrm)

        result = await self.session.execute(stmt)
        result = result.unique().scalars().all()
        return [
            self._to_domain(category) for category in result
        ]

    async def get_one(self, id: id) -> Category:
        stmt = select(CategoriesOrm).where(CategoriesOrm.id == id)

        result = await self.session.execute(stmt)
        obj: CategoriesOrm = result.scalar_one_or_none()

        return self._to_domain(obj)

    async def delete(self, id: int):
        stmt = select(CategoriesOrm).where(CategoriesOrm.id == id)

        result = await self.session.execute(stmt)
        obj: CategoriesOrm = result.scalar_one_or_none()
        if not obj:
            raise NotFound(detail=f"Category with id {id} not found")

        await self.session.delete(obj)
        await self.session.flush()

    async def add(self, category: CategoryCreate) -> Category:
        obj = CategoriesOrm(**category.model_dump(mode="python"))
        self.session.add(obj)

        try:
            await self.session.flush()
        except IntegrityError as e:
            raise AlreadyExists()

        return self._to_domain(obj)

    async def update(self, category: CategoryUpdate) -> Category:
        stmt = select(CategoriesOrm).where(CategoriesOrm.id == category.id)
        result = await self.session.execute(stmt)
        obj: CategoriesOrm = result.scalar_one_or_none()

        if not obj:
            raise NotFound(detail=f"Category with id {category.id} not found")

        for field, value in category.model_dump(exclude_unset=True).items():
            setattr(obj, field, value)

        await self.session.flush()
        return self._to_domain(obj)

    @staticmethod
    def _to_domain(category: CategoriesOrm) -> Category:
        return Category(
            id=category.id,
            name=category.name,
            slug=category.slug,
            photo=category.photo
        )
