# Change Proposal: omarchy-web-v1-alignment

## Why
原版 Omarchy (David Heinemeier Hansson 主导) 是为开发者打造的高品质、全键盘驱动发行版，其核心灵魂在于：
1. **Quickshell 状态栏架构**：左侧 Omarchy 品牌标志菜单与平铺工作区 (Workspaces 1-9)、中间时钟与媒体状态、右侧系统监控与 AI 智能体状态栏 (`omarchy.agents`)；
2. **Walker 模态启动器**：按快捷键随时弹出全局居中模糊检索栏，快速调度终端应用、会话与工具；
3. **Tokyo Night / Catppuccin 高定色彩契约**：严格对齐 `colors.toml` 定义的深邃色板与视觉层级；
4. **终端优先体验**：平铺多终端、Neovim 开发环境与系统命令交互。

当前 `omarchy-online` 原型仅通过 Caddy 代理了裸露的 Zellij 基础网页，缺少 Omarchy 最具辨识度的顶部状态栏 (Waybar/Quickshell)、Walker 快速启动器浮层、AI Agent 状态指示以及品牌徽标。
为了满足用户要求“基于这个开发第一版的 omarchy-online，要有 omarchy 的基本构架和页面风格尽可能接近”，必须在前端构建 1:1 对齐 Omarchy 官方代码库设计规范的 Web 桌面工作台外壳，同时通过 Caddy 网关将外壳、API 与后台 PTY 会话紧密串联。

## What
本提案必须 (MUST) 实施以下核心交付物：
1. **官方设计资产对齐**：
   - 提取并引入 `/home/ubuntu/Projects/github/omarchy/logo.svg` 与像素化 `icon.png` 品牌资产；
   - 严格导入 `/home/ubuntu/Projects/github/omarchy/themes/tokyo-night/colors.toml` 色彩变量 (`#1a1b26`, `#13141c`, `#24283b`, `#7aa2f7`, `#a9b1d6`)。
2. **Omarchy Web Shell 前端桌面系统 (`web/`)**：
   - **顶部状态栏 (Omarchy Waybar/Quickshell Component)**：
     - 左侧：Omarchy 品牌 Logo 图标 (点击唤出 Walker 启动器)、工作区指示器 (1~9，高亮当前活跃工作区)；
     - 中间：格式化时钟 (`omarchy.clock`，实时秒级更新)；
     - 右侧：AI Agent 运行指示器 (`omarchy.agents` 徽标：显示 Hermes/Claude 状态)、网络状态、电源/全屏切换；
   - **Walker 模态启动器 (Walker Launcher Modal)**：
     - 支持 `Super + Space` 或 `Alt + Space` 快捷键瞬间呼出；
     - 支持输入过滤模糊搜索、执行快速命令、切换工作区与应用快捷项；
   - **工作区与终端容器**：
     - 嵌入高保真平铺终端视图，自动适配响应式视口大小，接管全局键盘事件。
3. **网关与路由契约重构 (`config/caddy/Caddyfile`)**：
   - 根路径 `/` 托管并交付 Omarchy Web Shell 前端；
   - `/zellij/` 与 `/ws` 路径反向代理直通宿主机 `127.0.0.1:8082`，并重写必要的跨域与 Frame 安全响应头。
4. **服务编排更新 (`scripts/run_omarchy_web.sh`)**：
   - 统一拉起 Zellij Web 后端与 Caddy 网关，输出一键访问 URL。

## Impact
- **系统兼容性**：宿主机保持纯净无容器依赖，纯静态前端 + 原生反代网关，内存占用额外增加 < 5MB。
- **用户体验**：打开浏览器即获得与真实 Omarchy 几乎毫无二致的高拟真度平铺桌面交互体验。
- **安全性**：网关保持严格 TLS 证书加密与 Token 访问控制，所有进程运行在普通用户权限下。
