# Change Proposal: vps-terminal-alignment-and-session-direct

## Why
在真实 VPS 环境下使用 Omarchy Online 终端时，存在两项显著割裂用户体验的问题：
1. **每次打开终端均弹出 "HI FROM ZELLIJ" 会话选择菜单**：
   此前 `web/app.js` 生成的终端 URL 使用了 Query 参数 `/zellij/?session=${sessionId}`，而 Zellij Web 客户端仅支持从 URL Path（`location.pathname.split("/").pop()`）获取会话名称。导致每次打开新窗口或切工作区时，Zellij 均判定为未指定 Session，强行展示独立会话选择器与历史所有临时会话，阻断了即开即用的工作流。
2. **终端视觉风格与 Omarchy 原厂体验严重不一致**：
   - Zellij 启动时未加载 `~/.config/zellij/config.kdl`，退化为默认灰黑配色；
   - 默认开启了 `pane_frames true`，在 Hyprland 桌面窗口内出现多重重叠边框与状态栏；
   - VPS 宿主机 bash 使用默认纯文本提示符，未集成 Omarchy 原厂 Tokyo Night 配色与 Starship 状态行。

## What
本提案实施以下三项核心机制：
1. **URL 会话路径直连规范化 (`web/app.js`)**：
   - 修改 `getTerminalUrl()`，在真实 VPS 环境下返回标准 Path 格式 `/zellij/${encodeURIComponent(sessionId)}`，使 Zellij Web 客户端开箱即精准挂载对应 Session，彻底消除 Session 选择弹窗。
2. **Zellij 原厂 Tokyo Night 与无边框精炼布局部署 (`config/zellij/config.kdl`, `scripts/run_omarchy_web.sh`)**：
   - 配置 `theme "tokyo-night"` 与完整的 Tokyo Night 色板契约；
   - 设置 `pane_frames false` 与 `simplified_ui true`，消除内嵌双重框与冗余插件 UI；
   - 确保 `~/.config/zellij/config.kdl` 正确链接至仓库配置，在 `run_omarchy_web.sh` 中固化自动链接。
3. **Omarchy Starship 提示符与宿主 Shell 视觉对齐 (`~/.config/starship.toml`, `~/.bashrc`)**：
   - 部署 Starship Tokyo Night 样式配置 (`~/.config/starship.toml`)；
   - 在 `~/.bashrc` 中集成 Starship 初始化，使交互式终端呈现与 Omarchy 原厂完全一致的 `user@omarchy in ~ on  main ❯`；
   - 提供清理历史僵尸孤儿会话能力。

## Impact
- **用户体验**：打开终端瞬间进入专属 Session，无任何阻断式弹窗。
- **视觉一致性**：整机终端呈现 1:1 Omarchy 原厂 Tokyo Night、无边框极简风格与 Starship 丰富状态提示符。
