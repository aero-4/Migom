import random
import string
from typing import Optional

ALPHA_NUM = string.ascii_letters + string.digits


def generate_random_alphanum(length: int = 20) -> str:
    return "".join(random.choices(ALPHA_NUM, k=length))


def string_list_to_int_list(string_list: list | str | None) -> Optional[list[int]]:
    if not string_list or string_list == ['']:
        return []
    if isinstance(string_list, str):
        return [int(number) for number in string_list.split(',')]
    elif isinstance(string_list, list):
        return [int(number) for number in string_list[0].split(',')]


def generate_slug(string: str) -> str:
    slovar = {"а": "a", "б": "b", "в": "v", "г": "g", "д": "d", "е": "e", "ё": "e", "ж": "zh",
              "з": "z", "и": "i", "й": "i", "к": "k", "л": "l", "м": "m", "н": "n", "о": "o",
              "п": "p", "р": "r", "с": "s", "т": "t", "у": "u", "ф": "f", "х": "h", "ц": "c",
              "ч": "ch", "ш": "sh", "щ": "sh", "ы": "y", "ь": "", "э": "e", "ю": "yu",
              "я": "ya"}
    string = string.lower()
    for key, value in slovar.items():
        string = string.replace(key, value)
    return "-".join(string.lower().split())
