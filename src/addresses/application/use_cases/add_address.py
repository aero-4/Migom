from src.addresses.domain.entities import Address, AddressCreate
from src.addresses.domain.interfaces.address_uow import IAddressUnitOfWork
from src.addresses.presentation.dtos import AddressCreateDTO
from src.auth.domain.entities import TokenType
from src.auth.presentation.dependencies import TokenAuthDep
from src.core.domain.exceptions import NotAuthenticated
from src.users.domain.entities import User


async def add_address(address_data: AddressCreateDTO, uow: IAddressUnitOfWork, user: User) -> Address:
    address = AddressCreate(user_id=user.id, **address_data.model_dump())

    async with uow:
        address = await uow.addresses.add(address)
        await uow.commit()
    return address
