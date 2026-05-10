#!/bin/bash
# ============================================
#   打包 health-mall — Linux x64 版
#   产出：health-mall-linux-x64.tar.gz
#   客户解压后运行 ./start.sh 即可，无需联网
# ============================================

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
BUILD_DIR="/tmp/health-mall-build-linux"
NODE_VER="v20.20.2"
NODE_DIST="node-${NODE_VER}-linux-x64"
NODE_URL="https://nodejs.org/dist/${NODE_VER}/${NODE_DIST}.tar.xz"
BETTER_SQLITE_VER="v9.6.0"
BETTER_SQLITE_PREBUILD="better-sqlite3-${BETTER_SQLITE_VER}-node-v115-linux-x64.tar.gz"
BETTER_SQLITE_URL="https://github.com/WiseLibs/better-sqlite3/releases/download/${BETTER_SQLITE_VER}/${BETTER_SQLITE_PREBUILD}"
OUTPUT="${PROJECT_DIR}/health-mall-linux-x64.tar.gz"

echo "============================================"
echo "  打包 health-mall (Linux x64)"
echo "============================================"
echo ""

# 清理
rm -rf "$BUILD_DIR"
mkdir -p "$BUILD_DIR/health-mall"

# ---------- 1. 复制项目文件 ----------
echo "[1/5] 复制项目文件..."
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

# ---------- 2. 下载 Node.js ----------
echo "[2/5] 下载 Node.js ${NODE_VER} linux-x64..."
if [ -f "/tmp/${NODE_DIST}.tar.xz" ]; then
    echo "    使用缓存: /tmp/${NODE_DIST}.tar.xz"
else
    curl -fSL --progress-bar -o "/tmp/${NODE_DIST}.tar.xz" "$NODE_URL"
fi
echo "    解压中..."
mkdir -p "$BUILD_DIR/health-mall/node"
tar -xJf "/tmp/${NODE_DIST}.tar.xz" -C "$BUILD_DIR/health-mall/node" --strip-components=1
echo "    完成"
echo ""

# ---------- 3. 安装 npm 依赖 ----------
echo "[3/5] 安装 npm 依赖 (使用打包的 Node)..."
export PATH="$BUILD_DIR/health-mall/node/bin:$PATH"

# 根目录
cd "$BUILD_DIR/health-mall"
npm install --prefer-offline 2>/dev/null || npm install
echo "    根目录依赖 ✓"

# server
cd "$BUILD_DIR/health-mall/server"
npm install --prefer-offline 2>/dev/null || npm install
echo "    server 依赖 ✓"

# client
cd "$BUILD_DIR/health-mall/client"
npm install --prefer-offline 2>/dev/null || npm install
echo "    client 依赖 ✓"
echo ""

# ---------- 4. 替换 better-sqlite3 prebuilt ----------
echo "[4/5] 下载 better-sqlite3 prebuilt (linux-x64)..."
PREBUILD_DIR="$BUILD_DIR/health-mall/server/node_modules/better-sqlite3/prebuilds/linux-x64"
mkdir -p "$PREBUILD_DIR"
if [ -f "/tmp/${BETTER_SQLITE_PREBUILD}" ]; then
    echo "    使用缓存"
else
    curl -fSL --progress-bar -o "/tmp/${BETTER_SQLITE_PREBUILD}" "$BETTER_SQLITE_URL"
fi
tar -xzf "/tmp/${BETTER_SQLITE_PREBUILD}" -C "$PREBUILD_DIR"
echo "    完成"
echo ""

# ---------- 5. 生成启动脚本 ----------
echo "[5/5] 生成启动脚本..."

cat > "$BUILD_DIR/health-mall/start.sh" << 'STARTUP'
#!/bin/bash
# 健康医疗商城 - 启动脚本（自带 Node.js，无需安装）

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
export PATH="${SCRIPT_DIR}/node/bin:$PATH"

cd "$SCRIPT_DIR"

echo "============================================"
echo "   健康医疗商城"
echo "============================================"
echo ""
echo "   前端: http://localhost:5173"
echo "   后端: http://localhost:3001"
echo ""
echo "   管理员: admin / admin123"
echo "   用户:   user1 / 123456"
echo ""
echo "   管理后台: http://localhost:5173/admin"
echo "   按 Ctrl+C 停止"
echo "============================================"
echo ""

# 尝试打开浏览器
(sleep 3 && {
    if command -v xdg-open &>/dev/null; then
        xdg-open http://localhost:5173 2>/dev/null
    elif command -v open &>/dev/null; then
        open http://localhost:5173 2>/dev/null
    fi
}) &

npm run dev
STARTUP
chmod +x "$BUILD_DIR/health-mall/start.sh"

cat > "$BUILD_DIR/health-mall/stop.sh" << 'STOPSCRIPT'
#!/bin/bash
echo "正在停止服务..."
lsof -ti:3001 2>/dev/null | xargs kill -9 2>/dev/null
lsof -ti:5173 2>/dev/null | xargs kill -9 2>/dev/null
fuser -k 3001/tcp 2>/dev/null
fuser -k 5173/tcp 2>/dev/null
echo "已停止"
STOPSCRIPT
chmod +x "$BUILD_DIR/health-mall/stop.sh"

echo "    完成"
echo ""

# ---------- 打包 ----------
echo "[*] 打包为 tar.gz..."
cd "$BUILD_DIR"
tar -czf "$OUTPUT" health-mall/
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
echo "    tar -xzf health-mall-linux-x64.tar.gz"
echo "    cd health-mall"
echo "    ./start.sh"
