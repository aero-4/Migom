import datetime
from typing import BinaryIO

import httpx
import pytest

from fastapi import UploadFile
from src.users.presentation.dtos import UserCreateDTO

TEST_SUPER_USER = UserCreateDTO(email="test@test.com", password="test12345", first_name="Test", last_name="Test", birthday=datetime.date(1990, 1, 1), )


@pytest.mark.asyncio
async def test_success_upload_file(clear_db, s3_storage, user_factory):
    TEST_FILE_NAME = "test_photo.jpeg"

    async with httpx.AsyncClient(base_url="http://localhost:8000") as client:
        await user_factory(client, TEST_SUPER_USER)

        with open(TEST_FILE_NAME, "rb") as f:
            upload = UploadFile(filename=TEST_FILE_NAME, file=f)
            file_bytes = await upload.read()

            await s3_storage.save_file(TEST_FILE_NAME, file_bytes)
            url = await s3_storage.upload_file(TEST_FILE_NAME, TEST_FILE_NAME.split(".")[0])

            created_file_name = url.split("/")[-1]

        assert created_file_name == TEST_FILE_NAME


@pytest.mark.asyncio
async def test_not_found_file_upload_file(clear_db, s3_storage, user_factory):
    async with httpx.AsyncClient(base_url="http://localhost:8000") as client:
        await user_factory(client, TEST_SUPER_USER)

        random_file_name = "random_file.jpeg"

        with pytest.raises(FileNotFoundError):
            with open(random_file_name, "rb") as f:
                upload = UploadFile(filename=random_file_name, file=f)
