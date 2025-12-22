from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint
from starlette.requests import Request
from starlette.responses import JSONResponse, Response

from src.auth.domain.entities import TokenType
from src.auth.domain.exceptions import RefreshTokenInvalid
from src.auth.presentation.dependencies import get_token_auth


class JWTRefreshMiddleware(BaseHTTPMiddleware):

    async def dispatch(self, request: Request, call_next) -> Response:
        pre_auth = get_token_auth(request)
        access_data = await pre_auth.read_token(TokenType.ACCESS)

        if not access_data:
            try:
                await pre_auth.refresh_access_token()
            except RefreshTokenInvalid:
                ...

        response = await call_next(request)

        post_auth = get_token_auth(request, response)
        refresh_data = await post_auth.read_token(TokenType.REFRESH)
        if refresh_data:
            await pre_auth.inject_access_token_from_request(response)

        return response
