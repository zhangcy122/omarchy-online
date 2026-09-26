/**
 * Omarchy Online - Desktop Shell & Hyprland Keybindings Engine
 * 1:1 Parity with Omarchy default/hypr/bindings/*.lua
 */

document.addEventListener('DOMContentLoaded', () => {
  initClock();
  initWorkspaces();
  initWalkerLauncher();
  initKeybindingsCheatsheet();
  initHyprlandKeybindings();
  initControls();
});

/* ============================================================
   1. Live Clock Engine (omarchy.clock)
   ============================================================ */
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

/* ============================================================
   2. Workspace Management (omarchy.workspaces)
   ============================================================ */
let currentWorkspace = 1;

function initWorkspaces() {
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
  currentWorkspace = id;
  document.querySelectorAll('.ws-item').forEach(item => {
    const itemWs = parseInt(item.getAttribute('data-ws'), 10);
    if (itemWs === id) {
      item.classList.add('active');
    } else {
      item.classList.remove('active');
    }
  });

  const activeLabel = document.getElementById('current-window-title');
  if (activeLabel) {
    activeLabel.textContent = `alacritty ~ user@omarchy:~ [workspace ${id}]`;
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

/* ============================================================
   3. Wallpapers & Theming (SUPER + CTRL + SPACE / SUPER + SHIFT + CTRL + SPACE)
   ============================================================ */
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
  bar.classList.toggle('hidden');
  document.body.classList.toggle('bar-hidden');
  const isHidden = bar.classList.contains('hidden');
  showToast(isHidden ? 'Top Bar Hidden (SUPER + SHIFT + SPACE to restore)' : 'Top Bar Visible');
}

/* ============================================================
   4. Walker Launcher (SUPER + SPACE)
   ============================================================ */
const LAUNCHER_ITEMS = [
  { id: 'nvim', icon: '📝', label: 'Neovim Editor', sub: 'Extensible modal text editor (Omarchy config)', category: 'Apps', action: () => showToast('Opening Neovim...') },
  { id: 'btop', icon: '📊', label: 'Btop Monitor', sub: 'Resource monitor with CPU, Memory, Disks, Network', category: 'Apps', action: () => showToast('Running Btop...') },
  { id: 'lazygit', icon: '🐙', label: 'Lazygit', sub: 'Simple terminal UI for git commands', category: 'Apps', action: () => showToast('Running Lazygit...') },
  { id: 'fish', icon: '🐟', label: 'Fish Shell', sub: 'Smart, user-friendly interactive command line', category: 'Apps', action: () => showToast('Starting Fish Shell...') },
  
  { id: 'hermes', icon: '🤖', label: 'Hermes AI Agent', sub: 'Nous Research Autonomous Reasoning Agent', category: 'Agents', action: () => showToast('Hermes Agent active') },
  { id: 'claude', icon: '⚡', label: 'Claude Code CLI', sub: 'Anthropic agentic terminal companion', category: 'Agents', action: () => showToast('Claude Code companion active') },
  { id: 'chatgpt', icon: '💬', label: 'ChatGPT Web App', sub: 'OpenAI assistant web app (SUPER + SHIFT + A)', category: 'Agents', action: () => window.open('https://chatgpt.com', '_blank') },

  { id: 'ws-1', icon: '🪟', label: 'Switch to Workspace 1', sub: 'Terminal Main', category: 'Workspaces', action: () => switchWorkspace(1) },
  { id: 'ws-2', icon: '🪟', label: 'Switch to Workspace 2', sub: 'Dev & Coding', category: 'Workspaces', action: () => switchWorkspace(2) },
  { id: 'ws-3', icon: '🪟', label: 'Switch to Workspace 3', sub: 'AI Agents & Background', category: 'Workspaces', action: () => switchWorkspace(3) },
  
  { id: 'wp', icon: '🖼️', label: 'Cycle Wallpaper', sub: 'Change desktop background (SUPER + CTRL + SPACE)', category: 'Appearance', action: switchWallpaper },
  { id: 'theme', icon: '🎨', label: 'Toggle Tokyo Night / Catppuccin', sub: 'Switch visual palette (SUPER + SHIFT + CTRL + SPACE)', category: 'Appearance', action: toggleTheme },
  { id: 'keys', icon: '⌨️', label: 'Omarchy Keybindings Cheatsheet', sub: 'View all shortcut keys (SUPER + K)', category: 'System', action: toggleKeybindingsCheatsheet },
  { id: 'fullscreen', icon: '⛶', label: 'Toggle Fullscreen Mode', sub: 'Lock browser keyboard for full immersion (SUPER + F)', category: 'System', action: toggleFullscreen }
];

let selectedItemIndex = 0;
let filteredItems = [...LAUNCHER_ITEMS];

function initWalkerLauncher() {
  const modal = document.getElementById('walker-modal');
  const input = document.getElementById('walker-input');
  const logoBtn = document.getElementById('omarchy-menu-btn');
  const resultsContainer = document.getElementById('walker-results');

  function openWalker() {
    modal.classList.add('open');
    input.value = '';
    renderResults(LAUNCHER_ITEMS);
    setTimeout(() => input.focus(), 50);
  }

  function closeWalker() {
    modal.classList.remove('open');
  }

  window.toggleWalker = function() {
    if (modal.classList.contains('open')) {
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
    const rendered = resultsContainer.querySelectorAll('.walker-item');
    rendered.forEach((el, idx) => {
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

/* ============================================================
   5. Keybindings Cheatsheet Modal (SUPER + K)
   ============================================================ */
function initKeybindingsCheatsheet() {
  const modal = document.getElementById('keybindings-modal');
  const btn = document.getElementById('cheatsheet-btn');
  const closeBtn = document.getElementById('close-cheatsheet-btn');

  window.toggleKeybindingsCheatsheet = function() {
    modal.classList.toggle('open');
  };

  btn?.addEventListener('click', window.toggleKeybindingsCheatsheet);
  closeBtn?.addEventListener('click', () => modal.classList.remove('open'));
  modal?.addEventListener('click', (e) => {
    if (e.target === modal) modal.classList.remove('open');
  });
}

/* ============================================================
   6. 1:1 Hyprland Global Keybindings Engine
   ============================================================ */
function initHyprlandKeybindings() {
  window.addEventListener('keydown', (e) => {
    // Check if SUPER (Meta) OR ALT (Option fallback) is pressed
    const isSuper = e.metaKey || e.altKey;
    if (!isSuper) return;

    // 1. SUPER + SPACE: Walker Launcher
    if (e.code === 'Space' && !e.shiftKey && !e.ctrlKey) {
      e.preventDefault();
      window.toggleWalker();
      return;
    }

    // 2. SUPER + K: Keybindings Cheatsheet
    if (e.code === 'KeyK' && !e.shiftKey && !e.ctrlKey) {
      e.preventDefault();
      window.toggleKeybindingsCheatsheet();
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

    // 6. SUPER + F: Fullscreen
    if (e.code === 'KeyF' && !e.shiftKey && !e.ctrlKey) {
      e.preventDefault();
      toggleFullscreen();
      return;
    }

    // 7. SUPER + W or SUPER + Q: Close window / reload frame
    if ((e.code === 'KeyW' || e.code === 'KeyQ') && !e.shiftKey && !e.ctrlKey) {
      e.preventDefault();
      reloadTerminalFrame();
      return;
    }

    // 8. SUPER + 1..9: Workspaces
    if (e.code.startsWith('Digit') && !e.shiftKey && !e.ctrlKey) {
      const num = parseInt(e.code.replace('Digit', ''), 10);
      if (num >= 1 && num <= 9) {
        e.preventDefault();
        switchWorkspace(num);
        return;
      }
    }

    // 9. SUPER + TAB: Next workspace / SUPER + SHIFT + TAB: Prev workspace
    if (e.code === 'Tab') {
      e.preventDefault();
      if (e.shiftKey) {
        prevWorkspace();
      } else {
        nextWorkspace();
      }
      return;
    }

    // 10. SUPER + RETURN: Terminal
    if (e.code === 'Enter' && !e.shiftKey && !e.ctrlKey) {
      e.preventDefault();
      focusTerminal();
      return;
    }

    // 11. SUPER + SHIFT + A: ChatGPT / AI
    if (e.code === 'KeyA' && e.shiftKey) {
      e.preventDefault();
      window.open('https://chatgpt.com', '_blank');
      showToast('Opening ChatGPT web app...');
      return;
    }

    // 12. SUPER + SHIFT + N: Neovim
    if (e.code === 'KeyN' && e.shiftKey) {
      e.preventDefault();
      showToast('Neovim editor session active');
      return;
    }
  });
}

function focusTerminal() {
  const iframe = document.getElementById('terminal-frame');
  iframe?.focus();
  showToast('Terminal focused (SUPER + RETURN)');
}

function reloadTerminalFrame() {
  const iframe = document.getElementById('terminal-frame');
  if (iframe) {
    iframe.src = iframe.src;
    showToast('Window refreshed (SUPER + W / Q)');
  }
}

/* ============================================================
   7. System Helpers & Controls
   ============================================================ */
function initControls() {
  const fsBtn = document.getElementById('fullscreen-btn');
  fsBtn?.addEventListener('click', toggleFullscreen);

  const winMinBtn = document.getElementById('win-min-btn');
  winMinBtn?.addEventListener('click', () => {
    document.body.classList.toggle('maximized-mode');
    showToast('Toggled Window Layout (SUPER + T)');
  });

  const winMaxBtn = document.getElementById('win-max-btn');
  winMaxBtn?.addEventListener('click', toggleFullscreen);

  const winCloseBtn = document.getElementById('win-close-btn');
  winCloseBtn?.addEventListener('click', reloadTerminalFrame);
}

async function toggleFullscreen() {
  const win = document.getElementById('hypr-window');
  if (!document.fullscreenElement) {
    try {
      await document.documentElement.requestFullscreen();
      if ('keyboard' in navigator && 'lock' in navigator.keyboard) {
        await navigator.keyboard.lock(['MetaLeft', 'MetaRight', 'AltLeft', 'AltRight', 'Tab', 'Escape']);
      }
      win?.classList.add('maximized');
      document.body.classList.add('maximized-mode');
      showToast('Fullscreen active. Native SUPER key unlocked!');
    } catch (err) {
      console.warn('Fullscreen/Keyboard lock notice:', err);
    }
  } else {
    if (document.exitFullscreen) {
      document.exitFullscreen();
      win?.classList.remove('maximized');
      document.body.classList.remove('maximized-mode');
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
