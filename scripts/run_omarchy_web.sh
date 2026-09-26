#!/usr/bin/env bash
set -euo pipefail

# run_omarchy_web.sh: Lifecycle management for Omarchy Online (Zellij Web + Caddy)
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ZELLIJ_BIN="${HOME}/.local/bin/zellij"
CADDY_CONFIG="${PROJECT_DIR}/config/caddy/Caddyfile"
CADDY_PID_FILE="/tmp/omarchy_caddy.pid"
ZELLIJ_CONFIG="${PROJECT_DIR}/config/zellij/config.kdl"

# Verify Zellij binary
if [ ! -x "${ZELLIJ_BIN}" ]; then
    if command -v zellij >/dev/null 2>&1; then
        ZELLIJ_BIN="$(command -v zellij)"
    else
        echo "❌ Zellij not found. Please run: ${PROJECT_DIR}/scripts/install_zellij.sh"
        exit 1
    fi
fi

# Ensure Zellij uses our Omarchy configuration
export ZELLIJ_CONFIG_FILE="${ZELLIJ_CONFIG}"

usage() {
    cat <<EOF
Omarchy Online (Zellij Web + Caddy) Management Tool

Usage: $0 [command]

Commands:
  start          Start both Zellij Web daemon and Caddy reverse proxy
  stop           Stop both Zellij Web daemon and Caddy reverse proxy
  status         Check the running status of Zellij Web and Caddy
  token          Generate a new login token for the web interface
  list-tokens    List existing token names and creation dates
  caddy-start    Start Caddy reverse proxy only
  caddy-stop     Stop Caddy reverse proxy only
  help           Show this help message

EOF
}

start_zellij() {
    if "${ZELLIJ_BIN}" web --status 2>/dev/null | grep -q "online"; then
        echo "ℹ️  Zellij Web server is already running."
        "${ZELLIJ_BIN}" web --status
        return
    fi
    echo "🚀 Starting Zellij Web server (listening on 127.0.0.1:8082)..."
    "${ZELLIJ_BIN}" web -d --ip 127.0.0.1 --port 8082
    sleep 1
    "${ZELLIJ_BIN}" web --status || true
}

stop_zellij() {
    echo "🛑 Stopping Zellij Web server..."
    "${ZELLIJ_BIN}" web --stop || true
}

start_caddy() {
    if pgrep -f "${CADDY_CONFIG}" >/dev/null 2>&1; then
        echo "ℹ️  Caddy is already running (PID: $(pgrep -f "${CADDY_CONFIG}"))"
        return
    fi
    echo "🚀 Starting Caddy reverse proxy on :8443..."
    setsid caddy run --config "${CADDY_CONFIG}" > /tmp/omarchy_caddy.log 2>&1 &
    sleep 1
    if pgrep -f "${CADDY_CONFIG}" >/dev/null 2>&1; then
        echo "✅ Caddy reverse proxy online on port :8443 (PID: $(pgrep -f "${CADDY_CONFIG}"))"
    else
        echo "❌ Caddy failed to start. Log output:"
        cat /tmp/omarchy_caddy.log
        exit 1
    fi
}

stop_caddy() {
    echo "🛑 Stopping Caddy..."
    pkill -f "${CADDY_CONFIG}" 2>/dev/null || true
    echo "✅ Caddy stopped"
}

show_status() {
    echo "=== Zellij Web Server ==="
    "${ZELLIJ_BIN}" web --status || true

    echo -e "\n=== Caddy Reverse Proxy ==="
    if pgrep -f "${CADDY_CONFIG}" >/dev/null 2>&1; then
        echo "✅ Caddy is RUNNING (PID: $(pgrep -f "${CADDY_CONFIG}"))"
    else
        echo "⚪ Caddy is NOT running"
    fi
}

create_token() {
    echo "🔑 Generating login token for Omarchy Online..."
    "${ZELLIJ_BIN}" web --create-token
}

case "${1:-start}" in
    start)
        start_zellij
        start_caddy
        echo -e "\n🎉 Omarchy Online is ready!"
        echo "👉 Web URL: https://127.0.0.1:8443 (or https://<your-vps-ip>:8443)"
        echo -e "\n💡 Next step: Run '$0 token' to get a login token if you need one.\n"
        ;;
    stop)
        stop_caddy
        stop_zellij
        echo "✅ All services stopped."
        ;;
    status)
        show_status
        ;;
    token)
        create_token
        ;;
    list-tokens)
        "${ZELLIJ_BIN}" web --list-tokens
        ;;
    caddy-start)
        start_caddy
        ;;
    caddy-stop)
        stop_caddy
        ;;
    help|--help|-h)
        usage
        ;;
    *)
        echo "Unknown command: $1"
        usage
        exit 1
        ;;
esac
