@echo off
setlocal
where winget.exe >nul 2>&1
if errorlevel 1 (
  echo Windows Package Manager was not found.
  echo Install Node.js LTS 20 or newer from https://nodejs.org/ and run START_LOCAL.bat again.
  pause
  exit /b 1
)
echo Installing Node.js LTS for the local tracker...
winget.exe install --id OpenJS.NodeJS.LTS --exact --accept-package-agreements --accept-source-agreements
if errorlevel 1 (
  echo Node.js installation failed.
  pause
  exit /b 1
)
echo Installation completed. Run START_LOCAL.bat.
pause
endlocal
