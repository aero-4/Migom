import uuid

from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint
from starlette.requests import Request
from starlette.responses import Response

from src.auth.domain.entities import TokenType, AnonymousUser
from src.auth.presentation.dependencies import get_token_auth
from src.users.infrastructure.db.unit_of_work import PGUserUnitOfWork


class AuthenticationMiddleware(BaseHTTPMiddleware):


    async def dispatch(self, request: Request, call_next: RequestResponseEndpoint) -> Response:
        jwt_auth = get_token_auth(request=request)
        token_data = await jwt_auth.read_token(TokenType.ACCESS)

        if not token_data:
            request.state.user = AnonymousUser()
        else:
            async with PGUserUnitOfWork() as uow:
                try:
                    if user := await uow.users.get_by_id(token_data.user_id):
                        request.state.user = user or AnonymousUser()
                except:
                    request.state.user = AnonymousUser()

        response = await call_next(request)
        return response
