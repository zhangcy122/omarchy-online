# Omarchy Online 🚀

[English](README.md) | [简体中文](README_zh.md)

> Run an Omarchy-inspired Hyprland tiling workspace natively on an Ubuntu VPS through your web browser — without Docker containers.

[![Live Mock Preview](https://img.shields.io/badge/Live_Demo-GitHub_Pages-7aa2f7?style=for-the-badge&logo=github)](https://zhangcy122.github.io/omarchy-online/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)](LICENSE)
[![Theme: Tokyo Night](https://img.shields.io/badge/Theme-Tokyo_Night-1a1b26?style=for-the-badge)](web/style.css)

**Omarchy Online** brings the aesthetic and workflow of [Omarchy](https://github.com/basecamp/omarchy) (Arch Linux + Hyprland) to your browser. It runs natively on your VPS host using **Zellij Web** and a **Caddy** TLS reverse proxy, consuming less than 30MB of RAM while preserving full session persistence across disconnections.

---

## 🌐 Live Preview

You can try the frontend interface and Hyprland Dwindle tiling layout directly on GitHub Pages:

👉 **[https://zhangcy122.github.io/omarchy-online/](https://zhangcy122.github.io/omarchy-online/)**

The static GitHub Pages deployment runs in **Mock Preview Mode**, featuring an interactive terminal simulation (`fastfetch`, `btop`, `nvim`, `lazygit`) and full Hyprland window tiling.

---

## ✨ Key Features

- **No Docker Required**: Runs directly as native Linux processes on your Ubuntu VPS. Zero container overhead, full access to host toolchains, packages, and hardware.
- **Hyprland Dwindle Tiling**: Binary Space Partitioning (BSP) layout engine with 10px outer gaps, 5px inner gaps, and active `#7aa2f7` borders.
- **Clean Desktop by Default**: Boots to an unblocked desktop with official 4K wallpapers and Omarchy branding watermark. Press `SUPER + RETURN` to spawn terminals on demand.
- **Show Desktop Toggle (`SUPER + D`)**: Hide all windows instantly to inspect the desktop, and restore them with identical geometry.
- **Isolated Workspaces (1–9)**: Switch between 9 independent workspaces with Waybar dot indicators for active workspaces.
- **Walker App Launcher (`SUPER + SPACE`)**: Fast application and tool launcher with fuzzy search.
- **Session Persistence**: Zellij keeps terminal sessions alive even when closing the browser tab or experiencing network drops.
- **Caddy TLS Proxy**: Built-in HTTPS/WSS termination on port `8443` with local certificate generation.

---

## ⌨️ Hyprland Keybindings

| Action | Shortcut |
| :--- | :--- |
| **Spawn Terminal Window** | <kbd>SUPER</kbd> + <kbd>RETURN</kbd> |
| **Close Active Window** | <kbd>SUPER</kbd> + <kbd>W</kbd> / <kbd>Q</kbd> / <kbd>C</kbd> (or click 🔴 dot) |
| **Toggle Show / Hide Desktop** | <kbd>SUPER</kbd> + <kbd>D</kbd> (or click 🖥️ on bar) |
| **Toggle Floating / Tiling Mode** | <kbd>SUPER</kbd> + <kbd>T</kbd> |
| **Toggle Fullscreen Window** | <kbd>SUPER</kbd> + <kbd>F</kbd> |
| **Toggle Split Direction** | <kbd>SUPER</kbd> + <kbd>J</kbd> |
| **Cycle Window Focus** | <kbd>ALT</kbd> + <kbd>TAB</kbd> |
| **Directional Window Focus** | <kbd>SUPER</kbd> + <kbd>Arrow Keys</kbd> |
| **Switch Workspace 1–9** | <kbd>SUPER</kbd> + <kbd>1..9</kbd> |
| **Move Window to Workspace** | <kbd>SUPER</kbd> + <kbd>SHIFT</kbd> + <kbd>1..9</kbd> |
| **Next / Prev Workspace** | <kbd>SUPER</kbd> + <kbd>TAB</kbd> / <kbd>SUPER</kbd> + <kbd>SHIFT</kbd> + <kbd>TAB</kbd> |
| **Walker App Launcher** | <kbd>SUPER</kbd> + <kbd>SPACE</kbd> |
| **Cycle 4K Wallpapers** | <kbd>SUPER</kbd> + <kbd>CTRL</kbd> + <kbd>SPACE</kbd> |
| **Toggle Tokyo Night / Catppuccin** | <kbd>SUPER</kbd> + <kbd>SHIFT</kbd> + <kbd>CTRL</kbd> + <kbd>SPACE</kbd> |
| **Toggle Top Bar Visibility** | <kbd>SUPER</kbd> + <kbd>SHIFT</kbd> + <kbd>SPACE</kbd> |
| **View Keybindings Cheatsheet** | <kbd>SUPER</kbd> + <kbd>K</kbd> |

*(Note: On macOS, <kbd>Command</kbd> or <kbd>Option</kbd> maps to <kbd>SUPER</kbd>).*

---

## 🚀 Quickstart (Production VPS)

### 1. Clone the repository
```bash
git clone https://github.com/zhangcy122/omarchy-online.git
cd omarchy-online
```

### 2. Install Zellij with Web Client
```bash
./scripts/install_zellij.sh
```

### 3. Start the Web & Reverse Proxy Service
```bash
./scripts/run_omarchy_web.sh start
```
The service will start on `https://<YOUR-VPS-IP>:8443` (or `https://127.0.0.1:8443` locally).

### 4. Generate Login Token
For security, Zellij requires an access token on first connection:
```bash
./scripts/run_omarchy_web.sh token
```
Copy the token printed in terminal and paste it into the web prompt.

---

## 🛠️ Service Management

```bash
# Check status of Zellij and Caddy
./scripts/run_omarchy_web.sh status

# List active authentication tokens
./scripts/run_omarchy_web.sh list-tokens

# Stop the services
./scripts/run_omarchy_web.sh stop

# Restart the services
./scripts/run_omarchy_web.sh restart
```

---

## 📁 Repository Structure

```
omarchy-online/
├── .github/
│   └── workflows/
│       └── deploy-pages.yml    # Automated GitHub Pages static preview deployment
├── config/
│   ├── caddy/
│   │   └── Caddyfile           # TLS proxy, security headers & WebSocket rules
│   └── zellij/
│       └── config.kdl          # Tokyo Night theme & keybindings for Zellij
├── openspec/                   # OpenSpec capabilities & change proposals
├── scripts/
│   ├── install_zellij.sh       # Downloads Zellij static binary with Web client
│   ├── run_omarchy_web.sh      # Service lifecycle supervisor
│   ├── test_clean_desktop.py   # Playwright E2E verification for desktop mode
│   └── test_hyprland_dwindle.py# Playwright E2E verification for BSP tiling
├── systemd/
│   └── zellij-web.service      # Optional systemd user unit
├── web/                        # Frontend assets served by Caddy & GitHub Pages
│   ├── assets/                 # Official Omarchy SVG logos & 4K wallpapers
│   ├── app.js                  # Window manager, shortcuts & workspace state
│   ├── dwindle.js              # Hyprland Dwindle BSP layout engine
│   ├── index.html              # Desktop shell markup & Waybar top bar
│   ├── style.css               # Tokyo Night aesthetic & window styling
│   └── terminal-mock.html      # Interactive terminal simulator for static preview
├── README.md                   # English documentation
└── README_zh.md                # Chinese documentation
```

---

## 📄 License

MIT License. See [LICENSE](LICENSE) for details.
Official artwork, logos, and Tokyo Night configurations are copyright their respective upstream authors (Omarchy / Basecamp).
