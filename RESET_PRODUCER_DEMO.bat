@echo off
setlocal
cd /d "%~dp0"
echo Close the running tracker before resetting demo data.
powershell.exe -NoLogo -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\reset-producer-demo.ps1"
if errorlevel 1 pause
endlocal
