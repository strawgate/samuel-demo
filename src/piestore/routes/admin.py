import logging

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from ..state import state
from ..modes import Mode, MODE_CONFIGS
from ..auth import require_admin
from ..db import get_leaderboard, get_capture_stats
from ..routes.ws import broadcast, broadcast_to_users

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/admin")


class ModeRequest(BaseModel):
    mode: int


@router.post("/mode")
async def set_mode(req: ModeRequest, _user=Depends(require_admin)):
    if req.mode not in (1, 2, 3):
        raise HTTPException(400, "mode must be 1, 2, or 3")
    async with state.mode_lock:
        state.mode = Mode(req.mode)
    cfg = MODE_CONFIGS[state.mode]
    await broadcast({"type": "mode", "mode": state.mode.value, "label": cfg.label})
    # Notify users about mode change
    await broadcast_to_users(
        {
            "type": "mode_change",
            "mode": state.mode.value,
            "label": cfg.label,
            "description": cfg.description,
        }
    )
    return {"ok": True, "mode": state.mode.value, "label": cfg.label}


@router.get("/state")
async def get_state(_user=Depends(require_admin)):
    cfg = MODE_CONFIGS[state.mode]
    recent = [e.to_dict() for e in list(state.recent)[:10]]
    return {
        "mode": state.mode.value,
        "mode_label": cfg.label,
        "mode_description": cfg.description,
        "total_accesses": state.total_accesses,
        "recent": recent,
        "secrets": {k: f"{v[:4]}...{v[-4:]}" for k, v in state.secrets.items()},
        "portal_enabled": state.portal_enabled,
    }


@router.get("/leaderboard")
async def leaderboard(_user=Depends(require_admin)):
    if state.db:
        data = await get_leaderboard(state.db)
    else:
        data = []
    return {"leaderboard": data}


@router.get("/stats")
async def stats(_user=Depends(require_admin)):
    if state.db:
        data = await get_capture_stats(state.db)
    else:
        data = {
            "total": 0,
            "github_total": 0,
            "aws_total": 0,
            "cc_total": 0,
            "mode1_total": 0,
            "mode2_total": 0,
            "mode3_total": 0,
        }
    return data


@router.post("/login")
async def login(token: str):
    """Simple token-based login for admin."""
    from ..config import settings

    if token != settings.admin_token:
        raise HTTPException(401, "Invalid token")
    return {"ok": True}


@router.post("/reset")
async def reset_demo(_user=Depends(require_admin)):
    """Reset counters and leaderboard for a fresh demo run."""
    state.total_accesses = 0
    state.recent.clear()
    if state.db:
        async with state.db.acquire() as conn:
            await conn.execute("DELETE FROM captures")
    await broadcast({"type": "reset"})
    return {"ok": True}


@router.post("/ban-name")
async def ban_name(name: str, _user=Depends(require_admin)):
    """Ban a display name and force that user to regenerate."""
    if state.db:
        async with state.db.acquire() as conn:
            await conn.execute(
                "INSERT INTO banned_names (name) VALUES ($1) ON CONFLICT DO NOTHING",
                name,
            )
    await broadcast({"type": "ban_name", "name": name})
    return {"ok": True}


class PortalToggleRequest(BaseModel):
    enabled: bool


@router.post("/portal")
async def toggle_portal(req: PortalToggleRequest, _user=Depends(require_admin)):
    """Enable or disable the user portal (controls inference access)."""
    state.portal_enabled = req.enabled
    await broadcast({"type": "portal", "enabled": req.enabled})
    await broadcast_to_users({"type": "portal_status", "enabled": req.enabled})
    return {"ok": True, "enabled": req.enabled}
