import uuid
from pathlib import Path

import pytest

from src import settings
from src.files.infrastructure.services.s3 import S3Storage

ACCESS_KEY = settings.S3_ACCESS_KEY
SECRET_KEY = settings.S3_SECRET_KEY
ENDPOINT_URL = settings.S3_ENDPOINT_URL
URL = settings.S3_URL
BUCKET_NAME = settings.S3_BUCKET_NAME

cwd = Path.cwd()


@pytest.mark.asyncio
async def test_upload_file():
    s3_client = S3Storage(
        access_key=ACCESS_KEY, secret_key=SECRET_KEY, endpoint_url=ENDPOINT_URL, bucket_name=BUCKET_NAME
    )
    image = Path(f"test-image.png")

    assert await s3_client.upload_file(image)
    assert await s3_client.upload_file(str(image))


@pytest.mark.asyncio
async def test_random_object_name_upload_file():
    s3_client = S3Storage(
        access_key=ACCESS_KEY, secret_key=SECRET_KEY, endpoint_url=ENDPOINT_URL, bucket_name=BUCKET_NAME, public_url=URL
    )
    random_name = "random_name_" + uuid.uuid4().hex
    image = Path(f"test-image.png")

    uploaded = await s3_client.upload_file(image, random_name)
    assert uploaded == f"{URL}/{random_name}.png"
