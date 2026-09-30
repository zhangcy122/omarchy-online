import asyncio
import os
import subprocess
import time
from playwright.async_api import async_playwright

async def verify_vps_terminal_direct():
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

        # Test 1: Direct Session URL avoids standalone session menu
        target_session = "omarchy-test-direct"
        target_url = f"https://127.0.0.1:8443/zellij/{target_session}"
        print(f"[1] Navigating directly to session path: {target_url}")
        await page.goto(target_url, wait_until="networkidle")
        await page.wait_for_timeout(2000)

        page_title = await page.title()
        print(f"[*] Page title: {page_title}")
        html_content = await page.content()

        # Assert no standalone session picker
        is_session_picker_showing = "HI FROM ZELLIJ" in html_content or "Hi from Zellij!" in html_content
        print(f"[*] Is standalone session picker showing? {is_session_picker_showing}")
        assert not is_session_picker_showing, "Standalone session picker menu MUST NOT appear when session path is specified!"

        # Test 2: Check active zellij session on server
        await page.wait_for_timeout(1000)
        sessions_res = subprocess.run(["zellij", "list-sessions"], capture_output=True, text=True)
        print(f"[*] Active zellij sessions:\n{sessions_res.stdout}")
        assert target_session in sessions_res.stdout, f"Session '{target_session}' should be active in Zellij!"

        # Test 3: Verify Starship prompt output
        starship_prompt = subprocess.run(
            ["bash", "-c", "source ~/.bashrc && starship prompt"],
            capture_output=True,
            text=True,
            env=dict(os.environ, TERM="xterm-256color")
        )
        print(f"[*] Starship prompt check: {repr(starship_prompt.stdout)}")
        assert "❯" in starship_prompt.stdout or "main" in starship_prompt.stdout, "Starship prompt must render Omarchy symbols!"

        # Save screenshot for audit
        os.makedirs("/tmp/omarchy_tests", exist_ok=True)
        screenshot_path = "/tmp/omarchy_tests/vps_direct_terminal.png"
        await page.screenshot(path=screenshot_path)
        print(f"[*] Screenshot saved: {screenshot_path}")

        print("==================================================")
        print("  SUCCESS: Direct session path & Omarchy terminal ")
        print("  styling verified! No session menu popup!       ")
        print("==================================================")
        await context.close()

if __name__ == "__main__":
    asyncio.run(verify_vps_terminal_direct())
