#!/bin/bash
# 停止健康医疗商城所有服务

echo "正在停止所有服务..."
echo ""

# 杀掉占用 3001 端口的进程（后端）
if lsof -ti:3001 &>/dev/null; then
    echo "停止后端服务 (端口 3001)..."
    lsof -ti:3001 | xargs kill -9 2>/dev/null
fi

# 杀掉占用 5173 端口的进程（前端）
if lsof -ti:5173 &>/dev/null; then
    echo "停止前端服务 (端口 5173)..."
    lsof -ti:5173 | xargs kill -9 2>/dev/null
fi

# 备用方案：用 fuser（某些 Linux 没有 lsof）
if ! command -v lsof &>/dev/null; then
    fuser -k 3001/tcp 2>/dev/null
    fuser -k 5173/tcp 2>/dev/null
fi

echo ""
echo "[√] 所有服务已停止"
