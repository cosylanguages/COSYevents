from playwright.sync_api import sync_playwright
import os

def run_cuj(page):
    cwd = os.getcwd()
    page.goto(f"file://{cwd}/speaking-clubs.html")
    page.wait_for_timeout(1000)

    # Scroll to basic club card and click
    page.locator(".club-card-basic").scroll_into_view_if_needed()
    page.wait_for_timeout(500)

    # Click link to basic speaking club catalog
    page.locator(".club-card-basic .club-link").click()
    page.wait_for_timeout(1000)

    # On basic-speaking-club.html, open session 1
    page.locator("a[href='sessions/basic-speaking-club/session-1-introductions-and-first-impressions.html']").first.click()
    page.wait_for_timeout(1000)

    # Take screenshot of session 1
    page.screenshot(path="/home/jules/verification/screenshots/verification.png")
    page.wait_for_timeout(1000)

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            record_video_dir="/home/jules/verification/videos"
        )
        page = context.new_page()
        try:
            run_cuj(page)
        finally:
            context.close()
            browser.close()
