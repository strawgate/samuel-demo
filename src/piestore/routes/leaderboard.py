from fastapi import APIRouter

from ..state import state
from ..db import get_leaderboard, get_capture_stats

router = APIRouter(prefix="/api")


@router.get("/leaderboard")
async def public_leaderboard():
    """Public leaderboard - shows captures without admin details."""
    if state.db:
        data = await get_leaderboard(state.db)
    else:
        data = []
    stats = await get_capture_stats(state.db) if state.db else {}
    return {
        "leaderboard": data,
        "total_accesses": state.total_accesses,
        "mode": state.mode.value,
        "stats": stats,
    }
