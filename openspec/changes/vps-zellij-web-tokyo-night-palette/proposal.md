# Change Proposal: vps-zellij-web-tokyo-night-palette

## Why
在真实 VPS 环境下打开 Omarchy Online 终端时，终端区域色彩存在明显不一致与灰暗偏色（用户截图取色为 `#383e5a` / `rgb(56, 62, 90)`），与桌面整体的 Tokyo Night 深黑底色（`#1a1b26`）产生割裂感：
1. **Zellij 0.45.1 `web_client` 独立主题块缺失**：
   Zellij 的 Web 终端客户端在协议层使用独立的 `web_client { theme { ... } }` 配置，与通用 TUI `themes` 配置解耦。在未显式声明时，后端硬编码回退为次级灰板底色 `56 62 90`，并通过内联 `style.background` 强制写入终端 DOM，造成整个终端窗格泛灰暗沉。
2. **终端 iframe 加载期缺乏底色锁定守卫**：
   `web/app.js` 创建终端 `iframe` 时未注入内联 `#1a1b26` 背景及 `onload` 样式防护，在页面初始化与网络建立期间容易产生底色跳变。

## What
本提案必须 (MUST) 实施以下核心机制：
1. **Zellij 原厂 Web Client Tokyo Night 色板契约对齐 (`config/zellij/config.kdl`)**：
   - 必须 (MUST) 显式增加 `web_client { theme { ... } }` 配置块；
   - 必须 (MUST) 将 `background` 严格定义为 `#1a1b26`，`foreground` 定义为 `#c0caf5`，并补全完整 16 色 Tokyo Night 调色板映射；
   - 必须 (SHALL) 保持配置语法在 `zellij setup --check` 下合法解析。
2. **前端终端 iframe 深色保底与加载守卫 (`web/app.js`)**：
   - 必须 (MUST) 在 `createTerminalIframe` 创建元素时预置 `iframe.style.background = '#1a1b26'`；
   - 必须 (MUST) 在 `onload` 事件中确保子 DOM `body` 与 `#terminal` 立即获得 `#1a1b26` 深色底色，消除任何阶段性白/灰跳变。
3. **自动化端到端渲染与色彩提取校验 (`scripts/test_vps_terminal_color.py`)**：
   - 必须 (MUST) 重启 `zellij-web` 服务生效新配置；
   - 必须 (MUST) 通过 Playwright CDP 访问实时会话，提取终端实际渲染计算样式，断言 `background-color` 为 `rgb(26, 27, 38)` (`#1a1b26`)；
   - 必须 (MUST) 保存核验截图以供审查。

## Impact
- **视觉一致性**：彻底消除终端区域泛灰暗沉现象，实现终端内部与桌面外框 100% 1:1 无缝契合的 Tokyo Night 深黑底色。
- **架构健壮性**：结合 Zellij 服务端原生协议下发与前端 DOM 防抖双重保险，保障在任何网络延迟与渲染时机下的色彩稳定。
