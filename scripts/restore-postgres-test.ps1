[CmdletBinding()]
param(
  [Parameter(Mandatory = $true)]
  [ValidateScript({ Test-Path -LiteralPath $_ -PathType Leaf })]
  [string]$BackupFile,

  [Parameter(Mandatory = $true)]
  [ValidatePattern('^postprod_restore_test_[A-Za-z0-9_]+$')]
  [string]$TargetDatabase,

  [string]$HostName = 'localhost',

  [ValidateRange(1, 65535)]
  [int]$Port = 5432,

  [Parameter(Mandatory = $true)]
  [string]$UserName,

  [string]$MaintenanceDatabase = 'postgres',

  [string]$PgBin = ''
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

function Resolve-PgTool([string]$Name) {
  if ($PgBin) {
    $candidate = Join-Path $PgBin ($Name + '.exe')
    if (Test-Path -LiteralPath $candidate -PathType Leaf) {
      return (Resolve-Path -LiteralPath $candidate).Path
    }
    throw "PostgreSQL tool not found: $candidate"
  }

  $command = Get-Command $Name -ErrorAction SilentlyContinue
  if (-not $command) {
    throw "PostgreSQL tool '$Name' was not found. Add PostgreSQL bin to PATH or pass -PgBin."
  }
  return $command.Source
}

$backupPath = (Resolve-Path -LiteralPath $BackupFile).Path
$checksumPath = $backupPath + '.sha256'
if (Test-Path -LiteralPath $checksumPath -PathType Leaf) {
  $checksumLine = (Get-Content -LiteralPath $checksumPath -TotalCount 1).Trim()
  $expectedHash = ($checksumLine -split '\s+')[0].ToLowerInvariant()
  if ($expectedHash -notmatch '^[0-9a-f]{64}$') {
    throw 'Restore refused: checksum sidecar has an invalid format.'
  }
  $actualHash = (Get-FileHash -LiteralPath $backupPath -Algorithm SHA256).Hash.ToLowerInvariant()
  if ($actualHash -ne $expectedHash) {
    throw 'Restore refused: backup SHA-256 does not match its sidecar.'
  }
}
else {
  Write-Warning 'No SHA-256 sidecar was found. Archive integrity can only be checked by pg_restore catalogue parsing.'
}

$pgRestore = Resolve-PgTool 'pg_restore'
$psql = Resolve-PgTool 'psql'
$createdb = Resolve-PgTool 'createdb'

$listing = & $pgRestore '--list' $backupPath
if ($LASTEXITCODE -ne 0) {
  throw "The backup catalogue is unreadable (pg_restore exit code $LASTEXITCODE)."
}
foreach ($table in @('projects', 'series', 'tasks', 'users', 'app_state')) {
  if ($listing -notmatch ("\sTABLE\s+public\s+" + [regex]::Escape($table) + "\s")) {
    throw "Restore refused: required table '$table' is missing from the archive catalogue."
  }
}

$connectionArguments = @('--no-password', '--host', $HostName, '--port', [string]$Port, '--username', $UserName)
$existsSql = "SELECT 1 FROM pg_database WHERE datname = '$TargetDatabase';"
$existing = & $psql @connectionArguments '--dbname' $MaintenanceDatabase '--no-align' '--tuples-only' '--set' 'ON_ERROR_STOP=1' '--command' $existsSql
if ($LASTEXITCODE -ne 0) {
  throw "Could not check target database existence (psql exit code $LASTEXITCODE)."
}
if (($existing | Out-String).Trim() -eq '1') {
  throw "Restore refused: test database '$TargetDatabase' already exists. Choose a new test-prefixed name."
}

& $createdb @connectionArguments '--maintenance-db' $MaintenanceDatabase '--encoding' 'UTF8' $TargetDatabase
if ($LASTEXITCODE -ne 0) {
  throw "createdb failed with exit code $LASTEXITCODE"
}

try {
  & $pgRestore '--exit-on-error' '--no-owner' '--no-privileges' @connectionArguments '--dbname' $TargetDatabase $backupPath
  if ($LASTEXITCODE -ne 0) {
    throw "pg_restore failed with exit code $LASTEXITCODE"
  }

  $requiredTablesSql = @"
SELECT count(*)
FROM (VALUES
  ('public.projects'),
  ('public.series'),
  ('public.tasks'),
  ('public.users'),
  ('public.app_state'),
  ('public._migrations')
) AS required(name)
WHERE to_regclass(name) IS NOT NULL;
"@
  $tableCount = & $psql @connectionArguments '--dbname' $TargetDatabase '--no-align' '--tuples-only' '--set' 'ON_ERROR_STOP=1' '--command' $requiredTablesSql
  if ($LASTEXITCODE -ne 0 -or ($tableCount | Out-String).Trim() -ne '6') {
    throw 'Restore verification failed: one or more required tables are unavailable.'
  }

  $countSql = @"
SELECT
  'projects=' || (SELECT count(*) FROM projects) ||
  '|series=' || (SELECT count(*) FROM series) ||
  '|tasks=' || (SELECT count(*) FROM tasks) ||
  '|migrations=' || (SELECT count(*) FROM _migrations);
"@
  $counts = & $psql @connectionArguments '--dbname' $TargetDatabase '--no-align' '--tuples-only' '--set' 'ON_ERROR_STOP=1' '--command' $countSql
  if ($LASTEXITCODE -ne 0) {
    throw 'Restore verification queries failed.'
  }

  Write-Output "Restore verified in isolated database: $TargetDatabase"
  Write-Output (($counts | Out-String).Trim())
  Write-Output 'The test database was intentionally kept for inspection; remove it manually after review.'
}
catch {
  Write-Warning "The test database '$TargetDatabase' was kept for investigation after the failure."
  throw
}

