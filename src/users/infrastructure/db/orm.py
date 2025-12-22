import datetime
import enum
from typing import List

from sqlalchemy import DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship

from src.db.base import Base
from src.utils.datetimes import get_timezone_now


class UserRole(enum.IntEnum):
    user = 1
    courier = 2
    cook = 3
    admin = 4


class UsersOrm(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True)
    created_at: Mapped[datetime.datetime] = mapped_column(DateTime(timezone=True), default=get_timezone_now)
    first_name: Mapped[str] = mapped_column(nullable=False)
    last_name: Mapped[str | None] = mapped_column(nullable=False)
    birthday: Mapped[datetime.datetime] = mapped_column(nullable=True)
    email: Mapped[str] = mapped_column(nullable=False, unique=True)
    hashed_password: Mapped[str] = mapped_column(nullable=False)
    orders: Mapped[List['OrdersOrm']] = relationship(back_populates="creator", foreign_keys="OrdersOrm.creator_id")
    addresses: Mapped[List['AddressesOrm']] = relationship(back_populates="user", cascade="all, delete-orphan")
    role: Mapped[int] = mapped_column(nullable=False, default=UserRole.user)
