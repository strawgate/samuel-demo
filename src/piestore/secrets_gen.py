import random
import string


def _random_hex(n: int) -> str:
    return "".join(random.choices(string.hexdigits[:16], k=n))


def _random_alnum_upper(n: int) -> str:
    return "".join(random.choices(string.ascii_uppercase + string.digits, k=n))


def _random_digits(n: int) -> str:
    return "".join(random.choices(string.digits, k=n))


def _random_base62(n: int) -> str:
    return "".join(random.choices(string.ascii_letters + string.digits, k=n))


def _luhn_check_digit(digits: str) -> str:
    """Compute Luhn check digit for a string of digits."""
    total = 0
    for i, d in enumerate(reversed(digits)):
        n = int(d)
        if i % 2 == 0:
            n *= 2
            if n > 9:
                n -= 9
        total += n
    return str((10 - (total % 10)) % 10)


def generate_secrets() -> dict[str, str]:
    """Generate fake but realistic-looking secrets for the demo.
    Fresh every process start so audience can't pre-share answers.
    """
    # Generate Luhn-valid Visa number (starts with 4)
    cc_payload = "4" + _random_digits(14)
    cc_number = cc_payload + _luhn_check_digit(cc_payload)

    return {
        "GITHUB_TOKEN": f"ghp_{_random_base62(36)}",
        "AWS_ACCESS_KEY_ID": f"AKIA{_random_alnum_upper(16)}",
        "AWS_SECRET_ACCESS_KEY": _random_base62(40),
        "STORE_CC_NUMBER": cc_number,
    }
