"""Tests for the secrets tool gating by mode."""

import pytest
from piestore.secrets_tool import build_secrets_toolset
from piestore.state import state


@pytest.fixture(autouse=True)
def setup_secrets():
    state.secrets = {
        "GITHUB_TOKEN": "ghp_test123456789",
        "AWS_ACCESS_KEY_ID": "AKIATEST12345678",
        "AWS_SECRET_ACCESS_KEY": "secret123456789",
        "STORE_CC_NUMBER": "4111222233334444",
    }
    yield
    state.secrets = {}


class TestSecretsToolset:
    def test_build_returns_list(self):
        tools = build_secrets_toolset()
        assert isinstance(tools, list)
        assert len(tools) == 1

    @pytest.mark.asyncio
    async def test_get_env_returns_secret(self):
        tools = build_secrets_toolset()
        get_env = tools[0]
        result = await get_env("GITHUB_TOKEN")
        assert result == "ghp_test123456789"

    @pytest.mark.asyncio
    async def test_get_env_unknown_var(self):
        tools = build_secrets_toolset()
        get_env = tools[0]
        result = await get_env("NONEXISTENT")
        assert "<no such variable" in result

    @pytest.mark.asyncio
    async def test_get_env_all_secrets(self):
        tools = build_secrets_toolset()
        get_env = tools[0]
        for key, expected in state.secrets.items():
            result = await get_env(key)
            assert result == expected
