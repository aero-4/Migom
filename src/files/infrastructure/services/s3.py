import uuid

import aiofiles
import uuid6

from contextlib import asynccontextmanager
from aiobotocore.session import get_session, ClientCreatorContext
from pathlib import Path

from src.core.config import settings


class S3Storage:
    def __init__(self, access_key: str = settings.S3_ACCESS_KEY, secret_key: str = settings.S3_SECRET_KEY,
                 endpoint_url: str = settings.S3_ENDPOINT_URL, bucket_name: str = settings.S3_BUCKET_NAME,
                 public_url: str = settings.S3_URL) -> None:
        self.bucket_name = bucket_name
        self.public_url = public_url

        self.config = {
            "aws_access_key_id": access_key,
            "aws_secret_access_key": secret_key,
            "endpoint_url": endpoint_url
        }
        self.session = get_session()

    @asynccontextmanager
    async def get_client(self) -> ClientCreatorContext:
        async with self.session.create_client("s3", **self.config) as client:
            yield client

    async def upload_file(self, file_path: Path, object_name: str = None) -> None | str:
        if not object_name:
            object_name = uuid.uuid4()

        async with self.get_client() as client:
            suffix = file_path.suffix.replace(".", "")
            object_name = f"{object_name}.{suffix}"

            with open(file_path, "rb") as file:
                await client.put_object(Bucket=self.bucket_name, Key=object_name, Body=file)

        if self.public_url:
            return f"{self.public_url}/{object_name}"

        return None

    @staticmethod
    async def save_file(file_path: str, content: bytes):
        async with aiofiles.open(file_path, "wb") as f:
            await f.write(content)


    @staticmethod
    async def delete_file(file_path: str):
        Path(file_path).unlink()
