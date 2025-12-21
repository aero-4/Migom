from pydantic import BaseModel

from src.categories.domain.entities import CategoryUpdate


class CategoryCreateDTO(BaseModel):
    name: str
    photo: str


class CategoryUpdateDTO(BaseModel):
    name: str | None = None
    photo: str | None = None


    def to_entity(self, id: int, slug: str):
        return CategoryUpdate(id=id, slug=slug, **self.model_dump(exclude_unset=True))