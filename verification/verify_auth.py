import os
from playwright.sync_api import sync_playwright

def run_verification():
    os.makedirs('/home/jules/verification/videos', exist_ok=True)
    os.makedirs('/home/jules/verification/screenshots', exist_ok=True)

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            record_video_dir="/home/jules/verification/videos",
            viewport={"width": 1280, "height": 800}
        )
        page = context.new_page()

        # Direct file path
        index_url = f"file://{os.path.abspath('index.html')}"
        login_url = f"file://{os.path.abspath('login.html')}"
        account_url = f"file://{os.path.abspath('account.html')}"

        # 1. Visit index.html in disabled mode
        page.goto(index_url)
        page.wait_for_timeout(500)

        # 2. Visit login.html
        page.goto(login_url)
        page.wait_for_timeout(500)
        page.fill("#input-email", "student@example.com")
        page.wait_for_timeout(500)
        page.screenshot(path="/home/jules/verification/screenshots/login_verification.png")

        # 3. Visit account.html
        page.goto(account_url)
        page.wait_for_timeout(500)

        context.close()
        browser.close()

if __name__ == "__main__":
    run_verification()
