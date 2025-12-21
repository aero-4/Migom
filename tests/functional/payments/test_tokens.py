import pytest
from aiomoney import authorize_app, YooMoney
from aiomoney.schemas import InvoiceSource

from src.payments.config import payment_settings


@pytest.mark.asyncio
async def test_get_access_token():
    await authorize_app(
        client_id=payment_settings.YOOMONEY_CLIENT_ID,
        redirect_uri=payment_settings.YOOMONEY_REDIRECT_URI,
        app_permissions=[
            "account-info",
            "operation-history",
            "operation-details",
            "incoming-transfers",
            "payment-p2p",
            "payment-shop",
        ]
    )


@pytest.mark.asyncio
async def test_is_valid_token():
    wallet = YooMoney(access_token=payment_settings.YOOMONEY_ACCESS_TOKEN)

    payment_form = await wallet.create_invoice(
        amount_rub=990,
        label="abcdefg",
        payment_source=InvoiceSource.BANK_CARD,
    )
    is_paid: bool = await wallet.is_payment_successful(payment_form.label)

    print(f"\nLink:\n{payment_form.url}\n\n"
          f"Is payed: {'Yes' if is_paid else 'No'}")


