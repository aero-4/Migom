from typing import Annotated

from fastapi import Depends

from src.addresses.domain.interfaces.address_uow import IAddressUnitOfWork
from src.addresses.infrastructure.db.unit_of_work import AddressUnitOfWork


def get_address_uow() -> IAddressUnitOfWork:
    return AddressUnitOfWork()


AddressUoWDeps = Annotated[IAddressUnitOfWork, Depends(get_address_uow)]