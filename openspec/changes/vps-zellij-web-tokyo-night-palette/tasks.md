# Tasks: vps-zellij-web-tokyo-night-palette

- [ ] <!-- id: task-501-zellij-web-client-theme --> 在 `config/zellij/config.kdl` 中配置 `web_client { theme { background "#1a1b26" ... } }`，彻底对齐 Tokyo Night 原厂色板契约 (`config/zellij/config.kdl`)
- [ ] <!-- id: task-502-frontend-iframe-guard --> 在 `web/app.js` 的 `createTerminalIframe` 中注入 `#1a1b26` 背景样式与 `onload` 守卫，提供端到端加载防抖 (`web/app.js`)
- [ ] <!-- id: task-503-service-restart-and-e2e --> 重启 `zellij-web` 服务并通过 Playwright 验证计算背景色为 `rgb(26, 27, 38)` 并核验视觉截图 (`scripts/test_vps_terminal_color.py`)
