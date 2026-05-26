#!/usr/bin/env bash
# Set Fly.io secrets for the piestore app.
# Usage: ./scripts/fly-secrets.sh
#
# Requires: flyctl authenticated, .env file with values to push.

set -euo pipefail

APP="piestore"

# Source .env if present
if [[ -f .env ]]; then
  set -a
  # shellcheck disable=SC1091
  source .env
  set +a
fi

: "${PYDANTIC_AI_GATEWAY_API_KEY:?Set PYDANTIC_AI_GATEWAY_API_KEY in .env or environment}"
: "${ADMIN_TOKEN:?Set ADMIN_TOKEN in .env or environment}"
: "${DATABASE_URL:?Set DATABASE_URL in .env or environment}"

echo "Setting secrets for app: $APP"

fly secrets set \
  PYDANTIC_AI_GATEWAY_API_KEY="$PYDANTIC_AI_GATEWAY_API_KEY" \
  ADMIN_TOKEN="$ADMIN_TOKEN" \
  DATABASE_URL="$DATABASE_URL" \
  --app "$APP"

echo "Done. Secrets set for $APP."
