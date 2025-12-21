import logging

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from src.addresses.domain.entities import AddressCreate, Address, AddressUpdate
from src.addresses.domain.interfaces.address_repo import IAddressRepository
from src.addresses.infrastructure.db.orm import AddressesOrm
from src.core.domain.exceptions import AlreadyExists, NotFound


class PGAddressRepository(IAddressRepository):

    def __init__(self, session: AsyncSession):
        self.session = session

    async def add(self, address_data: AddressCreate) -> Address:
        obj = AddressesOrm(**address_data.model_dump())
        self.session.add(obj)

        try:
            await self.session.flush()
        except Exception as ex:
            logging.exception(ex, exc_info=True)
            raise AlreadyExists()

        return self._to_domain(obj)

    async def get_all(self, user_id: int) -> list[Address]:
        stmt = select(AddressesOrm).where(AddressesOrm.user_id == user_id)
        result = await self.session.execute(stmt)
        objs: list[AddressesOrm] = result.scalars().all()
        return [self._to_domain(obj) for obj in objs]

    async def update(self, address_update: AddressUpdate) -> Address:
        stmt = select(AddressesOrm).where(AddressesOrm.id == address_update.id and AddressesOrm.user_id == address_update.user_id)
        result = await self.session.execute(stmt)
        obj: AddressesOrm | None = result.scalar_one_or_none()

        if not obj:
            raise NotFound()

        for field, value in address_update.model_dump(exclude_unset=True).items():
            setattr(obj, field, value)

        await self.session.flush()

        return self._to_domain(obj)

    async def delete(self, id: int, user_id: int) -> None:
        stmt = select(AddressesOrm).where(AddressesOrm.id == id and AddressesOrm.user_id == user_id)
        result = await self.session.execute(stmt)
        obj: AddressesOrm = result.scalar_one_or_none()

        if not obj:
            raise NotFound()

        await self.session.delete(obj)
        await self.session.flush()

    @staticmethod
    def _to_domain(obj: AddressesOrm) -> Address:
        return Address(
            id=obj.id,
            user_id=obj.user_id,
            city=obj.city,
            street=obj.street,
            house_number=obj.house_number,
            entrance=obj.entrance,
            floor=obj.floor,
            apartment_number=obj.apartment_number,
            comment=obj.comment,
            is_leave_at_door=obj.is_leave_at_door
        )
