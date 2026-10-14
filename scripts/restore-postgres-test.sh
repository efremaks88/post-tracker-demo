#!/usr/bin/env bash
set -euo pipefail

usage() {
  echo "Usage: $0 BACKUP_FILE TARGET_TEST_DATABASE HOST PORT USER [MAINTENANCE_DATABASE]" >&2
  echo "TARGET_TEST_DATABASE must start with postprod_restore_test_." >&2
}

if [[ $# -lt 5 || $# -gt 6 ]]; then
  usage
  exit 64
fi

backup_file=$1
target_database=$2
host=$3
port=$4
user=$5
maintenance_database=${6:-postgres}

[[ -f $backup_file ]] || { echo "Backup file does not exist." >&2; exit 66; }
[[ $target_database =~ ^postprod_restore_test_[A-Za-z0-9_]+$ ]] || { echo "Unsafe target database name." >&2; exit 64; }
[[ $port =~ ^[0-9]+$ ]] && ((port >= 1 && port <= 65535)) || { echo "Invalid port." >&2; exit 64; }

checksum_file="$backup_file.sha256"
if [[ -f $checksum_file ]]; then
  command -v sha256sum >/dev/null || { echo "Required tool 'sha256sum' was not found." >&2; exit 69; }
  backup_directory=$(cd -- "$(dirname -- "$backup_file")" && pwd -P)
  checksum_name=$(basename -- "$checksum_file")
  (cd -- "$backup_directory" && sha256sum --check --status "$checksum_name") || {
    echo "Restore refused: backup SHA-256 does not match its sidecar." >&2
    exit 65
  }
else
  echo "Warning: no SHA-256 sidecar was found; relying on archive catalogue validation." >&2
fi

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

pg_restore_bin=$(tool pg_restore)
psql_bin=$(tool psql)
createdb_bin=$(tool createdb)
connection=(--no-password --host "$host" --port "$port" --username "$user")

catalogue_file=$(mktemp)
trap 'rm -f -- "$catalogue_file"' EXIT
"$pg_restore_bin" --list "$backup_file" > "$catalogue_file"
for table in projects series tasks users app_state; do
  grep -Eq "[[:space:]]TABLE[[:space:]]+public[[:space:]]+$table[[:space:]]" "$catalogue_file" || {
    echo "Restore refused: required table '$table' is missing." >&2
    exit 65
  }
done

existing=$("$psql_bin" "${connection[@]}" --dbname "$maintenance_database" --no-align --tuples-only --set ON_ERROR_STOP=1 \
  --command "SELECT 1 FROM pg_database WHERE datname = '$target_database';")
[[ $existing != 1 ]] || { echo "Restore refused: database already exists." >&2; exit 73; }

"$createdb_bin" "${connection[@]}" --maintenance-db "$maintenance_database" --encoding UTF8 "$target_database"

if ! "$pg_restore_bin" --exit-on-error --no-owner --no-privileges "${connection[@]}" --dbname "$target_database" "$backup_file"; then
  echo "Restore failed. Test database '$target_database' was kept for investigation." >&2
  exit 70
fi

required_count=$("$psql_bin" "${connection[@]}" --dbname "$target_database" --no-align --tuples-only --set ON_ERROR_STOP=1 --command "
SELECT count(*)
FROM (VALUES
  ('public.projects'),
  ('public.series'),
  ('public.tasks'),
  ('public.users'),
  ('public.app_state'),
  ('public._migrations')
) AS required(name)
WHERE to_regclass(name) IS NOT NULL;")

[[ $required_count == 6 ]] || {
  echo "Restore verification failed. Test database '$target_database' was kept for investigation." >&2
  exit 70
}

counts=$("$psql_bin" "${connection[@]}" --dbname "$target_database" --no-align --tuples-only --set ON_ERROR_STOP=1 --command "
SELECT
  'projects=' || (SELECT count(*) FROM projects) ||
  '|series=' || (SELECT count(*) FROM series) ||
  '|tasks=' || (SELECT count(*) FROM tasks) ||
  '|migrations=' || (SELECT count(*) FROM _migrations);")

echo "Restore verified in isolated database: $target_database"
echo "$counts"
echo "The test database was intentionally kept for inspection; remove it manually after review."

