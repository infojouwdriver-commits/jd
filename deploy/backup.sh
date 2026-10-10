#!/bin/sh
set -eu
umask 077
: "${BACKUP_RECIPIENT:?Set age encryption public recipient}"
command -v age >/dev/null
directory="${BACKUP_DIRECTORY:-backups}"
mkdir -p "$directory"
chmod 700 "$directory"
work=$(mktemp -d "$directory/.backup.XXXXXX")
filename="$directory/database-$(date -u +%Y%m%dT%H%M%SZ)-${work##*.}.dump.age"
producer=''
cleanup() {
  if [ -n "$producer" ]; then kill "$producer" 2>/dev/null || true; fi
  rm -rf "$work"
}
trap cleanup EXIT
trap 'exit 1' INT TERM
mkfifo "$work/dump"
docker compose exec -T db sh -c 'pg_dump -U postgres -d "$POSTGRES_DB" -Fc' > "$work/dump" &
producer=$!
if ! age -r "$BACKUP_RECIPIENT" -o "$work/encrypted" < "$work/dump"; then exit 1; fi
if ! wait "$producer"; then producer=''; exit 1; fi
producer=''
# Publish only after both tools succeed; hard-link creation never replaces a file.
chmod 600 "$work/encrypted"
ln "$work/encrypted" "$filename"
printf 'Encrypted backup created: %s\n' "$filename"
