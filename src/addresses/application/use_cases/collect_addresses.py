from typing import List

from src.addresses.domain.entities import Address
from src.addresses.domain.interfaces.address_uow import IAddressUnitOfWork
from src.users.domain.entities import User


async def collect_addresses(uow: IAddressUnitOfWork, user: User) -> List[Address]:
    async with uow:
        addresses = await uow.addresses.get_all(user.id)
    return addresses
