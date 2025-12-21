import datetime
import pytz

tz = pytz.timezone('Europe/Moscow')


def astz(dt: datetime.datetime):
    return dt.astimezone(tz)


def get_timezone_now():
    return datetime.datetime.now().astimezone(tz)
