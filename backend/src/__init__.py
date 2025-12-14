from pathlib import Path

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from prometheus_fastapi_instrumentator import Instrumentator
from contextlib import asynccontextmanager
from starlette.staticfiles import StaticFiles

from src.addresses.presentation.api import addresses_api_router
from src.auth.presentation.views import auth_view_router
from src.categories.presentation.api import categories_api_router
from src.core.infrastructure.redis import check_redis_connection
from src.db.utils import create_and_delete_tables_db
from src.core.config import settings
from src.core.domain.exceptions import AppException
from src.auth.presentation.middlewares.security import SecurityMiddleware
from src.auth.presentation.middlewares.authentication import AuthenticationMiddleware
from src.auth.presentation.middlewares.jwtrefresh import JWTRefreshMiddleware
from src.auth.presentation.api import auth_api_router
from src.files.presentation.api import files_api_router
from src.orders.presentation.api import orders_api_router
from src.payments.presentation.api import payments_api_router
from src.products.presentation.api import products_api_router
from src.users.presentation.api import users_api_router
from src.core.config import settings

BASE_DIR = Path(__file__).resolve().parent
static_dir = BASE_DIR / "static"


@asynccontextmanager
async def lifespan(app: FastAPI):
    await check_redis_connection()
    # await create_and_delete_tables_db()
    yield


app = FastAPI(
    title=settings.PROJECT_NAME,
    lifespan=lifespan
)


@app.exception_handler(AppException)
async def app_exception_handler(request: Request, exc: AppException):
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "detail": exc.detail,
            **(exc.extra or {})
        }
    )


Instrumentator().instrument(app).expose(app, endpoint='/__internal_metrics__')

# middlewares
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://127.0.0.1:8001",
                   "http://127.0.0.1:8000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(SecurityMiddleware)
app.add_middleware(AuthenticationMiddleware)
app.add_middleware(JWTRefreshMiddleware)

# routers
app.include_router(auth_api_router, prefix='/api/auth', tags=["Authentication"])
app.include_router(users_api_router, prefix='/api/users', tags=["Users"])
app.include_router(categories_api_router, prefix="/api/categories", tags=["Categories"])
app.include_router(products_api_router, prefix='/api/products', tags=["Products"])
app.include_router(files_api_router, prefix='/api/files', tags=["Files"])
app.include_router(orders_api_router, prefix='/api/orders', tags=["Orders"])
app.include_router(addresses_api_router, prefix='/api/addresses', tags=["Addresses"])
app.include_router(payments_api_router, prefix='/api/payments', tags=["Payments"])

# static
app.mount("/static", StaticFiles(directory=static_dir), name="static")
app.include_router(auth_view_router, prefix='/auth', tags=["auth"])
