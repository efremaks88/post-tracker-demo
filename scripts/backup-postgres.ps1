[CmdletBinding()]
param(
  [Parameter(Mandatory = $true)]
  [ValidatePattern('^[A-Za-z0-9_.-]+$')]
  [string]$Database,

  [Parameter(Mandatory = $true)]
  [string]$BackupDirectory,

  [string]$HostName = 'localhost',

  [ValidateRange(1, 65535)]
  [int]$Port = 5432,

  [Parameter(Mandatory = $true)]
  [string]$UserName,

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

function Assert-BackupOutsideRepository([string]$Path) {
  $repoRoot = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..')).TrimEnd('\', '/')
  $backupRoot = [IO.Path]::GetFullPath($Path).TrimEnd('\', '/')
  $comparison = [StringComparison]::OrdinalIgnoreCase
  if ($backupRoot.Equals($repoRoot, $comparison) -or
      $backupRoot.StartsWith($repoRoot + [IO.Path]::DirectorySeparatorChar, $comparison)) {
    throw 'BackupDirectory must be outside the Git repository and public directory.'
  }
  return $backupRoot
}

$backupRoot = Assert-BackupOutsideRepository $BackupDirectory
[IO.Directory]::CreateDirectory($backupRoot) | Out-Null

$pgDump = Resolve-PgTool 'pg_dump'
$pgRestore = Resolve-PgTool 'pg_restore'
$timestamp = (Get-Date).ToUniversalTime().ToString('yyyyMMddTHHmmssZ')
$safeDatabase = $Database -replace '[^A-Za-z0-9_.-]', '_'
$finalPath = Join-Path $backupRoot ("{0}_{1}.dump" -f $safeDatabase, $timestamp)
$partialPath = $finalPath + '.partial'

try {
  $dumpArguments = @(
    '--format=custom',
    '--compress=6',
    '--no-owner',
    '--no-privileges',
    '--no-password',
    '--host', $HostName,
    '--port', [string]$Port,
    '--username', $UserName,
    '--dbname', $Database,
    '--file', $partialPath
  )
  & $pgDump @dumpArguments
  if ($LASTEXITCODE -ne 0) {
    throw "pg_dump failed with exit code $LASTEXITCODE"
  }

  $listing = & $pgRestore '--list' $partialPath
  if ($LASTEXITCODE -ne 0) {
    throw "pg_restore --list failed with exit code $LASTEXITCODE"
  }

  foreach ($table in @('projects', 'series', 'tasks', 'users', 'app_state')) {
    if ($listing -notmatch ("\sTABLE\s+public\s+" + [regex]::Escape($table) + "\s")) {
      throw "Backup validation failed: required table '$table' is missing from the archive catalogue."
    }
  }

  Move-Item -LiteralPath $partialPath -Destination $finalPath
  $hash = (Get-FileHash -LiteralPath $finalPath -Algorithm SHA256).Hash.ToLowerInvariant()
  $hashLine = "$hash  $([IO.Path]::GetFileName($finalPath))"
  Set-Content -LiteralPath ($finalPath + '.sha256') -Value $hashLine -Encoding ascii

  Write-Output "Backup created and catalogue-checked: $finalPath"
  Write-Output "SHA256: $hash"
}
catch {
  if (Test-Path -LiteralPath $partialPath -PathType Leaf) {
    Remove-Item -LiteralPath $partialPath -Force
  }
  throw
}

