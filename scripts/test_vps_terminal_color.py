import asyncio
import os
import subprocess
import time
from playwright.async_api import async_playwright

async def verify_vps_terminal_color():
    async with async_playwright() as p:
        print("[*] Connecting to Chrome via CDP (http://127.0.0.1:9222) ...")
        browser = await p.chromium.connect_over_cdp("http://127.0.0.1:9222")
        context = await browser.new_context(ignore_https_errors=True, viewport={"width": 1280, "height": 800})
        await context.add_cookies([{
            "name": "session_token",
            "value": "f722676f-b495-4d8a-a159-b6c50c32c615",
            "domain": "127.0.0.1",
            "path": "/"
        }])
        page = await context.new_page()

        target_session = "omarchy-test-color"
        target_url = f"https://127.0.0.1:8443/zellij/{target_session}"
        print(f"[1] Navigating to session path: {target_url}")
        await page.goto(target_url, wait_until="networkidle")
        await page.wait_for_timeout(2500)

        # Inspect DOM background styles
        color_info = await page.evaluate("""() => {
            const body = document.querySelector('body');
            const term = document.getElementById('terminal');
            return {
                bodyBg: body ? window.getComputedStyle(body).backgroundColor : null,
                termBg: term ? window.getComputedStyle(term).backgroundColor : null,
            };
        }""")
        print(f"[*] Computed background colors: {color_info}")

        # Assert Tokyo Night dark background (#1a1b26 -> rgb(26, 27, 38))
        # It must NOT be the washed-out gray slate (rgb(56, 62, 90))
        assert color_info["bodyBg"] != "rgb(56, 62, 90)", "Body background MUST NOT be washed out slate gray rgb(56, 62, 90)!"
        assert color_info["bodyBg"] in ["rgb(26, 27, 38)", "rgb(22, 22, 30)", "rgb(0, 0, 0)"], f"Unexpected body background: {color_info['bodyBg']}"

        # Capture audit screenshot
        os.makedirs("/tmp/omarchy_tests", exist_ok=True)
        screenshot_path = "/tmp/omarchy_tests/vps_terminal_tokyo_night_color.png"
        await page.screenshot(path=screenshot_path)
        print(f"[*] Verified Tokyo Night palette screenshot saved to: {screenshot_path}")

        print("==================================================")
        print("  SUCCESS: Tokyo Night terminal background color  ")
        print("  verified! Washed-out slate gray eliminated!     ")
        print("==================================================")
        await context.close()

if __name__ == "__main__":
    asyncio.run(verify_vps_terminal_color())
