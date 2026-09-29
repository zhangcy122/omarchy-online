# Tasks: clean-desktop-show-desktop-toggle

- [x] <!-- id: task-201-clean-boot --> 纯净开机启动逻辑重构：开机取消自动生成初始终端，默认呈现完整桌面与 Omarchy 白标水印 (`web/app.js`)
- [x] <!-- id: task-202-show-desktop-toggle --> 实现 SUPER+D 显示/隐藏桌面所有窗口切换引擎，并支持平滑恢复布局状态 (`web/app.js`)
- [x] <!-- id: task-203-topbar-desktop-button --> 顶栏右侧与 Walker 启动器增加“显示桌面 (Desktop)”交互按钮与指令 (`web/index.html`, `web/app.js`)
- [x] <!-- id: task-204-close-shortcuts-fallback --> 扩充窗口关闭备用快捷键（支持 SUPER+C、SUPER+Q 与 SUPER+W），避免浏览器原生热键冲突 (`web/app.js`)
- [x] <!-- id: task-205-e2e-verification --> 编写并执行端到端自动化验证：开机视觉验证、SUPER+RETURN 唤出、SUPER+D 显隐切换、窗口销毁与工作区恢复 (`scripts/test_clean_desktop.py`)
