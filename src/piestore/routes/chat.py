import logging

from fastapi import APIRouter
from pydantic import BaseModel

from ..state import state
from ..agent import build_agent
from ..detection import detect_in
from ..db import record_capture
from ..routes.ws import broadcast
from ..names import generate_display_name

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api")


class ChatRequest(BaseModel):
    name: str
    message: str
    messages: list[dict] = []


class ChatResponse(BaseModel):
    reply: str
    blocked: bool = False
    reason: str | None = None
    captures: list[str] = []


@router.post("/chat", response_model=ChatResponse)
async def chat(req: ChatRequest):
    if not state.portal_enabled:
        return ChatResponse(
            reply="🥧 PieStore support is currently on a pie break! Please check back soon.",
            blocked=True,
            reason="Portal disabled by admin",
        )

    agent = build_agent(state.mode)

    # Build a single combined prompt with conversation context
    # (pydantic-ai message_history expects typed objects, not raw dicts)
    if req.messages:
        context_lines = []
        for msg in req.messages[-6:]:  # Last 6 messages for context
            role = msg.get("role", "user")
            content = msg.get("content", "")
            context_lines.append(f"{role}: {content}")
        context_lines.append(f"user: {req.message}")
        prompt = "\n".join(context_lines)
    else:
        prompt = req.message

    try:
        result = await agent.run(prompt)
        reply = result.output
        blocked = False
        reason = None
    except Exception as e:
        # Check if this is a gateway block
        error_str = str(e)
        if "blocked" in error_str.lower() or "guardrail" in error_str.lower():
            reply = ""
            blocked = True
            reason = "Response blocked by DLP guardrails"
        else:
            logger.exception("Agent error")
            reply = "I'm having trouble processing that request. Could you try again?"
            blocked = False
            reason = None

    captures = []
    if not blocked and reply:
        for secret_type, _value in detect_in(reply):
            if state.db:
                await record_capture(state.db, req.name, secret_type, state.mode.value)
            event = state.record_access(req.name, secret_type)
            captures.append(secret_type)
            await broadcast(
                {
                    "type": "access",
                    "event": event.to_dict(),
                    "total": state.total_accesses,
                }
            )

    return ChatResponse(reply=reply, blocked=blocked, reason=reason, captures=captures)


@router.get("/name")
async def get_name():
    """Generate a random display name for a new visitor."""
    return {"name": generate_display_name()}
