@echo off
REM 主启动脚本 - 选择要启动的服务

echo.
echo ======================================
echo   地毯定制系统 - 启动菜单
echo ======================================
echo.
echo   [1] 客户编辑器 (http://localhost:3000)
echo   [2] 商家工具   (http://localhost:3001)
echo   [3] 同时启动两个服务
echo   [0] 退出
echo.
set /p choice="请选择要启动的服务 (0-3): "

if "%choice%"=="1" (
    call "%~dp0start-editor.bat"
) else if "%choice%"=="2" (
    call "%~dp0start-merchant.bat"
) else if "%choice%"=="3" (
    echo.
    echo 正在同时启动编辑器和商家工具...
    echo.
    start "编辑器" cmd /c "%~dp0start-editor.bat"
    timeout /t 2 /nobreak >nul
    start "商家工具" cmd /c "%~dp0start-merchant.bat"
    echo.
    echo 两个服务已在独立窗口中启动
    pause
) else if "%choice%"=="0" (
    exit /b 0
) else (
    echo.
    echo 无效选择，请重新运行脚本
    pause
)
