import secrets

from fastapi import Request, HTTPException

from .config import settings


async def require_admin(request: Request) -> str:
    """Verify admin access via Bearer token in Authorization header or admin_token cookie.
    Returns the token if valid.
    """
    # Check Authorization header first
    auth_header = request.headers.get("Authorization", "")
    if auth_header.startswith("Bearer "):
        token = auth_header[7:]
        if secrets.compare_digest(token, settings.admin_token):
            return token

    # Check cookie
    cookie_token = request.cookies.get("admin_token")
    if cookie_token and secrets.compare_digest(cookie_token, settings.admin_token):
        return cookie_token

    raise HTTPException(status_code=401, detail="Invalid or missing admin token")
