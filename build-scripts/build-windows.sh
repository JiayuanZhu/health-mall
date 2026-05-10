#!/bin/bash
# ============================================
#   打包 health-mall — Windows x64 版
#   产出：health-mall-windows-x64.zip
#   客户解压后双击 start.bat 即可，无需联网
# ============================================

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
BUILD_DIR="/tmp/health-mall-build-win"
NODE_VER="v20.20.2"
NODE_DIST="node-${NODE_VER}-win-x64"
NODE_URL="https://nodejs.org/dist/${NODE_VER}/${NODE_DIST}.zip"
BETTER_SQLITE_VER="v9.6.0"
BETTER_SQLITE_PREBUILD="better-sqlite3-${BETTER_SQLITE_VER}-node-v115-win32-x64.tar.gz"
BETTER_SQLITE_URL="https://github.com/WiseLibs/better-sqlite3/releases/download/${BETTER_SQLITE_VER}/${BETTER_SQLITE_PREBUILD}"
OUTPUT="${PROJECT_DIR}/health-mall-windows-x64.zip"

echo "============================================"
echo "  打包 health-mall (Windows x64)"
echo "============================================"
echo ""

# 清理
rm -rf "$BUILD_DIR"
mkdir -p "$BUILD_DIR/health-mall"

# ---------- 1. 复制项目文件 ----------
echo "[1/6] 复制项目文件..."
rsync -a --exclude='node_modules' \
         --exclude='.git' \
         --exclude='*.db' \
         --exclude='*.db-shm' \
         --exclude='*.db-wal' \
         --exclude='miniprogram' \
         --exclude='CLAUDE.md' \
         --exclude='build-scripts' \
         --exclude='health-mall-*.tar.gz' \
         --exclude='health-mall-*.zip' \
         "$PROJECT_DIR/" "$BUILD_DIR/health-mall/"
echo "    完成"
echo ""

# ---------- 2. 下载 Node.js (Windows) ----------
echo "[2/6] 下载 Node.js ${NODE_VER} win-x64..."
if [ -f "/tmp/${NODE_DIST}.zip" ]; then
    echo "    使用缓存: /tmp/${NODE_DIST}.zip"
else
    curl -fSL --progress-bar -o "/tmp/${NODE_DIST}.zip" "$NODE_URL"
fi
echo "    解压中..."
mkdir -p "$BUILD_DIR/health-mall/node"
cd /tmp
unzip -qo "${NODE_DIST}.zip"
cp -r "/tmp/${NODE_DIST}/"* "$BUILD_DIR/health-mall/node/"
rm -rf "/tmp/${NODE_DIST}"
echo "    完成"
echo ""

# ---------- 3. 安装 npm 依赖 (用本机 node) ----------
echo "[3/6] 安装 npm 依赖 (使用本机 Node)..."
# 用本机 node 安装依赖（纯 JS 部分跨平台通用）
cd "$BUILD_DIR/health-mall"
npm install --prefer-offline 2>/dev/null || npm install
echo "    根目录依赖 ✓"

cd "$BUILD_DIR/health-mall/server"
npm install --prefer-offline 2>/dev/null || npm install
echo "    server 依赖 ✓"

cd "$BUILD_DIR/health-mall/client"
npm install --prefer-offline 2>/dev/null || npm install
echo "    client 依赖 ✓"
echo ""

# ---------- 4. 替换 better-sqlite3 为 Windows prebuilt ----------
echo "[4/6] 下载 better-sqlite3 prebuilt (win32-x64)..."
# 先删除 Linux native build
rm -rf "$BUILD_DIR/health-mall/server/node_modules/better-sqlite3/build"
rm -rf "$BUILD_DIR/health-mall/server/node_modules/better-sqlite3/prebuilds"

PREBUILD_DIR="$BUILD_DIR/health-mall/server/node_modules/better-sqlite3/prebuilds/win32-x64"
mkdir -p "$PREBUILD_DIR"
if [ -f "/tmp/${BETTER_SQLITE_PREBUILD}" ]; then
    echo "    使用缓存"
else
    curl -fSL --progress-bar -o "/tmp/${BETTER_SQLITE_PREBUILD}" "$BETTER_SQLITE_URL"
fi
tar -xzf "/tmp/${BETTER_SQLITE_PREBUILD}" -C "$PREBUILD_DIR"
echo "    完成"
echo ""

# ---------- 5. 检查 prebuild 加载逻辑 ----------
echo "[5/6] 配置 better-sqlite3 使用 prebuild..."
# better-sqlite3 通过 prebuild-install 或 node-gyp-build 加载
# 确保 node-gyp-build 存在（它会优先查找 prebuilds/ 目录）
if [ ! -d "$BUILD_DIR/health-mall/server/node_modules/node-gyp-build" ]; then
    cd "$BUILD_DIR/health-mall/server"
    npm install node-gyp-build --save 2>/dev/null || true
fi
echo "    完成"
echo ""

# ---------- 6. 生成 Windows 启动脚本 ----------
echo "[6/6] 生成 Windows 启动脚本..."

# start.bat
cat > "$BUILD_DIR/health-mall/start.bat" << 'STARTBAT'
@echo off
chcp 65001 >nul 2>&1
title 健康医疗商城

:: 使用自带的 Node.js
set "PATH=%~dp0node;%PATH%"
cd /d "%~dp0"

echo ============================================
echo    健康医疗商城
echo ============================================
echo.
echo    前端: http://localhost:5173
echo    后端: http://localhost:3001
echo.
echo    管理员: admin / admin123
echo    用户:   user1 / 123456
echo.
echo    管理后台: http://localhost:5173/admin
echo.
echo    关闭此窗口即可停止服务
echo ============================================
echo.

:: 延迟打开浏览器
start /b cmd /c "timeout /t 4 /nobreak >nul && start http://localhost:5173"

:: 启动
call npm run dev

pause
STARTBAT

# stop.bat
cat > "$BUILD_DIR/health-mall/stop.bat" << 'STOPBAT'
@echo off
chcp 65001 >nul 2>&1
echo 正在停止服务...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":3001" ^| findstr "LISTENING"') do taskkill /PID %%a /F >nul 2>&1
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":5173" ^| findstr "LISTENING"') do taskkill /PID %%a /F >nul 2>&1
echo 已停止
pause
STOPBAT

# 删除 Linux 相关脚本（Windows 包不需要）
rm -f "$BUILD_DIR/health-mall/一键启动.sh" "$BUILD_DIR/health-mall/停止服务.sh"
# 重命名或保留 bat
rm -f "$BUILD_DIR/health-mall/一键启动.bat" "$BUILD_DIR/health-mall/停止服务.bat"

echo "    完成"
echo ""

# ---------- 打包 ----------
echo "[*] 打包为 zip..."
cd "$BUILD_DIR"
zip -r -q "$OUTPUT" health-mall/
echo ""

# 清理
rm -rf "$BUILD_DIR"

SIZE=$(du -h "$OUTPUT" | cut -f1)
echo "============================================"
echo "  ✅ 打包完成!"
echo "  文件: $OUTPUT"
echo "  大小: $SIZE"
echo "============================================"
echo ""
echo "  客户使用方法:"
echo "    解压 health-mall-windows-x64.zip"
echo "    打开 health-mall 文件夹"
echo "    双击 start.bat"
