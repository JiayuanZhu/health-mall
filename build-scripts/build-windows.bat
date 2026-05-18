@echo off
setlocal
cd /d "%~dp0"

echo ============================================
echo   Build Health Mall Windows Package
echo ============================================
echo.

powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0build-windows.ps1"

echo.
if errorlevel 1 (
  echo Build failed.
) else (
  echo Build finished.
)
pause
