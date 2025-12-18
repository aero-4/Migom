from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint
from starlette.requests import Request
from starlette.responses import JSONResponse, Response

from src.users.domain.entities import User


class SecurityMiddleware(BaseHTTPMiddleware):
    """
        Middleware to restrict access to secure paths.

        If the current user is not a superuser and tries to access a protected path
        that is not explicitly allowed, a 403 response is returned.
        """

    def __init__(self, app, secure_paths: list | None = None, allowed_paths: list | None = None):
        """
        :param app: FastAPI Application
        :param secure_paths: List protected paths for app
        :param allowed_paths: List allowed path for app
        """
        super().__init__(app)

        self.secure_paths: list[str] = secure_paths or ["/api", "/admin", "/docs", "/redoc"]
        self.allowed_paths: list[str] = allowed_paths or [
            "/api/auth",
            "/api/addresses",
            "/api/orders",
            "/api/products",
            "/api/categories",
            "/api/users",
            "/api/payments",
            "/api/files"
        ]

    async def dispatch(self, request: Request, call_next: RequestResponseEndpoint) -> Response:
        request_path = str(request.url)

        is_allowed_paths = any(_ in request_path for _ in self.allowed_paths)
        is_secure_paths = any(_ in request_path for _ in self.secure_paths)

        user = request.state.user


        if is_secure_paths and not is_allowed_paths:
            return JSONResponse(status_code=403,
                                content={"detail": "Permission denied"})

        response = await call_next(request)
        return response
