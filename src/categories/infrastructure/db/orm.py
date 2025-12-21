import datetime
import uuid
from typing import List

from sqlalchemy import DateTime, ForeignKey, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from src.db.base import Base
from src.utils.datetimes import get_timezone_now


class CategoriesOrm(Base):
    __tablename__ = "categories"

    id: Mapped[int] = mapped_column(primary_key=True)
    created_at: Mapped[datetime.datetime] = mapped_column(DateTime(timezone=True), default=get_timezone_now)
    updated_at: Mapped[datetime.datetime] = mapped_column(DateTime(timezone=True), default=get_timezone_now, onupdate=get_timezone_now)

    name: Mapped[str] = mapped_column(nullable=False, unique=True)
    slug: Mapped[str] = mapped_column(nullable=True)
    photo: Mapped[str] = mapped_column(nullable=True)

    products: Mapped[List["ProductsOrm"]] = relationship(back_populates="category", cascade="all, delete-orphan")