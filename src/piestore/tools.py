"""Support tools for the PieStore agent - DB-backed, never return secrets."""

from typing import Any


def build_support_toolset(db) -> list:
    """Build the list of support tools backed by the database pool."""

    async def lookup_ticket(ticket_id: int) -> dict[str, Any]:
        """Look up a customer support ticket by ID."""
        if not db:
            return {"error": "Database unavailable"}
        async with db.acquire() as conn:
            row = await conn.fetchrow(
                "SELECT id, customer_email, subject, body, status, created_at "
                "FROM tickets WHERE id = $1",
                ticket_id,
            )
            if not row:
                return {"error": f"No ticket found with ID {ticket_id}"}
            return dict(row)

    async def search_products(query: str) -> list[dict[str, Any]]:
        """Search the pie catalog by name or description. Returns up to 10 matches."""
        if not db:
            return [{"error": "Database unavailable"}]
        async with db.acquire() as conn:
            rows = await conn.fetch(
                "SELECT sku, name, description, price_cents, stock FROM products "
                "WHERE name ILIKE $1 OR description ILIKE $1 LIMIT 10",
                f"%{query}%",
            )
            return [dict(r) for r in rows]

    async def get_product(sku: str) -> dict[str, Any]:
        """Get full details for a product by SKU."""
        if not db:
            return {"error": "Database unavailable"}
        async with db.acquire() as conn:
            row = await conn.fetchrow(
                "SELECT sku, name, description, price_cents, stock FROM products WHERE sku = $1",
                sku,
            )
            if not row:
                return {"error": f"No product found with SKU {sku}"}
            return dict(row)

    async def list_recent_orders(email: str) -> list[dict[str, Any]]:
        """List recent orders for a customer email."""
        if not db:
            return [{"error": "Database unavailable"}]
        async with db.acquire() as conn:
            rows = await conn.fetch(
                "SELECT o.id, o.sku, o.qty, o.status, o.created_at, p.name as product_name "
                "FROM orders o JOIN products p ON o.sku = p.sku "
                "JOIN customers c ON o.customer_id = c.id "
                "WHERE c.email = $1 ORDER BY o.created_at DESC LIMIT 10",
                email,
            )
            return [dict(r) for r in rows]

    async def create_ticket(subject: str, body: str, email: str = "anonymous@piestore.com") -> dict:
        """File a new support ticket. Returns the new ticket ID."""
        if not db:
            return {"error": "Database unavailable"}
        async with db.acquire() as conn:
            ticket_id = await conn.fetchval(
                "INSERT INTO tickets (customer_email, subject, body) "
                "VALUES ($1, $2, $3) RETURNING id",
                email,
                subject,
                body,
            )
            return {"ticket_id": ticket_id, "status": "created"}

    async def list_tickets(status: str = "open", limit: int = 10) -> list[dict[str, Any]]:
        """List support tickets, optionally filtered by status."""
        if not db:
            return [{"error": "Database unavailable"}]
        async with db.acquire() as conn:
            rows = await conn.fetch(
                "SELECT id, customer_email, subject, status, created_at "
                "FROM tickets WHERE status = $1 ORDER BY created_at DESC LIMIT $2",
                status,
                limit,
            )
            return [dict(r) for r in rows]

    return [
        lookup_ticket,
        search_products,
        get_product,
        list_recent_orders,
        create_ticket,
        list_tickets,
    ]
