import datetime
import pytest

from src.auth.application.use_cases.authenication import authenticate
from src.auth.presentation.dtos import AuthUserDTO
from src.users.application.use_cases.information import information
from src.users.domain.entities import UserCreate
from src.users.domain.interfaces.user_uow import IUserUnitOfWork
from unittest.mock import MagicMock, AsyncMock


@pytest.mark.asyncio
async def test_information(monkeypatch, fake_user_uow: IUserUnitOfWork):
    user = UserCreate(first_name="Oleg",
                      last_name="Petrov",
                      hashed_password="random_password",
                      birthday=datetime.date(2000, 9, 11),
                      email="olegpetrov@gmail.com")

    user = await fake_user_uow.users.add(user)

    mock_hasher = MagicMock()
    mock_hasher.hash = MagicMock()
    mock_hasher.hash.return_value = True

    mock_auth = MagicMock()
    mock_auth.set_tokens = AsyncMock()
    mock_auth.get_token_id = AsyncMock()
    mock_auth.get_token_id.return_value = user.id

    auth_dto = AuthUserDTO(email=user.email, password="random_password")

    await authenticate(
        email=auth_dto.email,
        password=auth_dto.password,
        pwd_hasher=mock_hasher,
        auth=mock_auth,
        uow=fake_user_uow
    )

    result = await information(
        uow=fake_user_uow,
        auth=mock_auth
    )

    assert result.email == user.email

