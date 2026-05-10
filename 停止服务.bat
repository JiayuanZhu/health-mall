@echo off
chcp 65001 >nul 2>&1
title 健康医疗商城 - 停止服务

echo 正在停止所有服务...
echo.

:: 杀掉占用 3001 和 5173 端口的进程
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":3001" ^| findstr "LISTENING"') do (
    echo 停止后端服务 (PID: %%a)
    taskkill /PID %%a /F >nul 2>&1
)

for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":5173" ^| findstr "LISTENING"') do (
    echo 停止前端服务 (PID: %%a)
    taskkill /PID %%a /F >nul 2>&1
)

echo.
echo [√] 所有服务已停止
echo.
pause
