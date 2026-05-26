import asyncio
import time
from collections import deque
from dataclasses import dataclass, field

from .modes import Mode


@dataclass
class AccessEvent:
    ts: float
    name: str
    secret_type: str  # 'github' | 'aws' | 'cc' | 'tool_call'
    reached_user: bool
    mode: int

    def to_dict(self) -> dict:
        return {
            "ts": self.ts,
            "name": self.name,
            "secret_type": self.secret_type,
            "reached_user": self.reached_user,
            "mode": self.mode,
        }


@dataclass
class AppState:
    mode: Mode = Mode.BASELINE
    total_accesses: int = 0
    recent: deque = field(default_factory=lambda: deque(maxlen=50))
    secrets: dict[str, str] = field(default_factory=dict)
    db: object = None
    mode_lock: asyncio.Lock = field(default_factory=asyncio.Lock)
    ws_clients: set = field(default_factory=set)  # Admin WS clients
    user_ws_clients: set = field(default_factory=set)  # Public chat WS clients
    portal_enabled: bool = True  # Whether the user portal accepts new chats

    def record_access(self, name: str, secret_type: str, reached_user: bool = True) -> AccessEvent:
        self.total_accesses += 1
        event = AccessEvent(
            ts=time.time(),
            name=name,
            secret_type=secret_type,
            reached_user=reached_user,
            mode=self.mode.value,
        )
        self.recent.appendleft(event)
        return event


# Module-level singleton
state = AppState()
