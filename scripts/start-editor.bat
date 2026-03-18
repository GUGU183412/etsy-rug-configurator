@echo off
REM 启动编辑器开发服务器

echo.
echo ======================================
echo   地毯定制编辑器 - 开发服务器
echo ======================================
echo.
echo 📍 访问地址: http://localhost:3000
echo.

cd /d "%~dp0..\packages\editor"
call npm run dev

pause
