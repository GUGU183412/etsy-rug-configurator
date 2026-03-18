@echo off
REM 启动商家工具开发服务器

echo.
echo ======================================
echo   商家工具 - 开发服务器
echo ======================================
echo.
echo 📍 访问地址: http://localhost:3001
echo.

cd /d "%~dp0..\packages\merchant-tool"
call npm run dev

pause
