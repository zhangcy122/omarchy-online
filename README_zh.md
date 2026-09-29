# Omarchy Online 🚀

[English](README.md) | [简体中文](README_zh.md)

> 在原生 Ubuntu VPS 上运行，无需 Docker 容器，通过浏览器体验接近 Omarchy 原生的 Hyprland 多终端平铺桌面。

[![在线体验 (GitHub Pages)](https://img.shields.io/badge/在线体验-GitHub_Pages-7aa2f7?style=for-the-badge&logo=github)](https://zhangcy122.github.io/omarchy-online/)
[![开源协议](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)](LICENSE)
[![主题](https://img.shields.io/badge/Theme-Tokyo_Night-1a1b26?style=for-the-badge)](web/style.css)

**Omarchy Online** 将 [Omarchy](https://github.com/basecamp/omarchy)（Arch Linux + Hyprland）的工作流移植到了网页端。宿主机直接运行 **Zellij Web** 与 **Caddy** 反向代理，占用不到 30MB 内存，支持连接断开后会话保持。

---

## 🌐 在线预览站点

你可以在 GitHub Pages 上直接体验桌面 UI 与 Hyprland Dwindle 平铺排版：

👉 **[https://zhangcy122.github.io/omarchy-online/](https://zhangcy122.github.io/omarchy-online/)**

GitHub Pages 运行在**模拟运行模式 (Mock Preview)**，内置模拟交互终端（可执行 `fastfetch`、`btop`、`nvim`、`lazygit` 等命令）和完整的窗口分屏能力。

---

## 🛠️ 主要特性

- **原生运行，免除容器**：直接在 Ubuntu 宿主机上运行，无需 Docker，工具链与本地文件直接互通。
- **Hyprland Dwindle 平铺排版**：采用二叉空间切分（BSP）树，支持 10px 外间距、5px 内间距与 `#7aa2f7` 亮蓝发光边框。
- **默认纯净桌面**：开机呈现完整的 4K 壁纸与 Omarchy 水印，按 `SUPER + RETURN` 随时呼出终端。
- **一键显示桌面 (`SUPER + D`)**：瞬间隐藏当前工作区全部窗口，再次按下恢复原样排版。
- **9 个独立工作区**：工作区 1~9 互相隔离，顶栏指示器动态呈现活跃状态。
- **Walker 启动器 (`SUPER + SPACE`)**：快速模糊搜索与启动常用工具。
- **断线持久化**：即使关闭网页或网络波动，Zellij 后台终端进程仍持续运行，重连后完全恢复。
- **安全反代**：Caddy 在 `8443` 端口接管 TLS 终止并转发 WebSocket。

---

## ⌨️ 快捷键速查表

| 操作 | 快捷键 |
| :--- | :--- |
| **新建平铺终端** | <kbd>SUPER</kbd> + <kbd>RETURN</kbd> |
| **关闭当前窗口** | <kbd>SUPER</kbd> + <kbd>W</kbd> / <kbd>Q</kbd> / <kbd>C</kbd>（或点击标题栏 🔴 红点） |
| **一键显示 / 隐藏桌面** | <kbd>SUPER</kbd> + <kbd>D</kbd>（或点击顶栏 🖥️ 按钮） |
| **切换浮动 / 平铺模式** | <kbd>SUPER</kbd> + <kbd>T</kbd> |
| **切换全屏最大化** | <kbd>SUPER</kbd> + <kbd>F</kbd> |
| **切换切分方向 (横/纵)** | <kbd>SUPER</kbd> + <kbd>J</kbd> |
| **循环切换窗口焦点** | <kbd>ALT</kbd> + <kbd>TAB</kbd> |
| **方向键焦点导航** | <kbd>SUPER</kbd> + <kbd>方向键</kbd> |
| **切换工作区 1~9** | <kbd>SUPER</kbd> + <kbd>1..9</kbd> |
| **将窗口移动至工作区** | <kbd>SUPER</kbd> + <kbd>SHIFT</kbd> + <kbd>1..9</kbd> |
| **上一个 / 下一个工作区** | <kbd>SUPER</kbd> + <kbd>TAB</kbd> / <kbd>SUPER</kbd> + <kbd>SHIFT</kbd> + <kbd>TAB</kbd> |
| **Walker 应用启动器** | <kbd>SUPER</kbd> + <kbd>SPACE</kbd> |
| **轮换 4K 官方壁纸** | <kbd>SUPER</kbd> + <kbd>CTRL</kbd> + <kbd>SPACE</kbd> |
| **切换 Tokyo Night / Catppuccin** | <kbd>SUPER</kbd> + <kbd>SHIFT</kbd> + <kbd>CTRL</kbd> + <kbd>SPACE</kbd> |
| **切换显示 / 隐藏顶栏** | <kbd>SUPER</kbd> + <kbd>SHIFT</kbd> + <kbd>SPACE</kbd> |
| **查看全量快捷键手册** | <kbd>SUPER</kbd> + <kbd>K</kbd> |

*(注：在 macOS 上，<kbd>Command</kbd> 或 <kbd>Option</kbd> 键映射为 <kbd>SUPER</kbd>)*

---

## 🚀 生产 VPS 部署步骤

### 1. 克隆仓库
```bash
git clone https://github.com/zhangcy122/omarchy-online.git
cd omarchy-online
```

### 2. 安装 Zellij Web 客户端
```bash
./scripts/install_zellij.sh
```

### 3. 启动服务 (Zellij Web + Caddy)
```bash
./scripts/run_omarchy_web.sh start
```
服务将在 `https://<你的VPS-IP>:8443` 或本地 `https://127.0.0.1:8443` 启动。

### 4. 获取登录令牌 (Token)
首次连接需要验证 Token：
```bash
./scripts/run_omarchy_web.sh token
```
复制终端输出的 Token 粘贴至浏览器提示框即可登录。

---

## 🛠️ 服务管理命令

```bash
# 查看服务状态
./scripts/run_omarchy_web.sh status

# 列出已有访问令牌
./scripts/run_omarchy_web.sh list-tokens

# 停止服务
./scripts/run_omarchy_web.sh stop

# 重启服务
./scripts/run_omarchy_web.sh restart
```

---

## 📁 目录结构

```
omarchy-online/
├── .github/
│   └── workflows/
│       └── deploy-pages.yml    # GitHub Pages 静态站点自动部署工作流
├── config/
│   ├── caddy/
│   │   └── Caddyfile           # TLS 代理与 WebSocket 规则配置
│   └── zellij/
│       └── config.kdl          # Zellij 主题与快捷键配置
├── openspec/                   # OpenSpec 规范与变更提案
├── scripts/
│   ├── install_zellij.sh       # 下载与安装 Zellij 静态二进制
│   ├── run_omarchy_web.sh      # 服务进程监管脚本
│   ├── test_clean_desktop.py   # 纯净桌面 Playwright 端到端测试
│   └── test_hyprland_dwindle.py# 平铺排版 Playwright 端到端测试
├── systemd/
│   └── zellij-web.service      # 可选的 systemd 用户单元配置
├── web/                        # 网页前端与 GitHub Pages 托管资源
│   ├── assets/                 # Omarchy 矢量 Logo 与 4K 壁纸
│   ├── app.js                  # 窗口管理器与全局按键引擎
│   ├── dwindle.js              # Hyprland Dwindle 平铺排版算法
│   ├── index.html              # 桌面外壳结构与 Waybar 状态栏
│   ├── style.css               # Tokyo Night 视觉样式
│   └── terminal-mock.html      # 模拟运行终端（静态演示环境）
├── README.md                   # 英文说明文档
└── README_zh.md                # 中文说明文档
```

---

## 📄 授权许可

本项目基于 MIT 协议开源。详见 [LICENSE](LICENSE)。
Omarchy 官方标识与 Tokyo Night 配置所有权归上游原作者所有。
