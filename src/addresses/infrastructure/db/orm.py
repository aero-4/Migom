import datetime

from sqlalchemy import DateTime, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from src.db.base import Base
from src.utils.datetimes import get_timezone_now


class AddressesOrm(Base):
    __tablename__ = "addresses"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    user: Mapped['UsersOrm'] = relationship(back_populates="addresses")
    created_at: Mapped[datetime.datetime] = mapped_column(DateTime(timezone=True), default=get_timezone_now)
    updated_at: Mapped[datetime.datetime] = mapped_column(DateTime(timezone=True), onupdate=get_timezone_now, default=get_timezone_now)
    city: Mapped[str] = mapped_column(nullable=False)
    street: Mapped[str] = mapped_column(nullable=False)
    house_number: Mapped[int | None] = mapped_column(nullable=False)
    entrance: Mapped[int | None] = mapped_column(nullable=True)
    floor: Mapped[int | None] = mapped_column(nullable=True)
    apartment_number: Mapped[int | None] = mapped_column(nullable=True)
    comment: Mapped[str | None] = mapped_column(nullable=True)
    is_leave_at_door: Mapped[bool | None] = mapped_column(default=False)