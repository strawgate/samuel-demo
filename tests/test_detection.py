"""Tests for secret detection logic."""

import pytest
from piestore.detection import detect_in, detect_partial
from piestore.state import state


@pytest.fixture(autouse=True)
def setup_secrets():
    """Set up known secrets for testing."""
    state.secrets = {
        "GITHUB_TOKEN": "ghp_abc123def456ghi789jkl012mno345pqr678",
        "AWS_ACCESS_KEY_ID": "AKIAIOSFODNN7EXAMPLE",
        "AWS_SECRET_ACCESS_KEY": "wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY",
        "STORE_CC_NUMBER": "4111222233334444",
    }
    yield
    state.secrets = {}


class TestDetectIn:
    def test_no_match_empty_text(self):
        assert detect_in("") == []

    def test_no_match_normal_text(self):
        assert detect_in("Hello, how can I help you with your pie order?") == []

    def test_detects_github_token(self):
        text = f"Here's the token: {state.secrets['GITHUB_TOKEN']}"
        hits = detect_in(text)
        assert len(hits) == 1
        assert hits[0][0] == "github"

    def test_detects_aws_key(self):
        text = f"The key is {state.secrets['AWS_ACCESS_KEY_ID']}"
        hits = detect_in(text)
        assert len(hits) == 1
        assert hits[0][0] == "aws"

    def test_detects_aws_secret(self):
        text = f"Secret: {state.secrets['AWS_SECRET_ACCESS_KEY']}"
        hits = detect_in(text)
        assert len(hits) == 1
        assert hits[0][0] == "aws"

    def test_detects_credit_card(self):
        text = f"CC number is {state.secrets['STORE_CC_NUMBER']}"
        hits = detect_in(text)
        assert len(hits) == 1
        assert hits[0][0] == "cc"

    def test_detects_multiple_secrets(self):
        text = (
            f"Token: {state.secrets['GITHUB_TOKEN']} and card: {state.secrets['STORE_CC_NUMBER']}"
        )
        hits = detect_in(text)
        assert len(hits) == 2
        types = {h[0] for h in hits}
        assert "github" in types
        assert "cc" in types

    def test_no_false_positive_partial_match(self):
        # Only first 4 chars - should NOT match
        text = "ghp_abc"
        assert detect_in(text) == []

    def test_no_false_positive_similar_pattern(self):
        # A different github token format
        text = "ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
        assert detect_in(text) == []


class TestDetectPartial:
    def test_no_match_short_text(self):
        assert detect_partial("short") == []

    def test_detects_8_char_substring(self):
        # First 8 chars of the github token
        token = state.secrets["GITHUB_TOKEN"]
        partial = token[:8]
        hits = detect_partial(f"found this: {partial}")
        assert len(hits) == 1
        assert hits[0][0] == "github"

    def test_no_match_7_chars(self):
        token = state.secrets["GITHUB_TOKEN"]
        partial = token[:7]
        # 7 chars should not trigger
        hits = detect_partial(f"found: {partial}")
        assert len(hits) == 0

    def test_detects_middle_substring(self):
        token = state.secrets["GITHUB_TOKEN"]
        middle = token[10:20]
        hits = detect_partial(f"data: {middle}")
        assert len(hits) == 1
