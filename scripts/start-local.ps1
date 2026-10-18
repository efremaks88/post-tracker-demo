$ErrorActionPreference = 'Stop'
$ProgressPreference = 'SilentlyContinue'

$repoRoot = Split-Path -Parent $PSScriptRoot
$toolsRoot = Join-Path (Split-Path -Parent $repoRoot) '.tools'
$nodeCandidates = @()

$nodeCommand = Get-Command node.exe -ErrorAction SilentlyContinue
if ($nodeCommand) { $nodeCandidates += $nodeCommand.Source }
$nodeCandidates += (Join-Path $env:ProgramFiles 'nodejs\node.exe')
$nodeCandidates += (Join-Path $env:LOCALAPPDATA 'Programs\nodejs\node.exe')
if (Test-Path -LiteralPath $toolsRoot) {
  $portableNodes = Get-ChildItem -LiteralPath $toolsRoot -Directory -Filter 'node-v*-win-x64' -ErrorAction SilentlyContinue |
    Sort-Object Name -Descending |
    ForEach-Object { Join-Path $_.FullName 'node.exe' }
  $nodeCandidates += $portableNodes
}

$nodeExe = $nodeCandidates | Where-Object { $_ -and (Test-Path -LiteralPath $_) } | Select-Object -First 1
if (-not $nodeExe) {
  Write-Host 'Node.js 20+ was not found.' -ForegroundColor Red
  Write-Host 'Run INSTALL_LOCAL.bat once, then run START_LOCAL.bat again.' -ForegroundColor Yellow
  exit 1
}

$nodeVersion = (& $nodeExe --version).Trim().TrimStart('v')
$majorVersion = [int]($nodeVersion.Split('.')[0])
if ($majorVersion -lt 20) {
  Write-Host 'Node.js 20 or newer is required.' -ForegroundColor Red
  Write-Host 'Run INSTALL_LOCAL.bat to install the current LTS version.' -ForegroundColor Yellow
  exit 1
}

$requiredModules = @(
  (Join-Path $repoRoot 'node_modules\@electric-sql\pglite'),
  (Join-Path $repoRoot 'node_modules\express')
)
if ($requiredModules.Where({ -not (Test-Path -LiteralPath $_) }).Count -gt 0) {
  $npmCmd = Join-Path (Split-Path -Parent $nodeExe) 'npm.cmd'
  if (-not (Test-Path -LiteralPath $npmCmd)) {
    $npmCommand = Get-Command npm.cmd -ErrorAction SilentlyContinue
    if ($npmCommand) { $npmCmd = $npmCommand.Source }
  }
  if (-not $npmCmd -or -not (Test-Path -LiteralPath $npmCmd)) {
    Write-Host 'npm was not found next to Node.js.' -ForegroundColor Red
    Write-Host 'Run INSTALL_LOCAL.bat, then try again.' -ForegroundColor Yellow
    exit 1
  }
  Write-Host 'Installing local application components. This is needed only once...' -ForegroundColor Cyan
  & $npmCmd ci --omit=dev --no-audit --no-fund --prefix $repoRoot
  if ($LASTEXITCODE -ne 0) { throw 'npm ci failed' }
}

$env:LOCAL_DEMO_MODE = 'true'
$env:NODE_ENV = 'development'
$env:HOST = '127.0.0.1'
$env:COOKIE_SECURE = 'false'

function Test-LoopbackPortAvailable {
  param([int]$Port)

  $listener = $null
  try {
    $listener = [System.Net.Sockets.TcpListener]::new([System.Net.IPAddress]::Loopback, $Port)
    $listener.Start()
    return $true
  } catch [System.Net.Sockets.SocketException] {
    return $false
  } finally {
    if ($listener) { $listener.Stop() }
  }
}

function Get-LocalTrackerRuntime {
  param([string]$BaseUrl)

  try {
    $runtime = Invoke-RestMethod -Uri ($BaseUrl + '/api/runtime') -TimeoutSec 2
    if ($runtime.mode -eq 'local-demo') { return $runtime }
  } catch {}
  return $null
}

$requestedPortText = if ($env:POST_TRACKER_LOCAL_PORT) { $env:POST_TRACKER_LOCAL_PORT } else { '3080' }
$requestedPort = 0
if (-not [int]::TryParse($requestedPortText, [ref]$requestedPort) -or $requestedPort -lt 1 -or $requestedPort -gt 65535) {
  throw ('POST_TRACKER_LOCAL_PORT must be a number from 1 to 65535. Received: ' + $requestedPortText)
}

$selectedPort = $null
$lastCandidatePort = [Math]::Min($requestedPort + 20, 65535)
for ($candidate = $requestedPort; $candidate -le $lastCandidatePort; $candidate++) {
  $candidateUrl = 'http://127.0.0.1:' + $candidate
  if (Test-LoopbackPortAvailable -Port $candidate) {
    $selectedPort = $candidate
    break
  }

  $existingRuntime = Get-LocalTrackerRuntime -BaseUrl $candidateUrl
  if ($existingRuntime) {
    Write-Host ('POST TRACKER is already running at ' + $candidateUrl + ' (' + $existingRuntime.label + ').') -ForegroundColor Green
    if ($env:POST_TRACKER_NO_BROWSER -ne 'true') { Start-Process $candidateUrl }
    exit 0
  }
}

if (-not $selectedPort) {
  throw ('No free local port was found between ' + $requestedPort + ' and ' + $lastCandidatePort + '.')
}

if ($selectedPort -ne $requestedPort) {
  Write-Host ('Port ' + $requestedPort + ' is used by another application. Using port ' + $selectedPort + ' instead.') -ForegroundColor Yellow
}

$env:PORT = [string]$selectedPort
$url = 'http://127.0.0.1:' + $env:PORT

Write-Host ('Starting POST TRACKER at ' + $url) -ForegroundColor Cyan
$server = Start-Process -FilePath $nodeExe -ArgumentList @('server.js') -WorkingDirectory $repoRoot -NoNewWindow -PassThru

try {
  $ready = $false
  for ($attempt = 0; $attempt -lt 120; $attempt++) {
    if ($server.HasExited) { throw ('The local server stopped with exit code ' + $server.ExitCode) }
    try {
      $response = Invoke-WebRequest -UseBasicParsing -Uri ($url + '/api/runtime') -TimeoutSec 2
      if ($response.StatusCode -eq 200) { $ready = $true; break }
    } catch {}
    Start-Sleep -Milliseconds 250
  }
  if (-not $ready) { throw 'The local server did not become ready within 30 seconds' }
  Start-Sleep -Milliseconds 250
  if ($server.HasExited) { throw ('The local server stopped with exit code ' + $server.ExitCode) }
  if ($env:POST_TRACKER_NO_BROWSER -ne 'true') { Start-Process $url }
  Write-Host 'The tracker is ready. Keep this window open while you work.' -ForegroundColor Green
  Write-Host 'Press Ctrl+C to stop it.' -ForegroundColor DarkGray
  $server.WaitForExit()
  exit $server.ExitCode
} finally {
  if ($server -and -not $server.HasExited) {
    # Ctrl+C reaches both this wrapper and the Node process. Give Node time to
    # close PGlite and release its lock before using a forced termination.
    $server.WaitForExit(10000) | Out-Null
    if (-not $server.HasExited) { Stop-Process -Id $server.Id }
  }
}
