


def calculate_discount(a: int, b: int) -> int:
    return int(
        a - int((a / 100) * b)
    )