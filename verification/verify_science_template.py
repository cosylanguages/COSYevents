from playwright.sync_api import sync_playwright

def run_cuj(page):
    page.goto("http://localhost:8000/templates/science-session-template.html")
    page.wait_for_timeout(1000)

    # Click on Vocabulary slide tab (Tab 2)
    page.locator(".ce-slide-tab", has_text="Vocabulary").click()
    page.wait_for_timeout(800)

    # Click Next slide (Round 1)
    page.locator(".ce-next-btn").click()
    page.wait_for_timeout(800)

    # Click Next slide (Round 2)
    page.locator(".ce-next-btn").click()
    page.wait_for_timeout(800)

    page.screenshot(path="/home/jules/verification/screenshots/verification.png")
    page.wait_for_timeout(1000)

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            viewport={"width": 1280, "height": 800},
            record_video_dir="/home/jules/verification/videos"
        )
        page = context.new_page()
        try:
            run_cuj(page)
        finally:
            context.close()
            browser.close()
