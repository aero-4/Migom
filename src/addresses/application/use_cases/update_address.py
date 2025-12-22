from src.addresses.domain.entities import Address, AddressUpdate
from src.addresses.domain.interfaces.address_uow import IAddressUnitOfWork
from src.addresses.presentation.dtos import AddressUpdateDTO
from src.users.domain.entities import User


async def update_address(id: int, user: User, address_update: AddressUpdateDTO, uow: IAddressUnitOfWork) -> Address:
    address_data = AddressUpdate(id=id, user_id=user.id, **address_update.model_dump())
    async with uow:
        address = await uow.addresses.update(address_data)
        await uow.commit()

    return address
