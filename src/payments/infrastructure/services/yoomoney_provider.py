import logging
import httpx
import aiohttp
from yarl import URL

from src.payments.config import payment_settings
from src.payments.domain.entities import PaymentCreate
from src.payments.domain.interfaces.payment_provider import IPaymentProvider


class YoomoneyProvider(IPaymentProvider):
    def __init__(self):
        self.client_id: str = payment_settings.YOOMONEY_CLIENT_ID
        self.secret_key: str = payment_settings.YOOMONEY_SECRET_KEY
        self.redirect_uri: str = payment_settings.YOOMONEY_REDIRECT_URI

    async def create(self, payment: PaymentCreate) -> str | None:
        async with self._get_client() as client:
            account = await self._get_account_info()

            params = {
                "receiver": account,
                "sum": payment.amount,
                "successURL": self.redirect_uri,
                "label": payment.label,
                "quickpay-form": "button",
                "paymentType": "AC",

            }
            response = await client.post(
                url="https://yoomoney.ru/quickpay/confirm.xml?",
                params=params,
            )
        return str(response.url) if response.url else None

    async def check_status(self, label: str) -> bool:
        async with self._get_client() as client:
            response = await client.post(
                url=f"https://yoomoney.ru/api/operation-history",
            )
            response.raise_for_status()

            data = await response.json()
            operations = data.get("operations", [])

            if not operations:
                return False

        for operation in operations:
            if operation.get("label") == label:
                return True

        return False

    async def _authorize(self) -> str | None:
        async with self._get_client() as client:
            response = await client.post(
                f"https://yoomoney.ru/api/oauth/authorize",
                params={
                    "client_id": self.client_id,
                    "response_type": "code",
                    "redirect_uri": self.redirect_uri,
                    "scope": "money-source payment payment-shop payment-p2p"
                },
                follow_redirects=True
            )
            response.raise_for_status()

        logging.info(response.url)
        code = response.url.query.get("code")
        return code

    async def _get_access_token(self):
        async with self._get_client() as client:
            response = await client.post(
                f"https://yoomoney.ru/api/oauth/token",
                data={
                    "client_id": self.client_id,
                    "code": "authorization code",
                    "redirect_uri": self.redirect_uri,
                    "grant_type": "authorization_code",
                },
                follow_redirects=True
            )
            response.raise_for_status()
            data = await response.json()

        if data.get("error"):
            logging.error("Not get access token: %s", data.get("error"))
            return None

        return data.get("access_token", None)

    async def _get_account_info(self) -> str | None:
        async with self._get_client() as client:
            response = await client.post(
                url="https://yoomoney.ru/api/account-info",
            )
            response.raise_for_status()
            data = await response.json()

        return data.get("account")

    def _get_client(self) -> aiohttp.ClientSession:
        return aiohttp.ClientSession(
            headers={
                "Content-Type": "application/x-www-form-urlencoded",
                "Authorization": f"Bearer {payment_settings.YOOMONEY_ACCESS_TOKEN}"
            }
        )
