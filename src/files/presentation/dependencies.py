from typing import Annotated

from fastapi import Depends

from src.core.config import settings
from src.files.infrastructure.services.s3 import S3Storage


def get_s3_storage() -> S3Storage:
    return S3Storage()


S3StorageDep = Annotated[S3Storage, Depends(get_s3_storage)]
