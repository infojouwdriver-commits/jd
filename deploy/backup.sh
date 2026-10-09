#!/bin/sh
set -eu
: "${BACKUP_RECIPIENT:?Set age encryption public recipient}"
command -v age >/dev/null
mkdir -p backups
chmod 700 backups
filename="backups/database-$(date -u +%Y%m%dT%H%M%SZ).dump.age"
work=$(mktemp -d)
trap 'rm -rf "$work"' EXIT INT TERM
mkfifo "$work/dump"
docker compose exec -T db sh -c 'pg_dump -U postgres -d "$POSTGRES_DB" -Fc' > "$work/dump" &
producer=$!
if ! age -r "$BACKUP_RECIPIENT" -o "$filename" < "$work/dump"; then kill "$producer" 2>/dev/null || true; rm -f "$filename"; exit 1; fi
if ! wait "$producer"; then rm -f "$filename"; exit 1; fi
chmod 600 "$filename"
printf 'Encrypted backup created: %s\n' "$filename"
