# Build UIs first
FROM node:22-alpine AS ui-builder
WORKDIR /build
COPY public-ui/ public-ui/
COPY admin-ui/ admin-ui/
RUN cd public-ui && npm ci && npm run build
RUN cd admin-ui && npm ci && npm run build

# Main image
FROM python:3.13-slim

RUN apt-get update && apt-get install -y \
    postgresql-16 postgresql-contrib supervisor \
 && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# uv for fast install
COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/

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
