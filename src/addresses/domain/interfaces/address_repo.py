import abc
from typing import List

from src.addresses.domain.entities import AddressCreate, Address, AddressUpdate


class IAddressRepository(abc.ABC):

    @abc.abstractmethod
    async def add(self, address_data: AddressCreate) -> Address:
        ...

    @abc.abstractmethod
    async def get_all(self, user_id: int) -> List[Address]:
        ...

    @abc.abstractmethod
    async def update(self, address_data: AddressUpdate) -> Address:
        ...

    @abc.abstractmethod
    async def delete(self, id: int, user_id: int) -> None:
        ...
