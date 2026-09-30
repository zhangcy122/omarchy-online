# Tasks: vps-terminal-alignment-and-session-direct

- [x] <!-- id: task-401-url-session-path --> 修改 `web/app.js` 的 `getTerminalUrl()`，在真实 VPS 环境下使用 `/zellij/${encodeURIComponent(sessionId)}` 路径规范 (`web/app.js`)
- [x] <!-- id: task-402-zellij-config-kdl --> 优化 `config/zellij/config.kdl`，启用 tokyo-night 主题、`pane_frames false` 与 `simplified_ui true`，消除冗余边框 (`config/zellij/config.kdl`)
- [x] <!-- id: task-403-lifecycle-symlink --> 在 `scripts/run_omarchy_web.sh` 中增加自动创建 `~/.config/zellij/config.kdl` 软链接机制 (`scripts/run_omarchy_web.sh`)
- [x] <!-- id: task-404-starship-styling --> 部署 `~/.config/starship.toml` 与 `~/.bashrc` 中的 Starship Tokyo Night 提示符集成，对齐 Omarchy 原厂视觉风格
- [x] <!-- id: task-405-e2e-verification --> 编写并执行 Playwright 自动化验证脚本，检验直连会话、无选择弹窗与外观一致性 (`scripts/test_vps_terminal_direct.py`)
