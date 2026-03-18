@echo off
setlocal

cd /d "%~dp0"

where npm.cmd >nul 2>nul
if errorlevel 1 (
  echo [ERROR] npm was not found. Please install Node.js 18+ first.
  pause
  exit /b 1
)

if not exist "node_modules" (
  echo [INFO] node_modules not found. Installing dependencies...
  call npm.cmd install
  if errorlevel 1 (
    echo [ERROR] npm install failed.
    pause
    exit /b 1
  )
)

echo.
echo ======================================
echo   Etsy Rug Configurator - Dev Startup
echo ======================================
echo   Editor   : http://localhost:3000
echo   Merchant : http://localhost:3001
echo.
echo [INFO] Starting both dev servers...

start "Editor Dev Server" cmd /k "cd /d ""%~dp0packages\editor"" && npm.cmd run dev"
timeout /t 2 /nobreak >nul
start "Merchant Dev Server" cmd /k "cd /d ""%~dp0packages\merchant-tool"" && npm.cmd run dev"

echo [DONE] Two terminals opened. Keep them running while developing.
exit /b 0
