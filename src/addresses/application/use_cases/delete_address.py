from src.addresses.domain.interfaces.address_uow import IAddressUnitOfWork
from src.users.domain.entities import User


async def delete_address(address_id: int, user: User, uow: IAddressUnitOfWork) -> None:
    async with uow:
        await uow.addresses.delete(address_id, user.id)
        await uow.commit()

