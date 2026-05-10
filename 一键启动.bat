@echo off
chcp 65001 >nul 2>&1
title 健康医疗商城 - 一键安装启动

echo ============================================
echo    健康医疗商城 - 一键安装启动脚本
echo ============================================
echo.

:: ========== 第一步：检查/安装 Node.js ==========
where node >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo [√] Node.js 已安装
    for /f "tokens=*" %%i in ('node -v') do echo     版本: %%i
    echo.
    goto :INSTALL_DEPS
)

echo [!] 未检测到 Node.js，正在自动安装...
echo.

:: 确定系统架构
set "ARCH=x64"
if "%PROCESSOR_ARCHITECTURE%"=="ARM64" set "ARCH=arm64"

:: Node.js 版本（LTS）
set "NODE_VER=v22.16.0"
set "NODE_MSI=node-%NODE_VER%-x64.msi"
set "NODE_URL=https://nodejs.org/dist/%NODE_VER%/%NODE_MSI%"

:: 如果是 ARM64
if "%ARCH%"=="arm64" (
    set "NODE_MSI=node-%NODE_VER%-arm64.msi"
    set "NODE_URL=https://nodejs.org/dist/%NODE_VER%/node-%NODE_VER%-arm64.msi"
)

:: 下载 Node.js
echo [*] 正在下载 Node.js %NODE_VER% (%ARCH%)...
echo     下载地址: %NODE_URL%
echo     这可能需要几分钟，请耐心等待...
echo.

:: 使用 PowerShell 下载（Windows 10+ 自带）
powershell -Command "& { [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; $ProgressPreference = 'SilentlyContinue'; Invoke-WebRequest -Uri '%NODE_URL%' -OutFile '%TEMP%\%NODE_MSI%' }"

if not exist "%TEMP%\%NODE_MSI%" (
    echo [错误] 下载失败！请检查网络连接。
    echo     你也可以手动下载安装: https://nodejs.org/zh-cn
    pause
    exit /b 1
)

echo [√] 下载完成！
echo.

:: 静默安装 Node.js
echo [*] 正在安装 Node.js（需要管理员权限）...
echo     如果弹出权限确认窗口，请点击"是"
echo.

:: 尝试静默安装
msiexec /i "%TEMP%\%NODE_MSI%" /qn /norestart ADDLOCAL=ALL 2>nul
if %ERRORLEVEL% NEQ 0 (
    :: 如果静默安装失败（权限不够），尝试带 UI 安装
    echo     静默安装需要管理员权限，改为引导安装...
    msiexec /i "%TEMP%\%NODE_MSI%" /passive /norestart ADDLOCAL=ALL
)

:: 删除安装包
del "%TEMP%\%NODE_MSI%" 2>nul

:: 刷新环境变量（安装后 PATH 已更新，但当前 cmd 窗口不会自动刷新）
:: 手动把 Node.js 默认安装路径加到 PATH
set "PATH=%ProgramFiles%\nodejs;%PATH%"
set "PATH=%APPDATA%\npm;%PATH%"

:: 验证安装
where node >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [错误] Node.js 安装似乎没有成功。
    echo     请尝试手动安装: https://nodejs.org/zh-cn
    echo     安装完成后重新运行本脚本。
    pause
    exit /b 1
)

echo [√] Node.js 安装成功！
for /f "tokens=*" %%i in ('node -v') do echo     版本: %%i
echo.

:: ========== 第二步：安装项目依赖 ==========
:INSTALL_DEPS

:: 获取脚本所在目录
cd /d "%~dp0"
echo [*] 项目目录: %CD%
echo.

:: 设置淘宝镜像加速（国内下载更快）
call npm config set registry https://registry.npmmirror.com 2>nul

:: 安装根目录依赖
echo [1/3] 安装根目录依赖...
call npm install 2>nul
if %ERRORLEVEL% NEQ 0 (
    call npm install
)
echo      完成！
echo.

:: 安装后端依赖
echo [2/3] 安装后端依赖...
cd server
call npm install 2>nul
if %ERRORLEVEL% NEQ 0 (
    call npm install
)
cd ..
echo      完成！
echo.

:: 安装前端依赖
echo [3/3] 安装前端依赖...
cd client
call npm install 2>nul
if %ERRORLEVEL% NEQ 0 (
    call npm install
)
cd ..
echo      完成！
echo.

:: ========== 第三步：启动服务 ==========
echo ============================================
echo    全部就绪，正在启动服务...
echo ============================================
echo.
echo    前端地址: http://localhost:5173
echo    后端API:  http://localhost:3001
echo.
echo    默认账号:
echo      管理员 - 用户名: admin  密码: admin123
echo      普通用户 - 用户名: user1  密码: 123456
echo.
echo    管理后台: http://localhost:5173/admin
echo.
echo    ★ 浏览器会自动打开 ★
echo    ★ 关闭此窗口即可停止服务 ★
echo ============================================
echo.

:: 延迟后打开浏览器
start /b cmd /c "timeout /t 5 /nobreak >nul && start http://localhost:5173"

:: 启动服务
call npm run dev

pause
