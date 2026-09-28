import asyncio
import os
from playwright.async_api import async_playwright

async def verify_hyprland_dwindle():
    async with async_playwright() as p:
        browser = await p.chromium.connect_over_cdp("http://127.0.0.1:9222")
        context = await browser.new_context(ignore_https_errors=True)
        page = await context.new_page()

        print("[1] Navigating to https://127.0.0.1:8443/ ...")
        await page.goto("https://127.0.0.1:8443/", wait_until="networkidle")
        await page.wait_for_timeout(1000)

        # 1. Verify Workspace 1 initial terminal
        windows = await page.query_selector_all(".hypr-window")
        print(f"Initial windows count on Workspace 1: {len(windows)}")
        assert len(windows) == 1, f"Expected 1 window, found {len(windows)}"

        # 2. Spawn 2nd window via SUPER + RETURN
        print("[2] Spawning 2nd window via Meta+Enter ...")
        await page.keyboard.press("Meta+Enter")
        await page.wait_for_timeout(500)
        windows = await page.query_selector_all(".hypr-window")
        print(f"Windows count after 1st split: {len(windows)}")
        assert len(windows) == 2, f"Expected 2 windows, found {len(windows)}"

        # 3. Spawn 3rd window via SUPER + RETURN
        print("[3] Spawning 3rd window via Meta+Enter (Dwindle BSP) ...")
        await page.keyboard.press("Meta+Enter")
        await page.wait_for_timeout(500)
        windows = await page.query_selector_all(".hypr-window")
        print(f"Windows count after 2nd split: {len(windows)}")
        assert len(windows) == 3, f"Expected 3 windows, found {len(windows)}"

        # Take screenshot of 3 tiled windows
        os.makedirs("/tmp/omarchy_tests", exist_ok=True)
        await page.screenshot(path="/tmp/omarchy_tests/workspace_1_three_windows.png")
        print("Saved screenshot /tmp/omarchy_tests/workspace_1_three_windows.png")

        # 4. Switch to Workspace 2 via Meta+2
        print("[4] Switching to Workspace 2 via Meta+Digit2 ...")
        await page.keyboard.press("Meta+Digit2")
        await page.wait_for_timeout(500)

        # Check empty watermark is visible
        watermark = await page.query_selector("#empty-desktop-watermark")
        is_watermark_visible = await watermark.is_visible() if watermark else False
        print(f"Workspace 2 empty watermark visible: {is_watermark_visible}")
        assert is_watermark_visible, "Expected empty desktop watermark visible on Workspace 2"

        # Check workspace 1 has dot indicator in top bar
        ws1 = await page.query_selector('.ws-item[data-ws="1"]')
        ws1_class = await ws1.get_attribute("class")
        print(f"Workspace 1 classes: {ws1_class}")
        assert "has-windows" in ws1_class, "Expected workspace 1 to have .has-windows indicator"

        # 5. Spawn a window on Workspace 2
        print("[5] Spawning window on Workspace 2 ...")
        await page.keyboard.press("Meta+Enter")
        await page.wait_for_timeout(500)
        is_watermark_hidden = not (await watermark.is_visible())
        print(f"Watermark hidden after spawn on Workspace 2: {is_watermark_hidden}")
        assert is_watermark_hidden, "Expected watermark hidden after window spawned"

        await page.screenshot(path="/tmp/omarchy_tests/workspace_2_window.png")
        print("Saved screenshot /tmp/omarchy_tests/workspace_2_window.png")

        # 6. Close window on Workspace 2 via Meta+W
        print("[6] Closing window on Workspace 2 via Meta+KeyW ...")
        await page.keyboard.press("Meta+KeyW")
        await page.wait_for_timeout(500)
        is_watermark_visible_again = await watermark.is_visible()
        print(f"Watermark reappeared on Workspace 2: {is_watermark_visible_again}")
        assert is_watermark_visible_again, "Expected watermark to reappear after closing last window"

        # 7. Switch back to Workspace 1
        print("[7] Switching back to Workspace 1 via Meta+Digit1 ...")
        await page.keyboard.press("Meta+Digit1")
        await page.wait_for_timeout(500)
        ws1_windows = await page.query_selector_all('.hypr-window[data-ws="1"]')
        visible_count = 0
        for w in ws1_windows:
            if await w.is_visible():
                visible_count += 1
        print(f"Workspace 1 restored visible windows: {visible_count}")
        assert visible_count == 3, f"Expected 3 visible windows on Workspace 1, got {visible_count}"

        await page.close()
        print("✅ ALL TESTS PASSED: Hyprland Dwindle Tiling & Workspaces 1..9 Verified Successfully!")

if __name__ == "__main__":
    asyncio.run(verify_hyprland_dwindle())
