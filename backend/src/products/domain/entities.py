from src.categories.domain.entities import Category
from src.core.domain.entities import CustomModel


class Product(CustomModel):
    id: int
    name: str
    content: str
    composition: str
    price: float
    count: int
    grams: int
    protein: int
    fats: int
    carbohydrates: int
    kilocalorie: int
    photo: str | None = None
    category_id: int | None = None
    discount_price: float | None = None
    discount: int | None = None
    quantity: int | None = None


class ProductCreate(CustomModel):
    name: str
    content: str
    composition: str
    price: float
    kilocalorie: int
    count: int
    grams: int
    protein: int
    fats: int
    carbohydrates: int
    photo: str | None = None
    category_id: int | None = None
    discount_price: float | None = None
    discount: int | None = None


class ProductUpdate(CustomModel):
    id: int
    name: str | None = None
    content: str | None = None
    composition: str | None = None
    price: float | None = None
    discount_price: float | None = None
    discount: int | None = None
    count: int | None = None
    kilocalorie: int | None = None
    grams: int | None = None
    protein: int | None = None
    fats: int | None = None
    carbohydrates: int | None = None
    photo: str | None = None
    category_id: int | None = None


class SearchData(CustomModel):
    name: str | None = None
    content: str | None = None
    category_id: int | None = None
    category_name: str | None = None
    price: float | None = None
    discount: int | None = None
    kilocalorie: int | None = None
    grams: int | None = None
    protein: int | None = None
    fats: int | None = None
    carbohydrates: int | None = None
