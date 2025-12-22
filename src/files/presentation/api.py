from fastapi import APIRouter, File, UploadFile

from src.auth.presentation.dependencies import TokenAuthDep
from src.auth.presentation.permissions import access_control
from src.files.application.use_cases.upload_file import upload_file
from src.files.presentation.dependencies import S3StorageDep
from src.users.infrastructure.db.orm import UserRole

files_api_router = APIRouter()


@files_api_router.post(f"/", description="Upload files at S3 Storage selectel.ru")
@access_control(role=UserRole.user)
async def upload(storage: S3StorageDep, auth: TokenAuthDep, file: UploadFile = File(..., max_size=1024 * 1024 * 10)):
    return await upload_file(file, storage)

