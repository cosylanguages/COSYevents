import os
from playwright.sync_api import sync_playwright

os.makedirs('/home/jules/verification/screenshots/i18n_theme', exist_ok=True)

with sync_playwright() as p:
    browser = p.chromium.launch()
    page = browser.new_page(viewport={'width': 1280, 'height': 800})

    # 1. English Home Light & Dark
    page.goto('file://' + os.path.abspath('index.html'))
    page.screenshot(path='/home/jules/verification/screenshots/i18n_theme/en_light.png')
    page.evaluate("document.documentElement.setAttribute('data-theme', 'dark')")
    page.screenshot(path='/home/jules/verification/screenshots/i18n_theme/en_dark.png')

    # 2. French Home Light & Dark
    page.goto('file://' + os.path.abspath('fr/index.html'))
    page.screenshot(path='/home/jules/verification/screenshots/i18n_theme/fr_light.png')
    page.evaluate("document.documentElement.setAttribute('data-theme', 'dark')")
    page.screenshot(path='/home/jules/verification/screenshots/i18n_theme/fr_dark.png')

    # 3. Russian Home Light & Dark
    page.goto('file://' + os.path.abspath('ru/index.html'))
    page.screenshot(path='/home/jules/verification/screenshots/i18n_theme/ru_light.png')
    page.evaluate("document.documentElement.setAttribute('data-theme', 'dark')")
    page.screenshot(path='/home/jules/verification/screenshots/i18n_theme/ru_dark.png')

    # 4. Italian Home Light
    page.goto('file://' + os.path.abspath('it/index.html'))
    page.screenshot(path='/home/jules/verification/screenshots/i18n_theme/it_light.png')

    # 5. Greek Home Light
    page.goto('file://' + os.path.abspath('el/index.html'))
    page.screenshot(path='/home/jules/verification/screenshots/i18n_theme/el_light.png')

    # 6. Browse Light & Dark
    page.goto('file://' + os.path.abspath('browse.html'))
    page.screenshot(path='/home/jules/verification/screenshots/i18n_theme/browse_light.png')
    page.evaluate("document.documentElement.setAttribute('data-theme', 'dark')")
    page.screenshot(path='/home/jules/verification/screenshots/i18n_theme/browse_dark.png')

    browser.close()

print("Screenshots captured successfully.")
