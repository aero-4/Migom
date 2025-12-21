from abc import ABC

from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from src.users.domain.entities import User, UserCreate, UserUpdate
from src.users.domain.exceptions import UserAlreadyExists, UserNotFound
from src.users.domain.interfaces.user_repo import IUserRepository
from src.users.infrastructure.db.orm import UsersOrm


class PGUserRepository(IUserRepository):
    def __init__(self, session: AsyncSession) -> None:
        super().__init__()
        self.session = session

    async def add(self, user: UserCreate) -> User:
        obj = UsersOrm(**user.model_dump(mode='python'))
        self.session.add(obj)

        try:
            await self.session.flush()
        except IntegrityError as e:
            print(e)
            raise UserAlreadyExists()

        return self._to_domain(obj)

    async def get_by_email(self, email: str) -> User:
        stmt = select(UsersOrm).where(UsersOrm.email == email)
        result = await self.session.execute(stmt)
        obj: UsersOrm = result.scalar_one_or_none()

        if not obj:
            raise UserNotFound(detail=f"User with email {email} not found")

        return self._to_domain(obj)

    async def get_by_id(self, id: int) -> User:
        obj: UsersOrm | None = await self.session.get(UsersOrm, id)
        if not obj:
            raise UserNotFound(detail=f"User not found")

        return self._to_domain(obj)

    async def get_all(self):
        stmt = select(UsersOrm)

        result = await self.session.execute(stmt)
        objs = [self._to_domain(i) for i in result.scalars().all()]

        return objs

    async def delete(self, user: User):
        stmt = select(UsersOrm).where(UsersOrm.id == user.id)
        result = await self.session.execute(stmt)
        obj: UsersOrm = result.scalar_one_or_none()

        if not obj:
            raise UserNotFound(detail=f"User with id {user.id} not found")

        await self.session.delete(obj)
        await self.session.flush()

    async def update(self, user_data: UserUpdate) -> User:
        stmt = select(UsersOrm).where(UsersOrm.id == user_data.id)
        result = await self.session.execute(stmt)
        obj: UsersOrm = result.scalar_one_or_none()

        if not obj:
            raise UserNotFound(detail=f"User with id {user_data.id} not found")

        for field, value in user_data.model_dump(exclude_none=True).items():
            setattr(obj, field, value)

        await self.session.flush()

        return self._to_domain(obj)

    @staticmethod
    def _to_domain(obj: UsersOrm) -> User:
        return User(
            id=obj.id,
            birthday=obj.birthday,
            email=obj.email,
            hashed_password=obj.hashed_password,
            first_name=obj.first_name,
            last_name=obj.last_name,
            role=obj.role,
        )
