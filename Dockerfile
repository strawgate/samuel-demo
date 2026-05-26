# Build UIs first
FROM node:22-alpine AS ui-builder
WORKDIR /build
COPY public-ui/ public-ui/
COPY admin-ui/ admin-ui/
RUN cd public-ui && npm ci && npm run build
RUN cd admin-ui && npm ci && npm run build

# Main image
FROM python:3.13-slim

RUN apt-get update && apt-get install -y curl ca-certificates gnupg \
 && curl -fsSL https://www.postgresql.org/media/keys/ACCC4CF8.asc | gpg --dearmor -o /usr/share/keyrings/pgdg.gpg \
 && echo "deb [signed-by=/usr/share/keyrings/pgdg.gpg] http://apt.postgresql.org/pub/repos/apt trixie-pgdg main" > /etc/apt/sources.list.d/pgdg.list \
 && apt-get update && apt-get install -y \
    postgresql-16 postgresql-contrib supervisor \
 && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# uv for fast install
ARG UV_VERSION=0.7.8
COPY --from=ghcr.io/astral-sh/uv:0.7.8 /uv /uvx /bin/

COPY pyproject.toml uv.lock ./
RUN uv sync --frozen --no-dev

COPY src/ ./src/
COPY supervisord.conf entrypoint.sh ./
RUN chmod +x entrypoint.sh

# Copy built UI bundles into the Python package's static dir
COPY --from=ui-builder /build/public-ui/dist ./src/piestore/static/public
COPY --from=ui-builder /build/admin-ui/dist  ./src/piestore/static/admin

EXPOSE 8080
CMD ["./entrypoint.sh"]
