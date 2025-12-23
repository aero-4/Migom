import asyncio
import random

from typing import Any

from src.auth.presentation.dependencies import get_password_hasher
from src.users.domain.entities import UserCreate
from src.users.infrastructure.db.orm import UserRole
from src.users.presentation.dependencies import get_user_uow
from src.utils.strings import generate_random_alphanum


async def create_super_user(email: str, role: int, uow=get_user_uow(), pwd_hasher=get_password_hasher()) -> tuple[Any, str]:
    random_password = generate_random_alphanum()
    async with uow:
        user_create = UserCreate(email=email,
                                 hashed_password=pwd_hasher.hash(random_password),
                                 first_name=f"{random.randint(100000, 999999)}",
                                 last_name=f"{random.randint(100000, 999999)}",
                                 role=role,)
        user = await uow.users.add(user_create)
        await uow.commit()

    print(f"Success!\n\n Email: {user.email} \n Password: {random_password}")
    return user.email, random_password

if __name__ == "__main__":
    email = input("Input your email: ")
    role = int(input(f"Choice role (admin - {UserRole.admin}, cook - {UserRole.cook}, courier - {UserRole.courier}, user - {UserRole.user}): "))

    asyncio.run(create_super_user(email, role))
