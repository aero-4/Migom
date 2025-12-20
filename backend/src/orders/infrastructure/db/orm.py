import datetime

from sqlalchemy import DateTime, ForeignKey, Enum, Table, Column, Integer, Float
from sqlalchemy.ext.associationproxy import association_proxy
from sqlalchemy.orm import mapped_column, Mapped, relationship

from src.db.base import Base
from src.orders.domain.entities import OrderStatus
from src.products.infrasctructure.db.orm import ProductsOrm
from src.utils.datetimes import get_timezone_now


class OrderProductsOrm(Base):
    __tablename__ = "order_products"
    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    order_id: Mapped[int] = mapped_column(
        ForeignKey("orders.id", ondelete="CASCADE"), primary_key=True
    )
    product_id: Mapped[int] = mapped_column(
        ForeignKey("products.id", ondelete="CASCADE"), primary_key=True
    )

    quantity: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    amount: Mapped[int] = mapped_column(Integer, nullable=False)
    order: Mapped["OrdersOrm"] = relationship("OrdersOrm", back_populates="product_links")
    product: Mapped["ProductsOrm"] = relationship("ProductsOrm", back_populates="order_links", lazy="selectin")


class OrdersOrm(Base):
    __tablename__ = "orders"

    id: Mapped[int] = mapped_column(primary_key=True)
    created_at: Mapped[datetime.datetime] = mapped_column(DateTime(timezone=True), default=get_timezone_now)
    updated_at: Mapped[datetime.datetime] = mapped_column(DateTime(timezone=True), onupdate=get_timezone_now, default=get_timezone_now)
    status: Mapped[OrderStatus] = mapped_column(Enum(OrderStatus), default=OrderStatus.CREATED)
    amount: Mapped[int] = mapped_column(default=0)

    creator_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"))
    creator: Mapped['UsersOrm'] = relationship(back_populates="orders", foreign_keys=[creator_id])

    courier_id: Mapped[int | None] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=True)
    cook_id: Mapped[int | None] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=True)
    address_id: Mapped[int] = mapped_column(ForeignKey("addresses.id", ondelete="CASCADE"))
    address: Mapped['AddressesOrm'] = relationship(lazy="joined")
    product_links: Mapped[list[OrderProductsOrm]] = relationship(
        "OrderProductsOrm",
        back_populates="order",
        cascade="all, delete-orphan",
        lazy="selectin",
    )
    products = association_proxy("product_links", "product")

