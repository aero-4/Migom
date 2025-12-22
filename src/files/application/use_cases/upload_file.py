from pathlib import Path

from fastapi import UploadFile

from src.files.domain.entities import FileData
from src.files.presentation.dependencies import S3StorageDep


async def upload_file(file: UploadFile, storage: S3StorageDep) -> FileData:
    file_name = file.filename
    content = await file.read()

    await storage.save_file(file_name, content)

    url = await storage.upload_file(Path(file_name))
    await storage.delete_file(file_name)

    return FileData(url=url)

