# Change Proposal: terminal-enhancements-and-layout-restore

## Why
用户希望进一步对齐 Omarchy 系统的体验，提出两项关键能力升级：
1. **Terminal 体验与视觉深度对齐**：
   - 视觉风格：对齐 Omarchy 原厂 Tokyo Night 调色板、Starship 风格提示符、JetBrains Mono 字体排版与霓虹高亮边框；
   - Session 自动管理：按工作区建立隔离的命名空间（如 `omarchy-ws{id}-main`），断网或刷新时不丢失后台任务，自动 re-attach 续连；
   - 窗口动态重排：支持 Hyprland Dwindle BSP 树窗口位置交换（`SUPER + SHIFT + H/J/K/L` 或方向键 `swapwindow`）与切分方向切换（`SUPER + J`）。
2. **重新打开页面与刷新时 100% 恢复先前的桌面布局**：
   - 此前用户多开窗口、调整平铺比例或分布在不同工作区后，一旦刷新网页或关闭重开，所有窗口即丢失，强制退化为单个默认欢迎窗口；
   - 必须 (MUST) 实现多工作区桌面状态、窗口元数据与 Dwindle BSP 二叉树拓扑的无损序列化，持久化存储于 `localStorage`，并在重新打开服务页面时自动完整恢复。

## What
本提案必须 (MUST) 实施以下核心机制：
1. **Dwindle 树无损拓扑序列化与逆序列化 (`web/dwindle.js`)**：
   - 实现 `DwindleTree.prototype.serialize()` 与静态 `DwindleTree.deserialize(data, windowMap)`，保留完整的节点层级、切分方向（`v`/`h`）、分割比例（`ratio`）与双向父子指针；
   - 实现 `DwindleTree.prototype.swapWindows(windowIdA, windowIdB)`，原子级置换两个叶子窗口的映射，保持整体树形几何稳定的同时完成窗口重排；
   - 实现 `DwindleTree.prototype.moveWindowDirection(windowId, direction)`，按几何相邻方向自动寻找并置换目标窗口。
2. **桌面多工作区状态持久化与自动恢复引擎 (`web/app.js`)**：
   - `saveDesktopState()`：收集 `currentWorkspace`、`windowCounter` 及每个工作区内的窗口元数据（ID、标题、类型、URL/Session、浮动/全屏状态）与 BSP 树结构，静默持久化至 `localStorage`；
   - `restoreDesktopState()`：页面加载时自动读取状态；若存在历史布局则重建 DOM 与 Dwindle 树并无感恢复；若为空则优雅降级为初始欢迎页；
   - 在窗口生成、销毁、聚焦、移动、切分、工作区切换及 `beforeunload` 时自动触发保存；
   - 在 Walker 启动器中提供“Reset Desktop Layout”兜底选项。
3. **终端视觉风格与 Session 自动管理 (`web/terminal-mock.html`, `web/app.js`)**：
   - 强化模拟终端与宿主机终端的 Tokyo Night 配色契约、Starship 风格提示符与 JetBrains Mono 字体体验；
   - 规范终端 Session 命名规则与 URL 参数挂载，支持重开时精准定位原 Session。

## Impact
- **用户连续性**：即使误关浏览器或刷新，之前的开发工作流、并排终端与编辑器布局毫秒级瞬间还原。
- **操作效率**：终端拥有完整的 Omarchy 原厂视觉风格，并能通过原生快捷键瞬时重排窗口。
