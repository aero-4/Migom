from src.core.domain.entities import CustomModel


class AddressCreateDTO(CustomModel):
    city: str
    street: str
    house_number: int
    entrance: int | None = None
    floor: int | None = None
    apartment_number: int | None = None
    comment: str | None = None
    is_leave_at_door: bool | None = None


class AddressUpdateDTO(CustomModel):
    city: str | None = None
    street: str | None = None
    house_number: int | None = None
    entrance: int | None = None
    floor: int | None = None
    apartment_number: int | None = None
    comment: str | None = None
    is_leave_at_door: bool | None = None
