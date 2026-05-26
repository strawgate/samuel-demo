import json
import logging
import secrets as secrets_mod

from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from ..state import state
from ..config import settings
from ..modes import MODE_CONFIGS

logger = logging.getLogger(__name__)

router = APIRouter()


@router.websocket("/ws/admin")
async def admin_websocket(ws: WebSocket):
    """WebSocket for real-time admin updates."""
    # Verify token from query params
    token = ws.query_params.get("token", "")
    if not secrets_mod.compare_digest(token, settings.admin_token):
        await ws.close(code=4001, reason="unauthorized")
        return

    await ws.accept()
    state.ws_clients.add(ws)
    logger.info(f"Admin WS connected. Total clients: {len(state.ws_clients)}")

    try:
        # Send current state immediately
        cfg = MODE_CONFIGS[state.mode]
        await ws.send_json(
            {
                "type": "state",
                "mode": state.mode.value,
                "mode_label": cfg.label,
                "total_accesses": state.total_accesses,
                "recent": [e.to_dict() for e in list(state.recent)[:10]],
            }
        )

        # Keep alive - listen for pings
        while True:
            data = await ws.receive_text()
            if data == "ping":
                await ws.send_text("pong")
    except WebSocketDisconnect:
        pass
    finally:
        state.ws_clients.discard(ws)
        logger.info(f"Admin WS disconnected. Total clients: {len(state.ws_clients)}")


@router.websocket("/ws/user")
async def user_websocket(ws: WebSocket):
    """WebSocket for real-time user notifications (mode changes, portal toggles)."""
    await ws.accept()
    state.user_ws_clients.add(ws)
    logger.info(f"User WS connected. Total user clients: {len(state.user_ws_clients)}")

    try:
        # Send current portal state
        await ws.send_json(
            {
                "type": "portal_status",
                "enabled": state.portal_enabled,
            }
        )

        while True:
            data = await ws.receive_text()
            if data == "ping":
                await ws.send_text("pong")
    except WebSocketDisconnect:
        pass
    finally:
        state.user_ws_clients.discard(ws)
        logger.info(f"User WS disconnected. Total user clients: {len(state.user_ws_clients)}")


async def broadcast(message: dict) -> None:
    """Broadcast a message to all connected admin WebSocket clients."""
    if not state.ws_clients:
        return

    dead = set()
    payload = json.dumps(message)
    for ws in list(state.ws_clients):
        try:
            await ws.send_text(payload)
        except WebSocketDisconnect:
            dead.add(ws)
        except Exception:
            logger.warning("Failed to send to admin WS client", exc_info=True)
            dead.add(ws)

    state.ws_clients -= dead


async def broadcast_to_users(message: dict) -> None:
    """Broadcast a message to all connected user WebSocket clients."""
    if not state.user_ws_clients:
        return

    dead = set()
    payload = json.dumps(message)
    for ws in list(state.user_ws_clients):
        try:
            await ws.send_text(payload)
        except WebSocketDisconnect:
            dead.add(ws)
        except Exception:
            logger.warning("Failed to send to user WS client", exc_info=True)
            dead.add(ws)

    state.user_ws_clients -= dead
