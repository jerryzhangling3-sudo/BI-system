#!/usr/bin/env bash
# serve.sh — 启动本地静态服务器
# 用法: ./serve.sh [端口]
# 默认端口: 5000，优先读取环境变量 DEPLOY_RUN_PORT

set -e

PORT="${1:-${DEPLOY_RUN_PORT:-5000}}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "==> Starting BI System static server"
echo "==> Serving: ${SCRIPT_DIR}"
echo "==> Port:    ${PORT}"
echo "==> URL:     http://localhost:${PORT}"
echo ""
echo "Press Ctrl+C to stop."
echo ""

cd "$SCRIPT_DIR"

# 使用 python 内置 http 服务器
if command -v python3 &>/dev/null; then
  exec python3 -m http.server "$PORT" --bind 0.0.0.0
elif command -v python &>/dev/null; then
  exec python -m http.server "$PORT" --bind 0.0.0.0
else
  echo "ERROR: Python not found. Please install Python 3."
  exit 1
fi
