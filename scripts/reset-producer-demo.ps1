$ErrorActionPreference = 'Stop'
$repoRoot = Split-Path -Parent $PSScriptRoot
$toolsRoot = Join-Path (Split-Path -Parent $repoRoot) '.tools'
$candidates = @()
$command = Get-Command node.exe -ErrorAction SilentlyContinue
if ($command) { $candidates += $command.Source }
$candidates += (Join-Path $env:ProgramFiles 'nodejs\node.exe')
if (Test-Path -LiteralPath $toolsRoot) {
  $candidates += Get-ChildItem -LiteralPath $toolsRoot -Directory -Filter 'node-v*-win-x64' -ErrorAction SilentlyContinue |
    Sort-Object Name -Descending | ForEach-Object { Join-Path $_.FullName 'node.exe' }
}
$nodeExe = $candidates | Where-Object { $_ -and (Test-Path -LiteralPath $_) } | Select-Object -First 1
if (-not $nodeExe) { throw 'Node.js не найден. Сначала запустите INSTALL_LOCAL.bat.' }
& $nodeExe (Join-Path $PSScriptRoot 'reset-producer-demo.js')
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
