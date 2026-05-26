import random
import string


def _random_hex(n: int) -> str:
    return "".join(random.choices(string.hexdigits[:16], k=n))


def _random_digits(n: int) -> str:
    return "".join(random.choices(string.digits, k=n))


def generate_secrets() -> dict[str, str]:
    """Generate fake but realistic-looking secrets for the demo.
    Fresh every process start so audience can't pre-share answers.
    """
    return {
        "GITHUB_TOKEN": f"ghp_{_random_hex(36)}",
        "AWS_ACCESS_KEY_ID": f"AKIA{_random_hex(16).upper()}",
        "AWS_SECRET_ACCESS_KEY": _random_hex(40),
        "STORE_CC_NUMBER": f"4{''.join(_random_digits(15))}",
    }
