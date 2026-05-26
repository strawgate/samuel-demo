"""Pydantic AI agent factory - builds the agent per request based on current mode."""

import logging
from pathlib import Path

from pydantic_ai import Agent

from .config import settings
from .modes import Mode, MODE_CONFIGS
from .state import state
from .tools import build_support_toolset
from .secrets_tool import build_secrets_toolset

logger = logging.getLogger(__name__)

SYSTEM_PROMPT_PATH = Path(__file__).parent / "prompts" / "system.txt"


def load_system_prompt() -> str:
    return SYSTEM_PROMPT_PATH.read_text()


def build_agent(mode: Mode) -> Agent:
    """Build a fresh agent configured for the given mode."""
    cfg = MODE_CONFIGS[mode]

    agent = Agent(
        settings.model,
        system_prompt=load_system_prompt(),
    )

    # Register support tools (no RunContext needed)
    tools = build_support_toolset(state.db)
    for tool_fn in tools:
        agent.tool_plain()(tool_fn)

    # Conditionally register the secrets tool
    if cfg.expose_get_env:
        secrets_tools = build_secrets_toolset()
        for tool_fn in secrets_tools:
            agent.tool_plain()(tool_fn)

    return agent
