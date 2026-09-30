import asyncio
import os
import subprocess
import time
from playwright.async_api import async_playwright

TEST_PORT = 8899
WORKTREE_WEB = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "web"))

async def run_layout_restore_test():
    # 1. Start ephemeral HTTP server in worktree web directory
    print(f"[*] Starting local test server at http://127.0.0.1:{TEST_PORT} from {WORKTREE_WEB}")
    server_proc = subprocess.Popen(
        ["python3", "-m", "http.server", str(TEST_PORT), "--bind", "127.0.0.1"],
        cwd=WORKTREE_WEB,
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL
    )
    time.sleep(1)

    try:
        async with async_playwright() as p:
            print("[*] Connecting to Chrome CDP at http://127.0.0.1:9222 ...")
            try:
                browser = await p.chromium.connect_over_cdp("http://127.0.0.1:9222")
            except Exception as e:
                print(f"[!] CDP connect failed ({e}), launching headless Chromium ...")
                browser = await p.chromium.launch(headless=True)

            context = await browser.new_context(viewport={"width": 1280, "height": 800})
            page = await context.new_page()

            # Ensure fresh state
            print("[1] Navigating to test page and clearing localStorage ...")
            await page.goto(f"http://127.0.0.1:{TEST_PORT}/index.html", wait_until="networkidle")
            await page.evaluate("() => localStorage.clear()")
            await page.reload(wait_until="networkidle")
            await page.wait_for_timeout(500)

            # Check initial state: 1 default window (browser)
            windows_ws1 = await page.query_selector_all(".hypr-window")
            print(f"[2] Initial windows count on Workspace 1: {len(windows_ws1)}")
            assert len(windows_ws1) == 1, f"Expected 1 initial window, got {len(windows_ws1)}"

            # Spawn 2nd window via Meta+Enter
            print("[3] Spawning 2nd window (terminal) via Meta+Enter ...")
            await page.keyboard.press("Meta+Enter")
            await page.wait_for_timeout(500)

            windows_ws1 = await page.query_selector_all(".hypr-window")
            print(f"[*] Windows count on WS1 after split: {len(windows_ws1)}")
            assert len(windows_ws1) == 2, f"Expected 2 windows on WS1, got {len(windows_ws1)}"

            # Verify session in terminal iframe
            iframe_src = await page.evaluate("() => document.querySelector('#win-2 iframe')?.getAttribute('src')")
            print(f"[*] win-2 iframe src: {iframe_src}")
            assert "omarchy-ws1-win-2" in (iframe_src or ""), f"Session not in iframe URL: {iframe_src}"

            # Capture initial positions
            win1_box = await page.evaluate("() => { const el = document.getElementById('win-1'); return { left: el.style.left, top: el.style.top, width: el.style.width, height: el.style.height }; }")
            win2_box = await page.evaluate("() => { const el = document.getElementById('win-2'); return { left: el.style.left, top: el.style.top, width: el.style.width, height: el.style.height }; }")
            print(f"[*] Before swap: win-1={win1_box['left']}, win-2={win2_box['left']}")

            # Swap windows using Meta+Shift+ArrowLeft
            print("[4] Swapping windows via Meta+Shift+ArrowLeft ...")
            await page.keyboard.press("Meta+Shift+ArrowLeft")
            await page.wait_for_timeout(500)

            swapped_win1_box = await page.evaluate("() => { const el = document.getElementById('win-1'); return { left: el.style.left, top: el.style.top }; }")
            swapped_win2_box = await page.evaluate("() => { const el = document.getElementById('win-2'); return { left: el.style.left, top: el.style.top }; }")
            print(f"[*] After swap: win-1={swapped_win1_box['left']}, win-2={swapped_win2_box['left']}")
            assert swapped_win1_box["left"] != win1_box["left"] or swapped_win2_box["left"] != win2_box["left"], "Windows did not swap positions!"

            # Switch to Workspace 2 and spawn a window
            print("[5] Switching to Workspace 2 via Meta+Digit2 ...")
            await page.keyboard.press("Meta+Digit2")
            await page.wait_for_timeout(300)

            print("[*] Spawning a terminal window on Workspace 2 ...")
            await page.keyboard.press("Meta+Enter")
            await page.wait_for_timeout(500)

            ws2_windows = await page.query_selector_all(".hypr-window[data-ws='2']")
            print(f"[*] Windows count on WS2: {len(ws2_windows)}")
            assert len(ws2_windows) == 1, f"Expected 1 window on WS2, got {len(ws2_windows)}"

            # 6. Verify layout persistence across page reload
            print("[6] Reloading page to test automatic layout restoration ...")
            await page.reload(wait_until="networkidle")
            await page.wait_for_timeout(800)

            # Check that we restored to Workspace 2 with its window
            active_ws = await page.evaluate("() => currentWorkspace")
            print(f"[*] Restored active workspace: {active_ws}")
            assert active_ws == 2, f"Expected active workspace to be 2, got {active_ws}"

            restored_ws2_windows = await page.query_selector_all(".hypr-window[data-ws='2']")
            print(f"[*] Restored windows on WS2: {len(restored_ws2_windows)}")
            assert len(restored_ws2_windows) == 1, f"Expected 1 window on WS2 after restore, got {len(restored_ws2_windows)}"

            # Switch back to Workspace 1 and verify both windows and their swapped topology are preserved
            print("[7] Switching back to Workspace 1 ...")
            await page.keyboard.press("Meta+Digit1")
            await page.wait_for_timeout(500)

            restored_ws1_windows = await page.query_selector_all(".hypr-window[data-ws='1']")
            print(f"[*] Restored windows on WS1: {len(restored_ws1_windows)}")
            assert len(restored_ws1_windows) == 2, f"Expected 2 windows on WS1 after restore, got {len(restored_ws1_windows)}"

            restored_win1_box = await page.evaluate("() => { const el = document.getElementById('win-1'); return { left: el.style.left, top: el.style.top }; }")
            restored_win2_box = await page.evaluate("() => { const el = document.getElementById('win-2'); return { left: el.style.left, top: el.style.top }; }")
            print(f"[*] Restored positions: win-1={restored_win1_box['left']}, win-2={restored_win2_box['left']}")
            assert restored_win1_box["left"] == swapped_win1_box["left"], "win-1 position not restored!"
            assert restored_win2_box["left"] == swapped_win2_box["left"], "win-2 position not restored!"

            # 8. Test layout reset via resetDesktopLayout()
            print("[8] Testing resetDesktopLayout() ...")
            await page.evaluate("() => resetDesktopLayout()")
            await page.wait_for_timeout(1000)

            reset_windows = await page.query_selector_all(".hypr-window")
            print(f"[*] Windows count after reset: {len(reset_windows)}")
            assert len(reset_windows) == 1, f"Expected 1 window after reset, got {len(reset_windows)}"

            # Also verify localStorage contains the fresh 1-window state
            fresh_state_str = await page.evaluate("() => localStorage.getItem('omarchy_desktop_state')")
            assert fresh_state_str is not None, "Fresh state should be initialized"
            import json
            fresh_state = json.loads(fresh_state_str)
            assert len(fresh_state["workspaces"]["1"]["windows"]) == 1, "Expected exactly 1 window in fresh state"
            assert fresh_state["currentWorkspace"] == 1, "Expected workspace 1 after reset"

            print("==================================================")
            print("  SUCCESS: Layout restoration, window swapping,  ")
            print("  and session management fully verified!         ")
            print("==================================================")

            await context.close()
    finally:
        server_proc.terminate()
        server_proc.wait()

if __name__ == "__main__":
    asyncio.run(run_layout_restore_test())
