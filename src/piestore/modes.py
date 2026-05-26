from enum import IntEnum
from dataclasses import dataclass


class Mode(IntEnum):
    BASELINE = 1  # Monty + get_env + observe (leaks easily)
    GUARDRAILS = 2  # Monty + get_env + enforce (DLP blocks output)
    SANDBOXED = 3  # Monty - get_env + enforce (tool removed entirely)


@dataclass(frozen=True)
class ModeConfig:
    expose_get_env: bool
    use_enforce_route: bool
    label: str
    description: str


MODE_CONFIGS: dict[Mode, ModeConfig] = {
    Mode.BASELINE: ModeConfig(
        expose_get_env=True,
        use_enforce_route=False,
        label="Baseline",
        description="Agent has get_env tool, no guardrails. Leaks trivially.",
    ),
    Mode.GUARDRAILS: ModeConfig(
        expose_get_env=True,
        use_enforce_route=True,
        label="Guardrails",
        description="Agent has get_env tool, DLP blocks secret output.",
    ),
    Mode.SANDBOXED: ModeConfig(
        expose_get_env=False,
        use_enforce_route=True,
        label="Sandboxed",
        description="No get_env tool. Even jailbroken, nothing to leak.",
    ),
}
