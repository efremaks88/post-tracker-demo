# Post Tracker v1.4.2 engineering baseline

Date: 2026-10-15 (Europe/Moscow)

## Active source root

`I:\01_Сoding\Post_Tracker\postprod-tracker-clean-2026-08-31-1711`

The parent workspace also contains archives and a separate Python/JSON demonstration. They are not part of this Git repository.

## Source control checkpoint

- Branch: `main`
- Baseline commit: `5a101c56acc9d0cf7c81623e40c7ba3890631348`
- Annotated tag: `v1.4.2-baseline`
- Remote repository: none
- Local Git author used for Codex changes: `Codex <codex@local>`

Before the baseline commit, candidate files were scanned by filename and content signature for environment files, private keys, common token formats, assigned secret literals, database dumps, backups, logs and local state. Only `.env.example` was found; it contains documented placeholder values. `node_modules/` and secret/backup patterns are excluded by the repository `.gitignore`.

This is a recovered/sanitized source snapshot. It does not prove that historical production files or production database contents were free of secrets.

## Toolchain used

- Node.js: `v24.21.0` from the workspace-local runtime
- npm: `11.19.0`
- Project requirement: Node.js `>=20.12.0`
- Git: `2.56.0.windows.2`

The local Node directory was added only to the command process `PATH`; the machine-wide environment was not changed.

## Baseline verification

Commands were run against the baseline source without connecting to production:

| Command | Result |
|---|---|
| `npm test` | 112 passed, 0 failed |
| `npm run check` | Syntax OK: 28 JavaScript files |
| `npm run security:smoke` | Passed |
| `npm run build` | Passed; rebuilt `public/app.js` with no Git diff |

The database tests use an in-process PGlite database, apply all 12 migrations and start a local ephemeral HTTP listener. They do not verify a real PostgreSQL server, LDAP, nginx, systemd or production backup restoration.

## Backup and restore status

Implemented:

- Windows and Linux custom-format backup scripts;
- archive catalogue validation for core application tables;
- SHA-256 generation;
- restore scripts restricted to a new `postprod_restore_test_*` database;
- post-restore checks for core tables, migration table and row counts;
- operational instructions in `docs/engineering/BACKUP_RESTORE.md`.

Not yet verified against a live PostgreSQL instance:

- actual `pg_dump` output;
- creation and restoration of a temporary PostgreSQL database;
- application startup against a restored database;
- retention automation on the eventual host.

The A0 workstation does not currently expose PostgreSQL client tools or an explicitly isolated PostgreSQL server. Therefore no real backup has been created and no restore has been claimed. Production access remains out of scope until the owner explicitly authorises it.

## Known baseline limitations

- Git reports different Windows ownership between the workspace owner and the sandbox account. Commands use a per-command `safe.directory`; no global Git configuration was changed.
- Existing baseline files contain several trailing-whitespace warnings. They were preserved to keep the recovered source checkpoint exact.
- PostgreSQL backup/restore needs an isolated database and client tools for a full exercise.
- LDAP and deployment configuration remain untested in this local baseline.

## Rollback

The exact recovered source is available at tag `v1.4.2-baseline`. Later code changes can be reverted without deleting the working directory or touching a database. Database rollback requires a separately verified backup and restore procedure; the Git tag does not contain database contents.
