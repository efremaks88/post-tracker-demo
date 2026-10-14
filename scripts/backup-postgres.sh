#!/usr/bin/env bash
set -euo pipefail

usage() {
  echo "Usage: $0 DATABASE BACKUP_DIRECTORY HOST PORT USER" >&2
  echo "Use PGPASSFILE/~/.pgpass or PGPASSWORD for authentication; passwords are never accepted as arguments." >&2
}

if [[ $# -ne 5 ]]; then
  usage
  exit 64
fi

database=$1
backup_directory=$2
host=$3
port=$4
user=$5

[[ $database =~ ^[A-Za-z0-9_.-]+$ ]] || { echo "Invalid database name." >&2; exit 64; }
[[ $port =~ ^[0-9]+$ ]] && ((port >= 1 && port <= 65535)) || { echo "Invalid port." >&2; exit 64; }

script_directory=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd -P)
repository_root=$(cd -- "$script_directory/.." && pwd -P)
mkdir -p -- "$backup_directory"
backup_root=$(cd -- "$backup_directory" && pwd -P)

case "$backup_root/" in
  "$repository_root/"*)
    echo "Backup directory must be outside the Git repository and public directory." >&2
    exit 64
    ;;
esac

pg_bin=${PG_BIN:-}
tool() {
  local name=$1
  if [[ -n $pg_bin ]]; then
    [[ -x "$pg_bin/$name" ]] || { echo "PostgreSQL tool not found: $pg_bin/$name" >&2; exit 69; }
    printf '%s\n' "$pg_bin/$name"
  else
    command -v "$name" || { echo "PostgreSQL tool '$name' was not found." >&2; exit 69; }
  fi
}

pg_dump_bin=$(tool pg_dump)
pg_restore_bin=$(tool pg_restore)
command -v sha256sum >/dev/null || { echo "Required tool 'sha256sum' was not found." >&2; exit 69; }
timestamp=$(date -u +%Y%m%dT%H%M%SZ)
final_path="$backup_root/${database}_${timestamp}.dump"
partial_path="$final_path.partial"
catalogue_path="$final_path.catalogue.partial"

cleanup() {
  rm -f -- "$partial_path" "$catalogue_path"
}
trap cleanup EXIT

"$pg_dump_bin" \
  --format=custom \
  --compress=6 \
  --no-owner \
  --no-privileges \
  --no-password \
  --host "$host" \
  --port "$port" \
  --username "$user" \
  --dbname "$database" \
  --file "$partial_path"

"$pg_restore_bin" --list "$partial_path" > "$catalogue_path"
for table in projects series tasks users app_state; do
  grep -Eq "[[:space:]]TABLE[[:space:]]+public[[:space:]]+$table[[:space:]]" "$catalogue_path" || {
    echo "Backup validation failed: required table '$table' is missing." >&2
    exit 65
  }
done

mv -- "$partial_path" "$final_path"
(cd -- "$backup_root" && sha256sum -- "$(basename -- "$final_path")") > "$final_path.sha256"
rm -f -- "$catalogue_path"
trap - EXIT

echo "Backup created and catalogue-checked: $final_path"

