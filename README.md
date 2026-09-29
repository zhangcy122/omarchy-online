# Omarchy Online 🚀

> 在原生 Ubuntu VPS 上运行、无需 Docker 容器，通过 Web 浏览器提供 1:1 逼近 **Omarchy** 体验的平铺多终端工作台。

基于 **Zellij Web Client (v0.45.1)** 与 **Caddy (TLS/WSS Reverse Proxy)** 架构，开箱即用，零容器污染，低资源消耗（<30MB RAM），硬件级 WebGL 流畅渲染与断线持久化会话。

---

## 🌟 核心特性

- 🖥️ **无容器原生运行**：直接运行在 Ubuntu 宿主机上，无需 Docker / KVM，完整复用本地环境与命令行工具链。
- 🎨 **Omarchy 专属视觉**：预置 Omarchy 官方同款 **Tokyo Night** 和 **Catppuccin Mocha** 主题色板。
- 🪟 **Hyprland 式平铺窗口与工作区**：支持多 Tab/工作区、垂直/水平分割窗格（Tiling）、浮动窗口（Floating Panes）与全屏放大。
- ⚡ **WebGL 硬件加速**：内置最新 `xterm.js` WebGL2 渲染引擎，打字与高频滚动极度丝滑。
- 🔒 **安全前置网关**：Caddy 统一负责 TLS (HTTPS / WSS) 终止，后端绑定 `127.0.0.1:8082`，支持 Token 令牌登录认证。
- 🛡️ **会话断线永不丢失**：浏览器关闭、刷新或网络波动后重新连接，所有终端会话与正在运行的程序保持原状。

---

## 📁 目录结构

```
omarchy-online/
├── config/
│   ├── zellij/
│   │   └── config.kdl         # Omarchy Tokyo Night 主题、快捷键与 UI 布局配置
│   └── caddy/
│       ├── Caddyfile          # TLS 证书反代、安全响应头与 WebSocket 转发配置
│       ├── cert.pem           # 自动生成的本地自签名证书
│       └── key.pem            # 私钥
├── scripts/
│   ├── install_zellij.sh      # 自动下载安装含 Web Client 的 Zellij v0.45.1 静态二进制
│   └── run_omarchy_web.sh     # 服务生命周期管理 (start / stop / status / token)
├── systemd/
│   └── zellij-web.service     # Systemd 用户级后台守护进程配置
└── README.md
```

---

## 🚀 快速上手 (Quickstart)

### 1. 安装 Zellij (含 Web 客户端)
```bash
./scripts/install_zellij.sh
```

### 2. 启动服务 (Zellij Web + Caddy)
```bash
./scripts/run_omarchy_web.sh start
```
此时 Web 服务已在后台启动：
- **Web 访问入口**：`https://<你的VPS-IP>:8443` 或本地 `https://127.0.0.1:8443`

### 3. 创建登录 Token
为了安全防护，Zellij Web 客户端首次使用时需要输入 Token：
```bash
./scripts/run_omarchy_web.sh token
```
系统会输出形如以下的 Token，直接在网页输入即可登录：
```
Created token successfully
token_1: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

---

## 🛠️ 服务运维与命令参考

```bash
# 查看服务运行状态
./scripts/run_omarchy_web.sh status

# 查看已有 Token 列表
./scripts/run_omarchy_web.sh list-tokens

# 停止所有服务
./scripts/run_omarchy_web.sh stop

# 重新启动服务
./scripts/run_omarchy_web.sh start
```

---

## ⌨️ 常用快捷键指引

| 操作 | 快捷键 |
| :--- | :--- |
| **新建平铺窗格 (Split)** | `Ctrl + p` 然后按 `n` (新建)、`r` (向右切)、`d` (向下切) |
| **窗格间穿梭 (Focus)** | `Ctrl + p` 然后按 `h/j/k/l` 或方向键 |
| **切换全屏最大化** | `Ctrl + p` 然后按 `f` |
| **关闭当前活动窗格** | `Ctrl + p` 然后按 `x` |
| **新建工作区 (Tab)** | `Ctrl + t` 然后按 `n` |
| **切换工作区 (Tab)** | `Ctrl + t` 然后按 `1~9` 或 `h/l` |
| **浮动窗格切换** | `Ctrl + p` 然后按 `w` |

---

## 🌐 域名与公共 HTTPS 配置 (可选)

若你在 VPS 上绑定了真实域名（如 `omarchy.yourdomain.com`）：
1. 编辑 `config/caddy/Caddyfile`：
   ```caddy
   omarchy.yourdomain.com {
       # Caddy 会自动通过 Let's Encrypt 申请官方免费 HTTPS 证书
       reverse_proxy 127.0.0.1:8082 {
           header_up Host {upstream_hostport}
           header_up X-Real-IP {remote_host}
       }
   }
   ```
2. 重启 Caddy：
   ```bash
   ./scripts/run_omarchy_web.sh stop && ./scripts/run_omarchy_web.sh start
   ```
   即可通过标准 443 端口安全访问。
