import datetime
from zoneinfo import ZoneInfo

from pydantic import BaseModel, model_validator, Field


class CustomModel(BaseModel):

    @model_validator(mode="after")
    def normalize_datetimes(self) -> "CustomModel":
        tz_moscow = ZoneInfo("Europe/Moscow")

        for field_name, value in self.__dict__.items():
            if isinstance(value, datetime.datetime):
                if value.tzinfo:
                    value = value.astimezone(tz_moscow)
                else:
                    value = value.replace(tzinfo=tz_moscow)
                value = value.replace(microsecond=0)
                setattr(self, field_name, value)

        return self
