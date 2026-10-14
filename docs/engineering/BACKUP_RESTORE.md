# PostgreSQL backup and restore runbook

The scripts in this repository create a PostgreSQL custom-format archive and verify its catalogue. Restoration is allowed only into a new database whose name starts with `postprod_restore_test_`.

The scripts never read `.env` themselves and do not accept a password as a command-line argument. Use a PostgreSQL password file where possible:

- Windows: `%APPDATA%\postgresql\pgpass.conf`;
- Linux: `~/.pgpass` with permissions `0600`;
- short-lived local test only: `PGPASSWORD` in the process environment.

Never store password files, dumps or SHA files inside this repository or under `public/`.

## Requirements

- Matching PostgreSQL client tools: `pg_dump`, `pg_restore`, `psql`, and `createdb`.
- A backup account with connection rights and read access to the application database.
- A restore account that can create an isolated test database.
- Enough encrypted storage outside the repository.

Use client tools from the same major PostgreSQL version as the server, or a newer supported client version. Record tool versions alongside operational logs.

## Windows backup

```powershell
$env:PGPASSFILE = "$env:APPDATA\postgresql\pgpass.conf"
./scripts/backup-postgres.ps1 `
  -Database postprod_tracker `
  -BackupDirectory 'D:\PostTrackerBackups' `
  -HostName localhost `
  -Port 5432 `
  -UserName postprod_backup `
  -PgBin 'C:\Program Files\PostgreSQL\16\bin'
```

The result is a timestamped `.dump` and a `.sha256` checksum. The script first writes a `.partial` file, validates that the archive catalogue contains the main application tables, and only then publishes the final filename.

## Windows restore verification

Choose a new database name for every exercise:

```powershell
./scripts/restore-postgres-test.ps1 `
  -BackupFile 'D:\PostTrackerBackups\postprod_tracker_20261015T010000Z.dump' `
  -TargetDatabase postprod_restore_test_20261015 `
  -HostName localhost `
  -Port 5432 `
  -UserName postprod_restore `
  -PgBin 'C:\Program Files\PostgreSQL\16\bin'
```

The restore script refuses an existing target database and refuses names without the test prefix. It validates the SHA-256 sidecar when one is present, verifies the main tables, migration table and non-sensitive row counts, and intentionally leaves the restored database available for inspection. A missing sidecar produces a warning so that older archives can still be investigated; such a run is not a complete integrity check.

After review, an operator may remove only the confirmed test-prefixed database:

```powershell
dropdb --host localhost --port 5432 --username postprod_restore postprod_restore_test_20261015
```

Check the exact database name before running cleanup. The supplied restore script never drops a database.

## Linux backup

```bash
export PGPASSFILE="$HOME/.pgpass"
./scripts/backup-postgres.sh \
  postprod_tracker \
  /srv/encrypted-backups/post-tracker \
  localhost \
  5432 \
  postprod_backup
```

Set `PG_BIN=/path/to/postgresql/bin` when the tools are not in `PATH`.

## Linux restore verification

```bash
./scripts/restore-postgres-test.sh \
  /srv/encrypted-backups/post-tracker/postprod_tracker_20261015T010000Z.dump \
  postprod_restore_test_20261015 \
  localhost \
  5432 \
  postprod_restore
```

## Operating policy

Suggested starting policy, to be confirmed by the system owner:

- automatic backup every night;
- keep 14 daily archives;
- keep 8 weekly archives;
- keep 12 monthly archives;
- run an isolated restore exercise after initial setup and at least quarterly;
- keep one encrypted copy on separate storage;
- monitor both command exit status and available storage;
- rotate database credentials according to the organisation's security policy.

Use BitLocker/EFS on Windows or an encrypted filesystem such as LUKS on Linux. For transfer to separate storage, use an authenticated encrypted channel such as SSH/SFTP or an encrypted backup product. A checksum detects corruption but does not encrypt the archive.

## What counts as a verified backup

A successful `pg_dump` alone is not enough. Record all of the following:

1. backup command exit code is zero;
2. `pg_restore --list` can read the catalogue;
3. checksum is stored next to the archive;
4. archive restores into a new test-prefixed database;
5. required tables and migration state are readable;
6. application smoke tests can use the restored database where the environment permits it.

No production backup or restore is performed automatically by repository tests.

