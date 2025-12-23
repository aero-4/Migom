from typing import List

from src.categories.domain.entities import Category, CategoryCreate, CategoryUpdate
from src.categories.domain.interfaces.category_repo import ICategoryRepository
from src.users.domain.exceptions import UserNotFound
from src.users.domain.interfaces.user_uow import IUserUnitOfWork


class FakeCategoryRepository(ICategoryRepository):
    def __init__(self):
        self._categories = []
        self._last_user_id = 0

    async def add(self, category: CategoryCreate) -> Category:
        category = Category(id=self._get_new_user_id(), **category.model_dump())
        self._categories.append(category)
        return category

    async def get_by_pk(self, pk: int) -> Category:
        for category in self._categories:
            if category.id == pk:
                return category

        raise UserNotFound(detail=f"Category with id {pk} not found")

    async def get_all(self) -> List[Category]:
        return self._categories

    async def get_one(self, id: int) -> Category:
        await self.get_by_pk(id)

    async def delete(self, id: int) -> None:
        category = await self.get_by_pk(id)
        self._categories.remove(category)

    async def update(self, category_data: CategoryUpdate) -> Category:
        category = await self.get_by_pk(category_data.id)

        for field, value in category_data.model_dump(exclude_unset=True).items():
            setattr(category, field, value)

        return category

    def _get_new_user_id(self) -> int:
        self._last_user_id += 1
        return self._last_user_id


class FakeCategoryUnitOfWork(IUserUnitOfWork):
    categories: ICategoryRepository

    def __init__(self):
        self.categories = FakeCategoryRepository()
        self.committed = False

    async def _commit(self):
        self.committed = True

    async def rollback(self):
        pass
