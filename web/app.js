/**
 * Omarchy Online - Desktop Shell & Hyprland Window Manager Engine
 * 1:1 Parity with Omarchy Hyprland Dwindle Layout & Keybindings
 */

// ============================================================
// 1. Multi-Workspace & Dwindle Window State
// ============================================================
const workspaces = {};
for (let i = 1; i <= 9; i++) {
  workspaces[i] = {
    id: i,
    tree: new window.DwindleTree(),
    windows: [], // Array of { id, wsId, title, type, el, iframe, isFloating, isFullscreen, rect }
    focusedId: null
  };
}

let currentWorkspace = 1;
let windowCounter = 0;

document.addEventListener('DOMContentLoaded', () => {
  initClock();
  initWorkspacesUI();
  initWalkerLauncher();
  initKeybindingsCheatsheet();
  initHyprlandKeybindings();
  initControls();

  // Handle window resizing
  window.addEventListener('resize', () => {
    renderWorkspace(currentWorkspace);
  });

  // Default launch: Open simulated browser window showcasing Omarchy intro & key features
  spawnWindow(1, {
    type: 'browser',
    title: 'chromium ~ Omarchy Online: Hyprland Workspace for VPS',
    url: 'browser-home.html'
  });

  // Update badge if in GitHub Pages or Mock environment
  if (window.location.hostname.endsWith('github.io') || window.location.search.includes('mock=true')) {
    const badge = document.getElementById('agent-badge');
    if (badge) {
      badge.innerHTML = '<span class="pulse-dot"></span><span>GitHub Site Preview</span>';
      badge.title = 'Running in Static Mock Preview Mode on GitHub Pages';
    }
  }
});

// ============================================================
// 2. Window Manager (Spawn, Close, Focus, Float, Fullscreen)
// ============================================================

function getTerminalUrl(type = 'terminal') {
  if (type === 'browser') {
    return 'browser-home.html';
  }
  const isMockEnv = window.location.hostname.endsWith('github.io') ||
                    window.location.protocol === 'file:' ||
                    window.location.search.includes('mock=true');
  if (isMockEnv) {
    return `terminal-mock.html?type=${encodeURIComponent(type)}`;
  }
  return '/zellij/';
}

function spawnWindow(wsId = currentWorkspace, options = {}) {
  const ws = workspaces[wsId];
  if (!ws) return null;

  const winId = `win-${++windowCounter}`;
  const type = options.type || 'terminal';
  const title = options.title || `alacritty ~ user@omarchy:~ [${winId}]`;
  const url = options.url || getTerminalUrl(type);

  const winEl = document.createElement('div');
  winEl.className = 'hypr-window';
  winEl.id = winId;
  winEl.setAttribute('data-ws', wsId);

  winEl.innerHTML = `
    <div class="window-titlebar">
      <div class="window-title-left">
        <span class="window-title-badge">${type}</span>
        <span class="window-title-text">${title}</span>
      </div>
      <div class="window-controls">
        <span class="win-dot min" title="Toggle Floating (SUPER + T)"></span>
        <span class="win-dot max" title="Toggle Fullscreen (SUPER + F)"></span>
        <span class="win-dot close" title="Close Window (SUPER + W / Q)"></span>
      </div>
    </div>
    <div class="window-body">
      <iframe class="terminal-frame" src="${url}" allow="clipboard-read; clipboard-write; fullscreen"></iframe>
    </div>
  `;

  const container = document.getElementById('windows-container');
  if (container) {
    container.appendChild(winEl);
  }

  const winObj = {
    id: winId,
    wsId: wsId,
    title: title,
    type: type,
    el: winEl,
    iframe: winEl.querySelector('iframe'),
    isFloating: false,
    isFullscreen: false,
    rect: null
  };

  ws.windows.push(winObj);

  // Insert into Hyprland Dwindle BSP Tree
  ws.tree.addWindow(winObj, ws.focusedId);
  ws.focusedId = winId;

  // Event handlers
  winEl.addEventListener('mousedown', () => {
    focusWindow(winId);
  });

  const iframeEl = winEl.querySelector('iframe');
  iframeEl?.addEventListener('load', () => {
    try {
      iframeEl.contentWindow?.addEventListener('keydown', handleHyprlandKeydown);
    } catch (err) {}
  });

  const closeBtn = winEl.querySelector('.win-dot.close');
  closeBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    closeWindow(winId);
  });

  const minBtn = winEl.querySelector('.win-dot.min');
  minBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleFloating(winId);
  });

  const maxBtn = winEl.querySelector('.win-dot.max');
  maxBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleWindowFullscreen(winId);
  });

  renderWorkspace(wsId);
  focusWindow(winId);
  updateWorkspaceIndicators();

  showToast(`Window opened [${type}] on Workspace ${wsId}`);
  return winObj;
}

function closeWindow(winId) {
  if (!winId) return;

  let targetWsId = null;
  let targetWin = null;

  for (let id = 1; id <= 9; id++) {
    const ws = workspaces[id];
    const found = ws.windows.find(w => w.id === winId);
    if (found) {
      targetWsId = id;
      targetWin = found;
      break;
    }
  }

  if (!targetWin) return;
  const ws = workspaces[targetWsId];

  // Remove DOM element
  if (targetWin.el && targetWin.el.parentNode) {
    targetWin.el.parentNode.removeChild(targetWin.el);
  }

  // Remove from window list
  ws.windows = ws.windows.filter(w => w.id !== winId);

  // Remove from Dwindle BSP tree
  const nextToFocusNode = ws.tree.removeWindow(winId);

  if (ws.focusedId === winId) {
    if (nextToFocusNode && nextToFocusNode.window) {
      ws.focusedId = nextToFocusNode.window.id;
    } else if (ws.windows.length > 0) {
      ws.focusedId = ws.windows[ws.windows.length - 1].id;
    } else {
      ws.focusedId = null;
    }
  }

  renderWorkspace(targetWsId);

  if (targetWsId === currentWorkspace) {
    if (ws.focusedId) {
      focusWindow(ws.focusedId);
    } else {
      const activeLabel = document.getElementById('current-window-title');
      if (activeLabel) {
        activeLabel.textContent = `desktop ~ workspace ${currentWorkspace} (empty)`;
      }
    }
  }

  updateWorkspaceIndicators();
  showToast('Window closed');
}

function focusWindow(winId) {
  const ws = workspaces[currentWorkspace];
  if (!ws) return;

  ws.windows.forEach(w => {
    if (w.id === winId) {
      w.el.classList.add('active');
      ws.focusedId = winId;
      const titleEl = document.getElementById('current-window-title');
      if (titleEl) titleEl.textContent = w.title;
      try {
        w.iframe?.focus();
      } catch (err) {}
    } else {
      w.el.classList.remove('active');
    }
  });
}

function toggleFloating(winId = null) {
  const ws = workspaces[currentWorkspace];
  const targetId = winId || ws.focusedId;
  if (!targetId) return;

  const win = ws.windows.find(w => w.id === targetId);
  if (!win) return;

  win.isFloating = !win.isFloating;
  const desktop = document.getElementById('hypr-desktop');

  if (win.isFloating) {
    ws.tree.removeWindow(targetId);
    win.el.classList.add('floating');

    const dw = desktop ? desktop.clientWidth : 1200;
    const dh = desktop ? desktop.clientHeight : 800;
    const fw = Math.min(850, Math.round(dw * 0.7));
    const fh = Math.min(550, Math.round(dh * 0.7));
    const fx = Math.round((dw - fw) / 2);
    const fy = Math.round((dh - fh) / 2);

    win.el.style.left = `${fx}px`;
    win.el.style.top = `${fy}px`;
    win.el.style.width = `${fw}px`;
    win.el.style.height = `${fh}px`;
    showToast('Toggled Floating Mode (SUPER + T)');
  } else {
    win.el.classList.remove('floating');
    ws.tree.addWindow(win);
    showToast('Toggled Tiling Mode (SUPER + T)');
  }

  renderWorkspace(currentWorkspace);
}

function toggleWindowFullscreen(winId = null) {
  const ws = workspaces[currentWorkspace];
  const targetId = winId || ws.focusedId;
  if (!targetId) {
    toggleBrowserFullscreen();
    return;
  }

  const win = ws.windows.find(w => w.id === targetId);
  if (!win) {
    toggleBrowserFullscreen();
    return;
  }

  win.isFullscreen = !win.isFullscreen;
  if (win.isFullscreen) {
    win.el.classList.add('fullscreen');
    showToast('Window Fullscreen (SUPER + F)');
  } else {
    win.el.classList.remove('fullscreen');
    showToast('Window Restored');
  }
}

let isDesktopShown = false;

function toggleShowDesktop() {
  const ws = workspaces[currentWorkspace];
  if (!ws || ws.windows.length === 0) {
    showToast('Desktop already clean (no windows open)');
    return;
  }

  isDesktopShown = !isDesktopShown;
  const watermark = document.getElementById('empty-desktop-watermark');

  if (isDesktopShown) {
    ws.windows.forEach(w => {
      w.el.style.display = 'none';
    });
    if (watermark) watermark.classList.remove('hidden');
    showToast('🖥️ Desktop Shown (SUPER + D to restore)');
  } else {
    ws.windows.forEach(w => {
      w.el.style.display = 'flex';
    });
    if (watermark) watermark.classList.add('hidden');
    renderWorkspace(currentWorkspace);
    if (ws.focusedId) focusWindow(ws.focusedId);
    showToast('🪟 Windows Restored');
  }
}

function toggleSplitDirection() {
  const ws = workspaces[currentWorkspace];
  if (!ws || !ws.focusedId) return;
  const toggled = ws.tree.toggleSplit(ws.focusedId);
  if (toggled) {
    renderWorkspace(currentWorkspace);
    showToast('Toggled Split Direction (SUPER + J)');
  }
}

function cycleFocus(direction = 1) {
  const ws = workspaces[currentWorkspace];
  if (!ws || ws.windows.length <= 1) return;
  const curIdx = ws.windows.findIndex(w => w.id === ws.focusedId);
  const nextIdx = (curIdx + direction + ws.windows.length) % ws.windows.length;
  focusWindow(ws.windows[nextIdx].id);
}

function focusAdjacentWindow(direction) {
  const ws = workspaces[currentWorkspace];
  if (!ws || ws.windows.length <= 1) return;
  const curWin = ws.windows.find(w => w.id === ws.focusedId);
  if (!curWin || !curWin.rect) {
    cycleFocus(direction === 'right' || direction === 'down' ? 1 : -1);
    return;
  }

  const curRect = curWin.rect;
  let bestCandidate = null;
  let minDistance = Infinity;

  ws.windows.forEach(w => {
    if (w.id === curWin.id || !w.rect || w.isFloating) return;
    const r = w.rect;
    let valid = false;
    let dist = Infinity;

    if (direction === 'left' && r.x + r.w <= curRect.x + 10) {
      valid = true;
      dist = Math.abs(curRect.x - (r.x + r.w)) + Math.abs(curRect.y - r.y);
    } else if (direction === 'right' && r.x >= curRect.x + curRect.w - 10) {
      valid = true;
      dist = Math.abs(r.x - (curRect.x + curRect.w)) + Math.abs(curRect.y - r.y);
    } else if (direction === 'up' && r.y + r.h <= curRect.y + 10) {
      valid = true;
      dist = Math.abs(curRect.y - (r.y + r.h)) + Math.abs(curRect.x - r.x);
    } else if (direction === 'down' && r.y >= curRect.y + curRect.h - 10) {
      valid = true;
      dist = Math.abs(r.y - (curRect.y + curRect.h)) + Math.abs(curRect.x - r.x);
    }

    if (valid && dist < minDistance) {
      minDistance = dist;
      bestCandidate = w;
    }
  });

  if (bestCandidate) {
    focusWindow(bestCandidate.id);
  } else {
    cycleFocus(direction === 'right' || direction === 'down' ? 1 : -1);
  }
}

function moveFocusedWindowToWorkspace(targetWsId) {
  if (targetWsId < 1 || targetWsId > 9 || targetWsId === currentWorkspace) return;
  const srcWs = workspaces[currentWorkspace];
  const winId = srcWs.focusedId;
  if (!winId) return;

  const win = srcWs.windows.find(w => w.id === winId);
  if (!win) return;

  // Remove from source
  srcWs.windows = srcWs.windows.filter(w => w.id !== winId);
  srcWs.tree.removeWindow(winId);
  srcWs.focusedId = srcWs.windows.length > 0 ? srcWs.windows[srcWs.windows.length - 1].id : null;

  // Add to target
  const tgtWs = workspaces[targetWsId];
  win.wsId = targetWsId;
  win.el.setAttribute('data-ws', targetWsId);
  tgtWs.windows.push(win);
  if (!win.isFloating) {
    tgtWs.tree.addWindow(win);
  }
  tgtWs.focusedId = winId;

  renderWorkspace(currentWorkspace);
  renderWorkspace(targetWsId);
  updateWorkspaceIndicators();
  showToast(`Moved window to Workspace ${targetWsId}`);
}

// ============================================================
// 3. Workspace Layout Rendering & Geometry Calculation
// ============================================================

function renderWorkspace(wsId) {
  const ws = workspaces[wsId];
  if (!ws) return;

  const isCurrent = (wsId === currentWorkspace);
  const desktop = document.getElementById('hypr-desktop');
  const watermark = document.getElementById('empty-desktop-watermark');

  if (isCurrent) {
    if (ws.windows.length === 0) {
      if (watermark) watermark.classList.remove('hidden');
    } else {
      if (watermark) watermark.classList.add('hidden');
    }
  }

  // Toggle DOM visibility
  ws.windows.forEach(w => {
    if (isCurrent) {
      w.el.style.display = 'flex';
    } else {
      w.el.style.display = 'none';
    }
  });

  if (!isCurrent || !desktop) return;

  const bounds = {
    x: 0,
    y: 0,
    w: desktop.clientWidth,
    h: desktop.clientHeight
  };

  // Hyprland Dwindle layout calculation: gapsIn = 5, gapsOut = 10
  const layout = ws.tree.calculateLayout(bounds, 5, 10);
  layout.forEach(item => {
    const w = item.window;
    if (w && w.el && !w.isFloating && !w.isFullscreen) {
      w.el.style.left = `${item.x}px`;
      w.el.style.top = `${item.y}px`;
      w.el.style.width = `${item.w}px`;
      w.el.style.height = `${item.h}px`;
    }
  });
}

function updateWorkspaceIndicators() {
  for (let id = 1; id <= 9; id++) {
    const ws = workspaces[id];
    const el = document.querySelector(`.ws-item[data-ws="${id}"]`);
    if (el) {
      if (ws && ws.windows.length > 0) {
        el.classList.add('has-windows');
      } else {
        el.classList.remove('has-windows');
      }
    }
  }
}

// ============================================================
// 4. Workspace Switcher (1..9)
// ============================================================

function initWorkspacesUI() {
  const wsItems = document.querySelectorAll('.ws-item');
  wsItems.forEach(item => {
    item.addEventListener('click', () => {
      const wsId = parseInt(item.getAttribute('data-ws'), 10);
      switchWorkspace(wsId);
    });
  });
}

function switchWorkspace(id) {
  if (id < 1 || id > 9) return;
  const oldWs = currentWorkspace;
  currentWorkspace = id;

  document.querySelectorAll('.ws-item').forEach(item => {
    const itemWs = parseInt(item.getAttribute('data-ws'), 10);
    if (itemWs === id) {
      item.classList.add('active');
    } else {
      item.classList.remove('active');
    }
  });

  // Re-render old and new workspaces
  renderWorkspace(oldWs);
  renderWorkspace(currentWorkspace);

  const ws = workspaces[currentWorkspace];
  if (ws && ws.focusedId) {
    focusWindow(ws.focusedId);
  } else {
    const activeLabel = document.getElementById('current-window-title');
    if (activeLabel) {
      activeLabel.textContent = `desktop ~ workspace ${id} (empty)`;
    }
  }

  showToast(`Switched to Workspace ${id}`);
}

function nextWorkspace() {
  const next = currentWorkspace >= 9 ? 1 : currentWorkspace + 1;
  switchWorkspace(next);
}

function prevWorkspace() {
  const prev = currentWorkspace <= 1 ? 9 : currentWorkspace - 1;
  switchWorkspace(prev);
}

// ============================================================
// 5. Live Clock Engine (omarchy.clock)
// ============================================================

function initClock() {
  const clockEl = document.getElementById('clock-time');
  const dateEl = document.getElementById('clock-date');

  function update() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    if (clockEl) clockEl.textContent = `${hours}:${minutes}:${seconds}`;

    if (dateEl) {
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      dateEl.textContent = `${days[now.getDay()]} ${months[now.getMonth()]} ${now.getDate()}`;
    }
  }

  update();
  setInterval(update, 1000);
}

// ============================================================
// 6. Wallpapers & Theming
// ============================================================

const WALLPAPERS = [
  'assets/backgrounds/0-winding-road.webp',
  'assets/backgrounds/1-quattro.webp',
  'assets/backgrounds/4-omakub.webp',
  'assets/backgrounds/5-oma-cityscape.jpg',
  'assets/backgrounds/6-oma.webp'
];
let currentWallpaperIdx = 0;

function switchWallpaper() {
  currentWallpaperIdx = (currentWallpaperIdx + 1) % WALLPAPERS.length;
  const wp = WALLPAPERS[currentWallpaperIdx];
  document.body.style.backgroundImage = `url('${wp}')`;
  const name = wp.split('/').pop().replace(/\.[^/.]+$/, "");
  showToast(`🎨 Background: ${name}`);
}

function toggleTheme() {
  const root = document.documentElement;
  const currentAccent = getComputedStyle(root).getPropertyValue('--accent').trim();
  if (currentAccent === '#7aa2f7') {
    // Switch to Catppuccin Mocha
    root.style.setProperty('--accent', '#cba6f7');
    root.style.setProperty('--border-active', '#cba6f7');
    root.style.setProperty('--bg', '#1e1e2e');
    root.style.setProperty('--bg-dark', '#181825');
    showToast('🎨 Theme: Catppuccin Mocha');
  } else {
    // Back to Tokyo Night
    root.style.setProperty('--accent', '#7aa2f7');
    root.style.setProperty('--border-active', '#7aa2f7');
    root.style.setProperty('--bg', '#1a1b26');
    root.style.setProperty('--bg-dark', '#13141c');
    showToast('🎨 Theme: Tokyo Night (Omarchy Default)');
  }
}

function toggleTopBar() {
  const bar = document.getElementById('omarchy-bar');
  bar?.classList.toggle('hidden');
  document.body.classList.toggle('bar-hidden');
  const isHidden = bar?.classList.contains('hidden');
  renderWorkspace(currentWorkspace);
  showToast(isHidden ? 'Top Bar Hidden (SUPER + SHIFT + SPACE to restore)' : 'Top Bar Visible');
}

// ============================================================
// 7. Walker Application Launcher (SUPER + SPACE)
// ============================================================

const LAUNCHER_ITEMS = [
  { id: 'term', icon: '💻', label: 'Terminal (Alacritty / Zellij)', sub: 'Launch new terminal window (SUPER + RETURN)', category: 'Apps', action: () => spawnWindow(currentWorkspace, { type: 'terminal', title: 'alacritty ~ user@omarchy' }) },
  { id: 'nvim', icon: '📝', label: 'Neovim Editor', sub: 'Extensible modal text editor (Omarchy config)', category: 'Apps', action: () => spawnWindow(currentWorkspace, { type: 'editor', title: 'nvim ~ omarchy-config' }) },
  { id: 'btop', icon: '📊', label: 'Btop Monitor', sub: 'Resource monitor with CPU, Memory, Disks, Network', category: 'Apps', action: () => spawnWindow(currentWorkspace, { type: 'monitor', title: 'btop ~ system monitor' }) },
  { id: 'lazygit', icon: '🐙', label: 'Lazygit', sub: 'Simple terminal UI for git commands', category: 'Apps', action: () => spawnWindow(currentWorkspace, { type: 'git', title: 'lazygit ~ repo' }) },
  { id: 'fish', icon: '🐟', label: 'Fish Shell', sub: 'Smart, user-friendly interactive command line', category: 'Apps', action: () => spawnWindow(currentWorkspace, { type: 'shell', title: 'fish ~ user@omarchy' }) },

  { id: 'hermes', icon: '🤖', label: 'Hermes AI Agent', sub: 'Nous Research Autonomous Reasoning Agent', category: 'Agents', action: () => showToast('Hermes Agent active') },
  { id: 'claude', icon: '⚡', label: 'Claude Code CLI', sub: 'Anthropic agentic terminal companion', category: 'Agents', action: () => showToast('Claude Code companion active') },
  { id: 'chatgpt', icon: '💬', label: 'ChatGPT Web App', sub: 'OpenAI assistant web app (SUPER + SHIFT + A)', category: 'Agents', action: () => window.open('https://chatgpt.com', '_blank') },

  { id: 'ws-1', icon: '🪟', label: 'Switch to Workspace 1', sub: 'Main Workspace', category: 'Workspaces', action: () => switchWorkspace(1) },
  { id: 'ws-2', icon: '🪟', label: 'Switch to Workspace 2', sub: 'Dev & Coding', category: 'Workspaces', action: () => switchWorkspace(2) },
  { id: 'ws-3', icon: '🪟', label: 'Switch to Workspace 3', sub: 'AI Agents & Background', category: 'Workspaces', action: () => switchWorkspace(3) },

  { id: 'wp', icon: '🖼️', label: 'Cycle Wallpaper', sub: 'Change desktop background (SUPER + CTRL + SPACE)', category: 'Appearance', action: switchWallpaper },
  { id: 'theme', icon: '🎨', label: 'Toggle Tokyo Night / Catppuccin', sub: 'Switch visual palette (SUPER + SHIFT + CTRL + SPACE)', category: 'Appearance', action: toggleTheme },
  { id: 'desktop', icon: '🖥️', label: 'Show / Hide Desktop', sub: 'Toggle all windows to view clean desktop (SUPER + D)', category: 'System', action: toggleShowDesktop },
  { id: 'browser', icon: '🌐', label: 'Chromium Browser (Omarchy Welcome)', sub: 'Launch browser showcasing Omarchy intro & key features (SUPER + SHIFT + RETURN)', category: 'Apps', action: () => spawnWindow(currentWorkspace, { type: 'browser', title: 'chromium ~ Omarchy Online: Hyprland Workspace for VPS', url: 'browser-home.html' }) },
  { id: 'github', icon: '⭐', label: 'GitHub Repository (Source Code)', sub: 'View source code & documentation on GitHub', category: 'System', action: () => window.open('https://github.com/zhangcy122/omarchy-online', '_blank') },
  { id: 'keys', icon: '⌨️', label: 'Omarchy Keybindings Cheatsheet', sub: 'View all shortcut keys (SUPER + K)', category: 'System', action: () => window.toggleKeybindingsCheatsheet?.() },
  { id: 'fullscreen', icon: '⛶', label: 'Toggle Fullscreen Mode', sub: 'Lock browser keyboard for full immersion (SUPER + F)', category: 'System', action: () => toggleBrowserFullscreen() }
];

let selectedItemIndex = 0;
let filteredItems = [...LAUNCHER_ITEMS];

function initWalkerLauncher() {
  const modal = document.getElementById('walker-modal');
  const input = document.getElementById('walker-input');
  const logoBtn = document.getElementById('omarchy-menu-btn');
  const resultsContainer = document.getElementById('walker-results');

  function openWalker() {
    modal?.classList.add('open');
    if (input) {
      input.value = '';
      setTimeout(() => input.focus(), 50);
    }
    renderResults(LAUNCHER_ITEMS);
  }

  function closeWalker() {
    modal?.classList.remove('open');
  }

  window.toggleWalker = function() {
    if (modal?.classList.contains('open')) {
      closeWalker();
    } else {
      openWalker();
    }
  };

  logoBtn?.addEventListener('click', window.toggleWalker);

  modal?.addEventListener('click', (e) => {
    if (e.target === modal) closeWalker();
  });

  input?.addEventListener('input', (e) => {
    const q = e.target.value.toLowerCase().trim();
    filteredItems = LAUNCHER_ITEMS.filter(item =>
      item.label.toLowerCase().includes(q) ||
      item.sub.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q)
    );
    selectedItemIndex = 0;
    renderResults(filteredItems);
  });

  input?.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeWalker();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      selectedItemIndex = (selectedItemIndex + 1) % filteredItems.length;
      updateActiveItem();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      selectedItemIndex = (selectedItemIndex - 1 + filteredItems.length) % filteredItems.length;
      updateActiveItem();
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredItems[selectedItemIndex]) {
        executeItem(filteredItems[selectedItemIndex]);
        closeWalker();
      }
    }
  });

  function renderResults(items) {
    if (!resultsContainer) return;
    resultsContainer.innerHTML = '';
    if (items.length === 0) {
      resultsContainer.innerHTML = '<div style="padding: 24px; text-align: center; color: var(--fg-dark);">No matching commands or apps</div>';
      return;
    }

    let lastCategory = '';
    items.forEach((item, idx) => {
      if (item.category !== lastCategory) {
        const catEl = document.createElement('div');
        catEl.className = 'walker-category';
        catEl.textContent = item.category;
        resultsContainer.appendChild(catEl);
        lastCategory = item.category;
      }

      const itemEl = document.createElement('div');
      itemEl.className = `walker-item ${idx === selectedItemIndex ? 'active' : ''}`;
      itemEl.innerHTML = `
        <div class="walker-item-left">
          <div class="walker-icon">${item.icon}</div>
          <div>
            <div class="walker-label">${item.label}</div>
            <div class="walker-sub">${item.sub}</div>
          </div>
        </div>
        <div class="badge-key">↵ run</div>
      `;
      itemEl.addEventListener('click', () => {
        executeItem(item);
        closeWalker();
      });
      resultsContainer.appendChild(itemEl);
    });
  }

  function updateActiveItem() {
    const rendered = resultsContainer?.querySelectorAll('.walker-item');
    rendered?.forEach((el, idx) => {
      if (idx === selectedItemIndex) {
        el.classList.add('active');
        el.scrollIntoView({ block: 'nearest' });
      } else {
        el.classList.remove('active');
      }
    });
  }

  function executeItem(item) {
    if (item.action) {
      item.action();
    }
  }
}

// ============================================================
// 8. Keybindings Cheatsheet Modal (SUPER + K)
// ============================================================

function initKeybindingsCheatsheet() {
  const modal = document.getElementById('keybindings-modal');
  const btn = document.getElementById('cheatsheet-btn');
  const closeBtn = document.getElementById('close-cheatsheet-btn');

  window.toggleKeybindingsCheatsheet = function() {
    modal?.classList.toggle('open');
  };

  btn?.addEventListener('click', window.toggleKeybindingsCheatsheet);
  closeBtn?.addEventListener('click', () => modal?.classList.remove('open'));
  modal?.addEventListener('click', (e) => {
    if (e.target === modal) modal.classList.remove('open');
  });
}

// ============================================================
// 9. 1:1 Hyprland Global Keybindings Engine
// ============================================================

function initHyprlandKeybindings() {
  window.addEventListener('keydown', handleHyprlandKeydown);
}

function handleHyprlandKeydown(e) {
  // Check if SUPER (Meta) OR ALT (Option fallback) is pressed
  const isSuper = e.metaKey || e.altKey;

  // ALT + TAB: Cycle window focus within current workspace
  if (e.altKey && e.code === 'Tab') {
    e.preventDefault();
    cycleFocus(e.shiftKey ? -1 : 1);
    return;
  }

  if (!isSuper) return;

  // 1. SUPER + SPACE: Walker Launcher
  if (e.code === 'Space' && !e.shiftKey && !e.ctrlKey) {
    e.preventDefault();
    window.toggleWalker?.();
    return;
  }

  // 2. SUPER + K: Keybindings Cheatsheet
  if (e.code === 'KeyK' && !e.shiftKey && !e.ctrlKey) {
    e.preventDefault();
    window.toggleKeybindingsCheatsheet?.();
    return;
  }

  // 3. SUPER + SHIFT + SPACE: Toggle Top Bar
  if (e.code === 'Space' && e.shiftKey && !e.ctrlKey) {
    e.preventDefault();
    toggleTopBar();
    return;
  }

  // 4. SUPER + CTRL + SPACE: Cycle Wallpaper
  if (e.code === 'Space' && !e.shiftKey && e.ctrlKey) {
    e.preventDefault();
    switchWallpaper();
    return;
  }

  // 5. SUPER + SHIFT + CTRL + SPACE: Toggle Theme
  if (e.code === 'Space' && e.shiftKey && e.ctrlKey) {
    e.preventDefault();
    toggleTheme();
    return;
  }

  // 6. SUPER + F: Fullscreen focused window
  if (e.code === 'KeyF' && !e.shiftKey && !e.ctrlKey) {
    e.preventDefault();
    toggleWindowFullscreen();
    return;
  }

  // 7. SUPER + T: Toggle floating mode
  if (e.code === 'KeyT' && !e.shiftKey && !e.ctrlKey) {
    e.preventDefault();
    toggleFloating();
    return;
  }

  // 8. SUPER + J: Toggle Dwindle split direction (horizontal/vertical)
  if (e.code === 'KeyJ' && !e.shiftKey && !e.ctrlKey) {
    e.preventDefault();
    toggleSplitDirection();
    return;
  }

  // 9. SUPER + D: Toggle Show / Hide Desktop
  if (e.code === 'KeyD' && !e.shiftKey && !e.ctrlKey) {
    e.preventDefault();
    toggleShowDesktop();
    return;
  }

  // 10. SUPER + W / SUPER + Q / SUPER + C: Close focused window
  if ((e.code === 'KeyW' || e.code === 'KeyQ' || e.code === 'KeyC') && !e.shiftKey && !e.ctrlKey) {
    e.preventDefault();
    closeWindow(workspaces[currentWorkspace]?.focusedId);
    return;
  }

  // 11. SUPER + RETURN: Spawn terminal / SUPER + SHIFT + RETURN: Spawn browser
  if (e.code === 'Enter' && !e.ctrlKey) {
    e.preventDefault();
    if (e.shiftKey) {
      spawnWindow(currentWorkspace, {
        type: 'browser',
        title: 'chromium ~ Omarchy Online: Hyprland Workspace for VPS',
        url: 'browser-home.html'
      });
    } else {
      spawnWindow(currentWorkspace);
    }
    return;
  }

  // 11. SUPER + Arrow Keys: Focus window by direction
  if (e.code === 'ArrowLeft' && !e.shiftKey) {
    e.preventDefault();
    focusAdjacentWindow('left');
    return;
  }
  if (e.code === 'ArrowRight' && !e.shiftKey) {
    e.preventDefault();
    focusAdjacentWindow('right');
    return;
  }
  if (e.code === 'ArrowUp' && !e.shiftKey) {
    e.preventDefault();
    focusAdjacentWindow('up');
    return;
  }
  if (e.code === 'ArrowDown' && !e.shiftKey) {
    e.preventDefault();
    focusAdjacentWindow('down');
    return;
  }

  // 12. SUPER + 1..9: Switch workspace / SUPER + SHIFT + 1..9: Move window
  if (e.code.startsWith('Digit') && !e.ctrlKey) {
    const num = parseInt(e.code.replace('Digit', ''), 10);
    if (num >= 1 && num <= 9) {
      e.preventDefault();
      if (e.shiftKey) {
        moveFocusedWindowToWorkspace(num);
      } else {
        switchWorkspace(num);
      }
      return;
    }
  }

  // 13. SUPER + TAB: Next workspace / SUPER + SHIFT + TAB: Prev workspace
  if (e.code === 'Tab') {
    e.preventDefault();
    if (e.shiftKey) {
      prevWorkspace();
    } else {
      nextWorkspace();
    }
    return;
  }

  // 14. SUPER + SHIFT + A: ChatGPT / AI
  if (e.code === 'KeyA' && e.shiftKey) {
    e.preventDefault();
    window.open('https://chatgpt.com', '_blank');
    showToast('Opening ChatGPT web app...');
    return;
  }

  // 15. SUPER + SHIFT + N: Neovim
  if (e.code === 'KeyN' && e.shiftKey) {
    e.preventDefault();
    spawnWindow(currentWorkspace, { type: 'editor', title: 'nvim ~ omarchy-config' });
    return;
  }
}

// ============================================================
// 10. System Controls & Notifications
// ============================================================

function initControls() {
  const fsBtn = document.getElementById('fullscreen-btn');
  fsBtn?.addEventListener('click', toggleBrowserFullscreen);

  const desktopBtn = document.getElementById('show-desktop-btn');
  desktopBtn?.addEventListener('click', toggleShowDesktop);
}

async function toggleBrowserFullscreen() {
  if (!document.fullscreenElement) {
    try {
      await document.documentElement.requestFullscreen();
      if ('keyboard' in navigator && 'lock' in navigator.keyboard) {
        await navigator.keyboard.lock(['MetaLeft', 'MetaRight', 'AltLeft', 'AltRight', 'Tab', 'Escape']);
      }
      showToast('Fullscreen active. Native SUPER key unlocked!');
    } catch (err) {
      console.warn('Fullscreen/Keyboard lock notice:', err);
    }
  } else {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    }
  }
}

let toastTimer = null;
function showToast(msg) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.classList.remove('show');
  }, 2500);
}
