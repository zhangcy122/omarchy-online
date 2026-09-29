import asyncio
import os
from playwright.async_api import async_playwright

async def verify_clean_desktop():
    async with async_playwright() as p:
        browser = await p.chromium.connect_over_cdp("http://127.0.0.1:9222")
        context = await browser.new_context(ignore_https_errors=True)
        page = await context.new_page()

        print("[1] Navigating to https://127.0.0.1:8443/ ...")
        await page.goto("https://127.0.0.1:8443/", wait_until="networkidle")
        await page.wait_for_timeout(1000)

        # 1. Verify clean boot (0 windows, full wallpaper + watermark visible)
        windows = await page.query_selector_all(".hypr-window")
        print(f"Boot windows count on Workspace 1: {len(windows)}")
        assert len(windows) == 0, f"Expected 0 windows on clean boot, got {len(windows)}"

        watermark = await page.query_selector("#empty-desktop-watermark")
        assert watermark is not None, "Expected empty-desktop-watermark element"
        is_watermark_visible = await watermark.is_visible()
        print(f"Empty desktop watermark visible on boot: {is_watermark_visible}")
        assert is_watermark_visible, "Expected watermark visible on boot"

        os.makedirs("/tmp/omarchy_tests", exist_ok=True)
        await page.screenshot(path="/tmp/omarchy_tests/clean_boot_desktop.png")
        print("Saved screenshot /tmp/omarchy_tests/clean_boot_desktop.png")

        # 2. Spawn a window via clicking Topbar and pressing Meta+Enter
        print("[2] Spawning terminal window via Meta+Enter ...")
        await page.click("#omarchy-bar")
        await page.keyboard.press("Meta+Enter")
        await page.wait_for_timeout(600)

        windows = await page.query_selector_all(".hypr-window")
        print(f"Windows count after spawn: {len(windows)}")
        assert len(windows) == 1, f"Expected 1 window after spawn, got {len(windows)}"

        # 3. Test Show / Hide Desktop button in Topbar (#show-desktop-btn)
        print("[3] Clicking #show-desktop-btn to hide windows ...")
        await page.click("#show-desktop-btn")
        await page.wait_for_timeout(400)

        win_el = await page.query_selector(".hypr-window")
        win_display = await win_el.evaluate("el => el.style.display")
        print(f"Window display style after Show Desktop: {win_display}")
        assert win_display == "none", f"Expected window display 'none', got {win_display}"
        assert await watermark.is_visible(), "Expected watermark visible when desktop shown"

        # 4. Click #show-desktop-btn again to restore windows
        print("[4] Clicking #show-desktop-btn to restore windows ...")
        await page.click("#show-desktop-btn")
        await page.wait_for_timeout(400)

        win_display = await win_el.evaluate("el => el.style.display")
        print(f"Window display style after Restore: {win_display}")
        assert win_display == "flex", f"Expected window display 'flex', got {win_display}"

        # 5. Close window via clicking Red Dot 🔴
        print("[5] Closing window via clicking Red Dot close button ...")
        close_btn = await page.query_selector(".win-dot.close")
        assert close_btn is not None, "Expected close button"
        await close_btn.click()
        await page.wait_for_timeout(500)

        windows = await page.query_selector_all(".hypr-window")
        print(f"Windows count after closing: {len(windows)}")
        assert len(windows) == 0, f"Expected 0 windows after close, got {len(windows)}"
        assert await watermark.is_visible(), "Expected watermark visible after window closed"

        await page.close()
        print("✅ ALL TESTS PASSED: Clean Desktop & Show Desktop Toggle 100% Verified!")

if __name__ == "__main__":
    asyncio.run(verify_clean_desktop())
