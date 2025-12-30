import functools
from typing import Callable, Any

from fastapi import HTTPException
from starlette.requests import Request

from src.auth.domain.entities import AnonymousUser
from src.core.domain.exceptions import PermissionDenied, AuthRequired
from src.users.infrastructure.db.orm import UserRole


class access_control:

    def __init__(self, role: list[Any] | Any = None):
        self.role = role
        self.current_user = None

        self.request: Request | None = None
        self.headers: dict[Any, Any] | None = None
        self.auth_header: str | None = None
        self.token: str | None = None

    def __call__(self, function) -> Callable[..., Any]:

        @functools.wraps(function)
        async def decorated(*args, **kwargs):
            await self.parse_request(**kwargs)

            is_allowed = await self.verify_request(*args, **kwargs)
            if not is_allowed:
                raise HTTPException(403, "Not allowed")

            return await function(*args, **kwargs)

        return decorated

    async def parse_request(self, **kwargs) -> None:
        request = getattr(kwargs.get("auth"), "request", None) or kwargs.get("request")
        user = getattr(request, "state", None) and getattr(request.state, "user", None)

        self.current_user = user if user is not None else AnonymousUser()
        return None

    async def verify_request(self, *args, **kwargs) -> bool:
        if not self.current_user or not self.current_user.role:
            raise AuthRequired()


        if isinstance(self.role, list) and self.current_user.role not in self.role:
            raise PermissionDenied()

        if isinstance(self.role, int) and self.role > self.current_user.role:
            raise PermissionDenied()



        return True
