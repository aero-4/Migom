from src.auth.domain.entities import TokenType, TokenData
from src.auth.presentation.dependencies import TokenAuthDep
from src.core.domain.exceptions import PermissionDenied, NotAuthenticated
from src.users.domain.entities import UserInfo, User
from src.users.domain.exceptions import UserNotFound
from src.users.domain.interfaces.user_repo import IUserRepository
from src.users.domain.interfaces.user_uow import IUserUnitOfWork


async def information(uow: IUserUnitOfWork, auth: TokenAuthDep) -> UserInfo:
    async with uow:
        user_data: TokenData = await auth.read_token(TokenType.ACCESS)
        user: User = await uow.users.get_by_id(user_data.user_id)

    user_info = UserInfo(first_name=user.first_name,
                         last_name=user.last_name,
                         birthday=user.birthday,
                         email=user.email,
                         role=user.role)
    return user_info
