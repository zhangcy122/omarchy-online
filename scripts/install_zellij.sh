#!/usr/bin/env bash
set -euo pipefail

# install_zellij.sh: Downloads and installs Zellij with Web Client support
INSTALL_DIR="${HOME}/.local/bin"
ZELLIJ_VERSION="v0.45.1"
ARCH="x86_64"
TAR_FILE="zellij-${ARCH}-unknown-linux-musl.tar.gz"
DOWNLOAD_URL="https://github.com/zellij-org/zellij/releases/download/${ZELLIJ_VERSION}/${TAR_FILE}"

mkdir -p "${INSTALL_DIR}"

if command -v zellij >/dev/null 2>&1; then
    echo "ℹ️  Zellij is already installed at: $(command -v zellij)"
    zellij --version
    exit 0
fi

echo "⬇️  Downloading Zellij ${ZELLIJ_VERSION} (with Web Client support)..."
TEMP_DIR="$(mktemp -d)"
trap 'rm -rf "${TEMP_DIR}"' EXIT

curl -fsSL "${DOWNLOAD_URL}" -o "${TEMP_DIR}/${TAR_FILE}"
echo "📦 Extracting zellij to ${INSTALL_DIR}..."
tar -xzf "${TEMP_DIR}/${TAR_FILE}" -C "${TEMP_DIR}"
install -m 755 "${TEMP_DIR}/zellij" "${INSTALL_DIR}/zellij"

# Ensure ~/.local/bin is in PATH for current session
export PATH="${INSTALL_DIR}:${PATH}"

echo "✅ Zellij installed successfully!"
"${INSTALL_DIR}/zellij" --version
