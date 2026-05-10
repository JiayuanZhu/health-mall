#!/bin/bash
# ============================================
#   健康医疗商城 - 一键安装启动脚本
#   自动安装 Node.js + 依赖 + 启动服务
# ============================================

set -e

echo "============================================"
echo "   健康医疗商城 - 一键安装启动脚本"
echo "============================================"
echo ""

# ========== 第一步：检查/安装 Node.js ==========

install_node_linux() {
    echo "[!] 未检测到 Node.js，正在自动安装..."
    echo ""
    
    NODE_VER="v22.16.0"
    ARCH=$(uname -m)
    
    case "$ARCH" in
        x86_64)  NODE_ARCH="x64" ;;
        aarch64) NODE_ARCH="arm64" ;;
        armv7l)  NODE_ARCH="armv7l" ;;
        *)       NODE_ARCH="x64" ;;
    esac
    
    NODE_TAR="node-${NODE_VER}-linux-${NODE_ARCH}.tar.xz"
    NODE_URL="https://nodejs.org/dist/${NODE_VER}/${NODE_TAR}"
    INSTALL_DIR="/usr/local/lib/nodejs"
    
    echo "[*] 下载 Node.js ${NODE_VER} (${NODE_ARCH})..."
    echo "    地址: ${NODE_URL}"
    echo ""
    
    # 下载
    TMPFILE="/tmp/${NODE_TAR}"
    if command -v curl &>/dev/null; then
        curl -fSL --progress-bar -o "$TMPFILE" "$NODE_URL"
    elif command -v wget &>/dev/null; then
        wget -q --show-progress -O "$TMPFILE" "$NODE_URL"
    else
        echo "[错误] 没有找到 curl 或 wget，无法下载。"
        echo "请手动安装: sudo apt install curl"
        exit 1
    fi
    
    echo ""
    echo "[*] 安装 Node.js 到 ${INSTALL_DIR}..."
    
    # 需要 sudo 权限
    if [ "$EUID" -ne 0 ]; then
        echo "    需要 sudo 权限来安装到系统目录..."
        SUDO="sudo"
    else
        SUDO=""
    fi
    
    $SUDO mkdir -p "$INSTALL_DIR"
    $SUDO tar -xJf "$TMPFILE" -C "$INSTALL_DIR"
    rm -f "$TMPFILE"
    
    NODE_DIR="${INSTALL_DIR}/node-${NODE_VER}-linux-${NODE_ARCH}"
    
    # 创建符号链接
    $SUDO ln -sf "${NODE_DIR}/bin/node" /usr/local/bin/node
    $SUDO ln -sf "${NODE_DIR}/bin/npm" /usr/local/bin/npm
    $SUDO ln -sf "${NODE_DIR}/bin/npx" /usr/local/bin/npx
    
    # 刷新 PATH
    export PATH="/usr/local/bin:$PATH"
    
    echo "[√] Node.js 安装成功！"
    echo "    版本: $(node -v)"
    echo ""
}

install_node_mac() {
    echo "[!] 未检测到 Node.js，正在自动安装..."
    echo ""
    
    NODE_VER="v22.16.0"
    ARCH=$(uname -m)
    
    case "$ARCH" in
        x86_64)  NODE_ARCH="x64" ;;
        arm64)   NODE_ARCH="arm64" ;;
        *)       NODE_ARCH="x64" ;;
    esac
    
    NODE_TAR="node-${NODE_VER}-darwin-${NODE_ARCH}.tar.gz"
    NODE_URL="https://nodejs.org/dist/${NODE_VER}/${NODE_TAR}"
    INSTALL_DIR="/usr/local/lib/nodejs"
    
    echo "[*] 下载 Node.js ${NODE_VER} (${NODE_ARCH})..."
    echo "    地址: ${NODE_URL}"
    echo ""
    
    TMPFILE="/tmp/${NODE_TAR}"
    curl -fSL --progress-bar -o "$TMPFILE" "$NODE_URL"
    
    echo ""
    echo "[*] 安装 Node.js..."
    
    if [ "$EUID" -ne 0 ]; then
        SUDO="sudo"
    else
        SUDO=""
    fi
    
    $SUDO mkdir -p "$INSTALL_DIR"
    $SUDO tar -xzf "$TMPFILE" -C "$INSTALL_DIR"
    rm -f "$TMPFILE"
    
    NODE_DIR="${INSTALL_DIR}/node-${NODE_VER}-darwin-${NODE_ARCH}"
    
    $SUDO ln -sf "${NODE_DIR}/bin/node" /usr/local/bin/node
    $SUDO ln -sf "${NODE_DIR}/bin/npm" /usr/local/bin/npm
    $SUDO ln -sf "${NODE_DIR}/bin/npx" /usr/local/bin/npx
    
    export PATH="/usr/local/bin:$PATH"
    
    echo "[√] Node.js 安装成功！"
    echo "    版本: $(node -v)"
    echo ""
}

# 检查 Node.js 是否已安装
if command -v node &>/dev/null; then
    echo "[√] Node.js 已安装"
    echo "    版本: $(node -v)"
    echo ""
else
    OS=$(uname -s)
    case "$OS" in
        Linux)  install_node_linux ;;
        Darwin) install_node_mac ;;
        *)
            echo "[错误] 不支持的操作系统: $OS"
            echo "请手动安装 Node.js: https://nodejs.org"
            exit 1
            ;;
    esac
fi

# 二次验证
if ! command -v node &>/dev/null; then
    echo "[错误] Node.js 安装失败，请手动安装: https://nodejs.org"
    exit 1
fi

# ========== 第二步：安装项目依赖 ==========

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"
echo "[*] 项目目录: $SCRIPT_DIR"
echo ""

# 设置淘宝镜像加速
npm config set registry https://registry.npmmirror.com 2>/dev/null || true

echo "[1/3] 安装根目录依赖..."
npm install 2>/dev/null || npm install
echo "     完成！"
echo ""

echo "[2/3] 安装后端依赖..."
cd server && npm install 2>/dev/null || npm install
cd ..
echo "     完成！"
echo ""

echo "[3/3] 安装前端依赖..."
cd client && npm install 2>/dev/null || npm install
cd ..
echo "     完成！"
echo ""

# ========== 第三步：启动服务 ==========

echo "============================================"
echo "   全部就绪，正在启动服务..."
echo "============================================"
echo ""
echo "   前端地址: http://localhost:5173"
echo "   后端API:  http://localhost:3001"
echo ""
echo "   默认账号:"
echo "     管理员 - 用户名: admin  密码: admin123"
echo "     普通用户 - 用户名: user1  密码: 123456"
echo ""
echo "   管理后台: http://localhost:5173/admin"
echo ""
echo "   按 Ctrl+C 停止服务"
echo "============================================"
echo ""

# 延迟后打开浏览器
(sleep 3 && {
    if command -v xdg-open &>/dev/null; then
        xdg-open http://localhost:5173 2>/dev/null
    elif command -v open &>/dev/null; then
        open http://localhost:5173 2>/dev/null
    fi
}) &

# 启动
npm run dev
