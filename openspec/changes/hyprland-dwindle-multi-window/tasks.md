# Tasks: hyprland-dwindle-multi-window

- [x] <!-- id: task-101-dwindle-engine --> 编写 Hyprland Dwindle 二叉平铺树算法引擎：实现窗口节点的动态切分、布局计算、尺寸重绘与间隙管理 (web/dwindle.js)
- [x] <!-- id: task-102-window-lifecycle --> 编写多窗口生命周期管理器：实现 SUPER+RETURN 创建新终端窗口、SUPER+W/Q 销毁窗口与焦点切换 (web/window-manager.js)
- [x] <!-- id: task-103-workspace-isolation --> 实现 9 个虚拟工作区窗口隔离：各个工作区独立维护窗口列表，顶栏工作区指示器动态显示驻留点 (web/app.js)
- [x] <!-- id: task-104-window-ui-styles --> 升级窗口与桌面样式表：实现活动窗口高亮亮蓝发光边框 (#7aa2f7)、平滑重排过渡动效与多窗口标题栏 (web/style.css)
- [x] <!-- id: task-105-walker-integration --> 整合 Walker 启动器与快捷键：支持从启动器快速派生终端、Neovim、Btop 窗口与快捷键触发
- [x] <!-- id: task-106-verification-e2e --> 全链路实机端到端验证：验证创建 1个、2个、3个、4个平铺终端窗口的排版正确性，验证窗口关闭自适应与多工作区切换
