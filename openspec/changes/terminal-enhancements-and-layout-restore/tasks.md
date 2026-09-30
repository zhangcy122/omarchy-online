# Tasks: terminal-enhancements-and-layout-restore

- [ ] <!-- id: task-301-dwindle-serialize --> 实现 DwindleTree 的 serialize 与 deserialize 方法，完成树拓扑与分割参数的无损序列化 (`web/dwindle.js`)
- [ ] <!-- id: task-302-dwindle-swap --> 实现 DwindleTree 的 swapWindows 与 moveWindowDirection 窗口置换算法，支持快捷键重排 (`web/dwindle.js`, `web/app.js`)
- [ ] <!-- id: task-303-layout-restore-engine --> 实现 saveDesktopState 与 restoreDesktopState，在页面重开时自动恢复历史布局与多工作区状态 (`web/app.js`)
- [ ] <!-- id: task-304-terminal-style-session --> 终端视觉风格深度对齐（Tokyo Night、Starship 提示符）与 Session 命名隔离/自动重连支持 (`web/terminal-mock.html`, `web/app.js`)
- [ ] <!-- id: task-305-e2e-verification --> 编写并执行端到端 Playwright 自动化验证：多窗口生成、重排、刷新后 100% 布局复原与快捷键验证 (`scripts/test_layout_restore.py`)
