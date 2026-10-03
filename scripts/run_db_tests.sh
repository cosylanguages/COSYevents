#!/usr/bin/env bash
set -euo pipefail

if [ -z "${DATABASE_URL:-}" ]; then
  echo "Error: DATABASE_URL environment variable is not set." >&2
  exit 1
fi

echo "==> Running COSYevents database access control tests..."

echo "1. Applying plain Postgres stubs..."
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f supabase/tests/00_stubs_for_plain_postgres.sql

echo "2. Applying database migration..."
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f supabase/migrations/20261003000000_ecosystem_access.sql

echo "3. Running access rules test suite..."
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f supabase/tests/access_rules.sql

echo "==> All database access control tests passed successfully!"
