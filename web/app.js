/**
 * Omarchy Online - Desktop Shell Interaction Engine
 */

document.addEventListener('DOMContentLoaded', () => {
  initClock();
  initWorkspaces();
  initWalkerLauncher();
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
    activeLabel.textContent = `workspace [${id}] ~ omarchy`;
  }
}

/* ============================================================
   3. Walker Application Launcher (Walker / omarchy.menu)
   ============================================================ */
const LAUNCHER_ITEMS = [
  { id: 'nvim', icon: '📝', label: 'Neovim Editor', sub: 'Extensible modal text editor (Omarchy config)', category: 'Apps' },
  { id: 'btop', icon: '📊', label: 'Btop Monitor', sub: 'Resource monitor with CPU, Memory, Disks, Network', category: 'Apps' },
  { id: 'lazygit', icon: '🐙', label: 'Lazygit', sub: 'Simple terminal UI for git commands', category: 'Apps' },
  { id: 'fish', icon: '🐟', label: 'Fish Shell', sub: 'Smart, user-friendly interactive command line', category: 'Apps' },
  
  { id: 'hermes', icon: '🤖', label: 'Hermes AI Agent', sub: 'Nous Research Autonomous Reasoning Agent', category: 'Agents' },
  { id: 'claude', icon: '⚡', label: 'Claude Code CLI', sub: 'Anthropic agentic terminal companion', category: 'Agents' },
  { id: 'opencode', icon: '💻', label: 'OpenCode Assistant', sub: 'Open-source autonomous developer agent', category: 'Agents' },

  { id: 'ws-1', icon: '🪟', label: 'Switch to Workspace 1', sub: 'Terminal Main', category: 'Workspaces', action: () => switchWorkspace(1) },
  { id: 'ws-2', icon: '🪟', label: 'Switch to Workspace 2', sub: 'Dev & Coding', category: 'Workspaces', action: () => switchWorkspace(2) },
  { id: 'ws-3', icon: '🪟', label: 'Switch to Workspace 3', sub: 'AI Agents & Background', category: 'Workspaces', action: () => switchWorkspace(3) },
  
  { id: 'theme', icon: '🎨', label: 'Toggle Tokyo Night / Catppuccin', sub: 'Switch visual palette', category: 'System', action: toggleTheme },
  { id: 'fullscreen', icon: '⛶', label: 'Toggle Fullscreen Mode', sub: 'Lock browser keyboard for full immersion', category: 'System', action: toggleFullscreen }
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

  logoBtn?.addEventListener('click', openWalker);

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

  // Global Shortcut: Super + Space / Alt + Space
  window.addEventListener('keydown', (e) => {
    if ((e.altKey && e.code === 'Space') || (e.metaKey && e.code === 'Space')) {
      e.preventDefault();
      if (modal.classList.contains('open')) {
        closeWalker();
      } else {
        openWalker();
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
    } else {
      // Send command notification to terminal
      console.log(`Executing Omarchy action: ${item.label}`);
    }
  }
}

/* ============================================================
   4. Controls & System Helpers
   ============================================================ */
function initControls() {
  const fsBtn = document.getElementById('fullscreen-btn');
  fsBtn?.addEventListener('click', toggleFullscreen);
}

async function toggleFullscreen() {
  if (!document.fullscreenElement) {
    try {
      await document.documentElement.requestFullscreen();
      if ('keyboard' in navigator && 'lock' in navigator.keyboard) {
        await navigator.keyboard.lock(['MetaLeft', 'MetaRight', 'AltLeft', 'Tab', 'Escape']);
      }
    } catch (err) {
      console.warn('Fullscreen/Keyboard lock notice:', err);
    }
  } else {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    }
  }
}

function toggleTheme() {
  const root = document.documentElement;
  const currentAccent = getComputedStyle(root).getPropertyValue('--accent').trim();
  if (currentAccent === '#7aa2f7') {
    // Switch to Catppuccin Mocha
    root.style.setProperty('--accent', '#cba6f7');
    root.style.setProperty('--bg', '#1e1e2e');
    root.style.setProperty('--bg-dark', '#181825');
  } else {
    // Back to Tokyo Night
    root.style.setProperty('--accent', '#7aa2f7');
    root.style.setProperty('--bg', '#1a1b26');
    root.style.setProperty('--bg-dark', '#13141c');
  }
}
