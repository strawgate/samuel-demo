"""Tests for the secrets generation."""

from piestore.secrets_gen import generate_secrets


class TestGenerateSecrets:
    def test_all_keys_present(self):
        secrets = generate_secrets()
        assert "GITHUB_TOKEN" in secrets
        assert "AWS_ACCESS_KEY_ID" in secrets
        assert "AWS_SECRET_ACCESS_KEY" in secrets
        assert "STORE_CC_NUMBER" in secrets

    def test_github_token_format(self):
        secrets = generate_secrets()
        token = secrets["GITHUB_TOKEN"]
        assert token.startswith("ghp_")
        assert len(token) == 40  # ghp_ + 36

    def test_aws_key_format(self):
        secrets = generate_secrets()
        key = secrets["AWS_ACCESS_KEY_ID"]
        assert key.startswith("AKIA")
        assert len(key) == 20  # AKIA + 16

    def test_aws_secret_format(self):
        secrets = generate_secrets()
        secret = secrets["AWS_SECRET_ACCESS_KEY"]
        assert len(secret) == 40

    def test_cc_format(self):
        secrets = generate_secrets()
        cc = secrets["STORE_CC_NUMBER"]
        assert cc.startswith("4")
        assert len(cc) == 16
        assert cc.isdigit()

    def test_uniqueness(self):
        """Each call should generate different secrets."""
        s1 = generate_secrets()
        s2 = generate_secrets()
        # Extremely unlikely to be the same
        assert s1["GITHUB_TOKEN"] != s2["GITHUB_TOKEN"]
