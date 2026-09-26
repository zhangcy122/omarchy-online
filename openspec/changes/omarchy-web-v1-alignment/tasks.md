# Tasks: omarchy-web-v1-alignment

- [ ] <!-- id: task-001-extract-assets --> 提取官方 Omarchy 设计资产：复制 logo.svg, icon.png 及 Tokyo Night 颜色定义至 web/assets 目录
- [ ] <!-- id: task-002-create-shell-html --> 构建 Omarchy Web Shell 前端骨架：实现顶栏 Waybar 结构、Walker 模态对话框与终端视口容器 (web/index.html)
- [ ] <!-- id: task-003-create-shell-css --> 编写 Omarchy Tokyo Night 高定设计样式表：实现精确的顶栏毛玻璃、工作区切换样式、Walker 弹出层与按键标签 (web/style.css)
- [ ] <!-- id: task-004-create-shell-js --> 编写桌面交互与按键拦截引擎：实现实时时钟、工作区切换、Walker 模糊过滤、键盘锁与快捷键绑定 (web/app.js)
- [ ] <!-- id: task-005-update-caddy --> 重构 Caddyfile 路由规则：根路径交付 Web Shell，/zellij/ 路由反代至 127.0.0.1:8082 并优化 X-Frame-Options
- [ ] <!-- id: task-006-verify-e2e --> 执行全链路实机端到端验证：验证静态页面与动态反代接口正确交付，HTTP 状态码 200，样式与交互无报错
