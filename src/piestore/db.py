import asyncio
import logging

import asyncpg

logger = logging.getLogger(__name__)


async def wait_for_db(database_url: str, timeout: float = 30) -> asyncpg.Pool:
    """Wait for Postgres to be ready, then return a connection pool."""
    deadline = asyncio.get_event_loop().time() + timeout
    last_error = None

    while asyncio.get_event_loop().time() < deadline:
        try:
            pool = await asyncpg.create_pool(database_url, min_size=2, max_size=10)
            logger.info("Connected to Postgres")
            return pool
        except (asyncpg.PostgresError, OSError, ConnectionRefusedError) as e:
            last_error = e
            await asyncio.sleep(1)

    raise RuntimeError(f"Could not connect to Postgres within {timeout}s: {last_error}")


async def seed_schema(pool: asyncpg.Pool) -> None:
    """Create tables if they don't exist."""
    import importlib.resources as resources

    seeds_dir = resources.files("piestore") / "seeds"
    schema_sql = (seeds_dir / "01_schema.sql").read_text()

    async with pool.acquire() as conn:
        await conn.execute(schema_sql)
    logger.info("Schema seeded")


async def seed_products(pool: asyncpg.Pool) -> None:
    """Seed the product catalog."""
    import importlib.resources as resources

    seeds_dir = resources.files("piestore") / "seeds"
    products_sql = (seeds_dir / "02_products.sql").read_text()

    async with pool.acquire() as conn:
        # Only seed if empty
        count = await conn.fetchval("SELECT COUNT(*) FROM products")
        if count == 0:
            await conn.execute(products_sql)
            logger.info("Products seeded")


async def seed_tickets(pool: asyncpg.Pool) -> None:
    """Seed support tickets including poisoned ones."""
    import importlib.resources as resources

    seeds_dir = resources.files("piestore") / "seeds"
    tickets_sql = (seeds_dir / "03_tickets.sql").read_text()

    async with pool.acquire() as conn:
        count = await conn.fetchval("SELECT COUNT(*) FROM tickets")
        if count == 0:
            await conn.execute(tickets_sql)
            logger.info("Tickets seeded")


async def record_capture(pool: asyncpg.Pool, name: str, secret_type: str, mode: int) -> None:
    """Record a successful secret capture to the leaderboard."""
    async with pool.acquire() as conn:
        await conn.execute(
            "INSERT INTO captures (name, secret_type, mode) VALUES ($1, $2, $3)",
            name,
            secret_type,
            mode,
        )


async def get_leaderboard(pool: asyncpg.Pool, limit: int = 20) -> list[dict]:
    """Get the leaderboard - top capturers by total captures."""
    async with pool.acquire() as conn:
        rows = await conn.fetch(
            """
            SELECT
                name,
                COUNT(*) FILTER (WHERE secret_type = 'github') as github_count,
                COUNT(*) FILTER (WHERE secret_type = 'aws') as aws_count,
                COUNT(*) FILTER (WHERE secret_type = 'cc') as cc_count,
                COUNT(*) as total,
                array_agg(DISTINCT mode) as modes
            FROM captures
            GROUP BY name
            ORDER BY total DESC
            LIMIT $1
        """,
            limit,
        )
        return [dict(r) for r in rows]


async def get_capture_stats(pool: asyncpg.Pool) -> dict:
    """Get aggregate capture statistics."""
    async with pool.acquire() as conn:
        row = await conn.fetchrow("""
            SELECT
                COUNT(*) as total,
                COUNT(*) FILTER (WHERE secret_type = 'github') as github_total,
                COUNT(*) FILTER (WHERE secret_type = 'aws') as aws_total,
                COUNT(*) FILTER (WHERE secret_type = 'cc') as cc_total,
                COUNT(*) FILTER (WHERE mode = 1) as mode1_total,
                COUNT(*) FILTER (WHERE mode = 2) as mode2_total,
                COUNT(*) FILTER (WHERE mode = 3) as mode3_total
            FROM captures
        """)
        return (
            dict(row)
            if row
            else {
                "total": 0,
                "github_total": 0,
                "aws_total": 0,
                "cc_total": 0,
                "mode1_total": 0,
                "mode2_total": 0,
                "mode3_total": 0,
            }
        )
