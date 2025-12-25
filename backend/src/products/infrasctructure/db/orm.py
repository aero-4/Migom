from src.orders.infrastructure.db.orm import *
from src.utils.datetimes import get_timezone_now


class ProductsOrm(Base):
    __tablename__ = "products"

    id: Mapped[int] = mapped_column(primary_key=True)
    created_at: Mapped[datetime.datetime] = mapped_column(DateTime(timezone=True), default=get_timezone_now)
    updated_at: Mapped[datetime.datetime] = mapped_column(DateTime(timezone=True), default=get_timezone_now, onupdate=get_timezone_now)

    name: Mapped[str] = mapped_column(nullable=False, unique=True)
    content: Mapped[str] = mapped_column(nullable=False)
    composition: Mapped[str] = mapped_column(nullable=False)
    price: Mapped[float] = mapped_column(nullable=False)
    discount_price: Mapped[float] = mapped_column(nullable=True)
    discount: Mapped[int] = mapped_column(nullable=True)
    count: Mapped[int] = mapped_column(default=0)
    grams: Mapped[int] = mapped_column(default=0)
    kilocalorie: Mapped[int] = mapped_column(default=0, nullable=True)
    protein: Mapped[int] = mapped_column(default=0)
    fats: Mapped[int] = mapped_column(default=0)
    carbohydrates: Mapped[int] = mapped_column(default=0)
    photo: Mapped[str] = mapped_column(nullable=True)

    category_id: Mapped[int] = mapped_column(ForeignKey("categories.id", ondelete="CASCADE"), nullable=True)
    category: Mapped['CategoriesOrm'] = relationship(back_populates="products")

    order_links: Mapped[list["OrderProductsOrm"]] = relationship(
        "OrderProductsOrm", back_populates="product"
    )

