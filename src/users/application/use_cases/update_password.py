from src.auth.presentation.dependencies import TokenAuthDep, PasswordHasherDep
from src.core.domain.exceptions import BadRequest
from src.users.domain.entities import User, UserUpdate
from src.users.presentation.dependencies import UserUoWDep
from src.users.presentation.dtos import UserPasswordUpdateDTO


async def update_password(password_data: UserPasswordUpdateDTO,
                          user: User,
                          auth: TokenAuthDep,
                          pwd_hasher: PasswordHasherDep,
                          uow: UserUoWDep) -> None:
    user_update = UserUpdate(id=user.id)
    async with uow:
        if not pwd_hasher.verify(password_data.password, user.hashed_password):
            raise BadRequest(detail="Current password is invalid")

        user_update.hashed_password = pwd_hasher.hash(password_data.new_password)

        await uow.users.update(user_update)
        await auth.set_tokens(user)
        await uow.commit()
