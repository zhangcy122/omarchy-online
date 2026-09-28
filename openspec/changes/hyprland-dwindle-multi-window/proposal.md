# Change Proposal: hyprland-dwindle-multi-window

## Why
在真实的 Omarchy 发行版中，用户的核心生产力来自于 **Hyprland 动态平铺窗口管理器 (Dwindle Layout)**：
1. **多终端多任务平铺**：按 `SUPER + RETURN` 可以随时唤起新的终端窗口（Terminal），Hyprland 会基于 Dwindle 算法（二叉螺旋切分树）将新窗口无缝排版并与已有窗口平分屏幕空间；
2. **多窗格自适应生命周期**：按 `SUPER + W` 或 `SUPER + Q` 可以关闭当前活动窗口，剩余窗口必须 (MUST) 自动填补空缺并平滑重新调整大小；
3. **多工作区窗口隔离**：Workspaces 1 至 9 各自维护独立的窗口集合，顶栏工作区指示器会直观显示哪些工作区驻留了活跃窗口；
4. **窗口聚焦与状态反馈**：当前活动窗口拥有标志性的 `#7aa2f7` 亮蓝发光边框，非活动窗口采用暗色边框，支持键盘方向键穿梭与鼠标聚焦。

当前 `omarchy-online` 原型视口中仅有一个单体视口容器，用户无法动态新开或并列排版多个终端窗口。
为了完整实现用户需求“支持和 omarchy 一样的方式显示桌面和排列窗口，支持新加 terminal 窗口”，必须 (MUST) 在前端实现一套完整的 **Hyprland Dwindle Web 窗口管理器引擎**，精准复现 Omarchy 的窗口排版与生命周期。

## What
本提案必须 (MUST) 实施以下核心架构与技术能力：
1. **Hyprland Dwindle 平铺引擎 (`web/dwindle.js`)**：
   - 采用二叉空间分割树 (Binary Space Partitioning Tree) 模拟 Hyprland Dwindle 核心算法；
   - 窗口数量为 1 时：占满全屏并严格保留 `gaps_out = 10px` 外间距；
   - 窗口数量 > 1 时：新窗口基于聚焦节点或树的最深右节点按横纵交替规则对半分屏，各窗口之间保留 `gaps_in = 5px` 内间距；
   - 窗口关闭时：自动回收节点并将其兄弟节点尺寸扩张至父节点容器，完成布局重算与重绘；
   - 严禁 (MUST NOT) 破坏或溢出视口可用边界。
2. **多终端窗口生命周期系统**：
   - 快捷键 `SUPER + RETURN` 动态实例化并挂载新的 Terminal 窗口；
   - 快捷键 `SUPER + W` 或 `SUPER + Q`（以及点击窗口红色关闭按钮）销毁当前聚焦窗口；
   - 快捷键 `SUPER + F` 将聚焦窗口全屏铺满，再次按下恢复平铺；
   - 快捷键 `SUPER + T` 切换窗口平铺与浮动模式 (Floating/Tiling Toggle)；
   - 快捷键 `SUPER + Arrows` 或鼠标悬停切换窗口焦点，激活窗口边框高亮为 `#7aa2f7`。
3. **多工作区状态与指示器联动**：
   - 9 个工作区（Workspaces 1~9）实现完全独立的状态字典，各工作区拥有独立的窗口树；
   - 顶部状态栏（Waybar）工作区徽标必须 (SHALL) 联动渲染：包含窗口的工作区展示指示点，空工作区展示暗淡色。
4. **Walker 启动器与交互联动**：
   - Walker 启动器支持选择 “New Terminal Window”、“Neovim”、“Btop” 并直接派生对应平铺窗口。

## Impact
- **用户体验**：完美复刻 Omarchy 原生 Hyprland 的平铺分屏与按键质感，真正做到在 Web 端像使用本地平铺桌面一样高效开发。
- **架构兼容**：纯原生前端算法，不依赖庞大笨重的第三方外部框架，零服务器额外负载，保持轻量高效。
- **扩展性**：后续可无缝接入独立 PTY 多通道，为每个平铺窗口分配隔离的会话终端。
