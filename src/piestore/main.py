"""FastAPI app, lifespan, static mounts."""

import logging
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse
from fastapi.staticfiles import StaticFiles

from .config import settings
from .state import state
from .db import wait_for_db, seed_schema, seed_products, seed_tickets
from .secrets_gen import generate_secrets
from .routes.chat import router as chat_router
from .routes.admin import router as admin_router
from .routes.leaderboard import router as leaderboard_router
from .routes.ws import router as ws_router

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize database
    if settings.database_url:
        try:
            state.db = await wait_for_db(settings.database_url, timeout=5)
            await seed_schema(state.db)
            await seed_products(state.db)
            await seed_tickets(state.db)
            logger.info("Database ready")
        except Exception as e:
            logger.warning(f"Database not available: {e}. Running without persistence.")
            state.db = None

    # Generate fresh secrets every startup
    state.secrets = generate_secrets()
    logger.info(f"Secrets generated: {list(state.secrets.keys())}")

    # Restore total_accesses from DB
    if state.db:
        import asyncpg

        async with state.db.acquire() as conn:
            count = await conn.fetchval("SELECT COUNT(*) FROM captures")
            state.total_accesses = count or 0

    yield

    if state.db:
        await state.db.close()


app = FastAPI(title="PieStore", version="0.1.0", lifespan=lifespan)

# CORS for dev
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# API routes
app.include_router(chat_router)
app.include_router(admin_router)
app.include_router(leaderboard_router)
app.include_router(ws_router)

# Static file mounts - serve built UI bundles
# IMPORTANT: admin must come before public (which is catch-all at /)
static_dir = Path(__file__).parent / "static"
public_dir = static_dir / "public"
admin_dir = static_dir / "admin"


@app.get("/admin")
async def admin_redirect():
    return RedirectResponse(url="/admin/")


if admin_dir.exists():
    app.mount("/admin", StaticFiles(directory=str(admin_dir), html=True), name="admin")

if public_dir.exists():
    app.mount("/", StaticFiles(directory=str(public_dir), html=True), name="public")
