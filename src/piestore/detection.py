from .state import state


def detect_in(text: str) -> list[tuple[str, str]]:
    """Return [(secret_type, matched_value), ...] for secrets found in text.
    Exact-match only against active secret values - not pattern matching.
    """
    if not text:
        return []

    hits = []
    secret_map = {
        "GITHUB_TOKEN": "github",
        "AWS_ACCESS_KEY_ID": "aws",
        "AWS_SECRET_ACCESS_KEY": "aws",
        "STORE_CC_NUMBER": "cc",
    }

    for env_name, secret_type in secret_map.items():
        value = state.secrets.get(env_name, "")
        if value and value in text:
            hits.append((secret_type, value))

    return hits


def detect_partial(text: str) -> list[tuple[str, str]]:
    """Detect partial leaks - at least 8 consecutive chars of a secret."""
    if not text or len(text) < 8:
        return []

    hits = []
    secret_map = {
        "GITHUB_TOKEN": "github",
        "AWS_ACCESS_KEY_ID": "aws",
        "AWS_SECRET_ACCESS_KEY": "aws",
        "STORE_CC_NUMBER": "cc",
    }

    for env_name, secret_type in secret_map.items():
        value = state.secrets.get(env_name, "")
        if not value or len(value) < 8:
            continue
        # Check if any 8+ char substring of the secret appears
        for i in range(len(value) - 7):
            chunk = value[i : i + 8]
            if chunk in text:
                hits.append((secret_type, value))
                break

    return hits
