import datetime
from uuid import UUID

from src.core.domain.entities import CustomModel


class Category(CustomModel):
    id: int
    name: str
    slug: str
    photo: str


class CategoryCreate(CustomModel):
    name: str
    slug: str
    photo: str


class CategoryUpdate(CustomModel):
    id: int
    name: str | None = None
    slug: str | None = None
    photo: str | None = None
