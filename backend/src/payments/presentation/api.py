from fastapi import APIRouter
from starlette.requests import Request

from src.auth.presentation.dependencies import TokenAuthDep
from src.auth.presentation.permissions import access_control
from src.payments.application.use_cases.add_payment import add_payment
from src.payments.application.use_cases.collect_payments import get_payment, collect_payments
from src.payments.presentation.dependenscies import PaymentUoWDeps, PaymentProviderDeps
from src.payments.presentation.dtos import PaymentCreateDTO
from src.users.infrastructure.db.orm import UserRole

payments_api_router = APIRouter()


@payments_api_router.post("/")
@access_control(role=UserRole.user)
async def add(request: Request, payment_data: PaymentCreateDTO, payment: PaymentUoWDeps, provider: PaymentProviderDeps):
    return await add_payment(request.state.user, payment_data, payment, provider)


@payments_api_router.get("/{payment_id}")
@access_control(role=UserRole.user)
async def get(request: Request, payment_id: int, payment: PaymentUoWDeps, provider: PaymentProviderDeps):
    return await get_payment(payment_id, request.state.user, payment, provider)


@payments_api_router.get("/")
@access_control(role=UserRole.admin)
async def get_all(payment: PaymentUoWDeps, auth: TokenAuthDep):
    return await collect_payments(payment)
