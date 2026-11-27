#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
CONTAINER_NAME="cosyevents-video-schema-test-$$"
READY=0

cleanup() {
  docker rm -f "$CONTAINER_NAME" >/dev/null 2>&1 || true
}
trap cleanup EXIT INT TERM

docker run --rm -d \
  --name "$CONTAINER_NAME" \
  -e POSTGRES_HOST_AUTH_METHOD=trust \
  postgres:16-alpine >/dev/null

for attempt in $(seq 1 60); do
  if docker exec "$CONTAINER_NAME" pg_isready -h 127.0.0.1 -U postgres >/dev/null 2>&1; then
    READY=1
    break
  fi
done

if [[ "$READY" != "1" ]]; then
  printf '%s\n' 'Temporary PostgreSQL did not become ready.' >&2
  exit 1
fi

docker exec -i "$CONTAINER_NAME" psql -h 127.0.0.1 -v ON_ERROR_STOP=1 -U postgres <<'SQL'
CREATE ROLE anon NOLOGIN;
CREATE ROLE authenticated NOLOGIN;
CREATE ROLE service_role NOLOGIN BYPASSRLS;
CREATE SCHEMA auth;
CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql STABLE AS $$
  SELECT nullif(current_setting('request.jwt.claim.sub', true), '')::uuid
$$;
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY,
  role text NOT NULL DEFAULT 'student',
  hosted_sessions text[] NOT NULL DEFAULT '{}'
);
CREATE SCHEMA storage;
CREATE TABLE storage.buckets (
  id text PRIMARY KEY,
  name text NOT NULL,
  public boolean NOT NULL DEFAULT false
);
CREATE TABLE storage.objects (
  name text NOT NULL,
  bucket_id text NOT NULL
);
SQL

for migration_pass in 1 2; do
  for schema_file in scripts/schema.sql scripts/video_meetings_schema.sql; do
    docker exec -i "$CONTAINER_NAME" psql -h 127.0.0.1 -v ON_ERROR_STOP=1 -U postgres < "$ROOT_DIR/$schema_file"
  done
done

docker exec -i "$CONTAINER_NAME" psql -h 127.0.0.1 -v ON_ERROR_STOP=1 -U postgres < "$ROOT_DIR/scripts/test_video_meetings_schema.sql"

printf '%s\n' 'Video meeting schema and capacity checks passed in disposable PostgreSQL.'
