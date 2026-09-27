import os
import sys
import json
from playwright.sync_api import sync_playwright

REPRESENTATIVE_SESSIONS = {
    "the-greatest-quotes": [
        "ability-to-notice-beauty-quote",
        "alisa-freindlich-inner-child-intermediate",
        "feynman-study-hard-intermediate",
        "dostoevsky-loving-power-quote",
        "steve-jobs-quote"
    ],
    "debatable-relatable": [
        "4-day-work-week",
        "ai-and-art",
        "homework-ban",
        "money-vs-free-time-intermediate",
        "typing-vs-handwriting-intermediate"
    ],
    "lets-celebrate": [
        "cheap-flight-day",
        "diwali-festival",
        "lunar-new-year",
        "international-asteroid-day-intermediate",
        "national-simplicity-day"
    ],
    "my-life-with-without": [
        "airplane-life",
        "car-life",
        "fridge-life",
        "my-life-with-without-ai",
        "pets-life"
    ],
    "if-you-were": [
        "if-you-were-blind",
        "if-you-were-child-again",
        "if-you-were-deaf",
        "if-you-were-parent-to-yourself",
        "if-you-were-teacher"
    ]
}

def verify_structural_fidelity(club, session_slug):
    filepath = f"sessions/{club}/{session_slug}.html"
    if not os.path.exists(filepath):
        return False, f"File not found: {filepath}"

    with open(filepath, 'r', encoding='utf-8') as f:
        html = f.read()

    required_snippets = [
        "<!DOCTYPE html>",
        "<nav id=\"cosy-nav\"></nav>",
        "class=\"session-hero\"",
        "class=\"club-tag\"",
        "class=\"content-container\"",
        "class=\"cosy-breadcrumbs\"",
        "class=\"session-meta-grid\"",
        "id=\"vocabulary\"",
        "id=\"structure\"",
        "class=\"rounds-container\"",
        "id=\"s-warm\"",
        "id=\"s-r1\"",
        "id=\"s-lst\"",
        "id=\"s-r2\"",
        "id=\"s-mistakes\"",
        "<footer>",
        "shared/js/cosyevents-session.js"
    ]

    missing = [s for s in required_snippets if s not in html]
    if missing:
        return False, f"Missing structural elements in {session_slug}: {missing}"

    return True, "Structural DOM components present and verified."

def run_fidelity_checks():
    os.makedirs("verification/screenshots", exist_ok=True)
    report = {}

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        for club, sessions in REPRESENTATIVE_SESSIONS.items():
            report[club] = {
                "total_tested": len(sessions),
                "structural_pass": 0,
                "visual_pass": 0,
                "details": []
            }

            for session_slug in sessions:
                # 1. Structural Check
                s_ok, s_msg = verify_structural_fidelity(club, session_slug)

                # 2. Visual Check
                v_ok = False
                v_msg = ""
                screenshot_path = f"verification/screenshots/{club}_{session_slug}.png"
                file_url = f"file://{os.path.abspath(f'sessions/{club}/{session_slug}.html')}"

                try:
                    errors = []
                    page.on("pageerror", lambda err: errors.append(str(err)))
                    page.goto(file_url, wait_until="load")
                    page.wait_for_timeout(500)

                    # Take screenshot
                    page.screenshot(path=screenshot_path, full_page=True)

                    if not errors:
                        v_ok = True
                        v_msg = f"Rendered visually without errors. Screenshot saved to {screenshot_path}"
                    else:
                        v_msg = f"Page errors encountered: {errors}"
                except Exception as e:
                    v_msg = f"Visual rendering error: {str(e)}"

                if s_ok:
                    report[club]["structural_pass"] += 1
                if v_ok:
                    report[club]["visual_pass"] += 1

                report[club]["details"].append({
                    "session": session_slug,
                    "structural": {"pass": s_ok, "message": s_msg},
                    "visual": {"pass": v_ok, "message": v_msg, "screenshot": screenshot_path}
                })

        browser.close()

    with open("verification/fidelity_report.json", "w", encoding="utf-8") as f:
        json.dump(report, f, indent=2)

    print("Fidelity verification complete. Report written to verification/fidelity_report.json")

if __name__ == "__main__":
    run_fidelity_checks()
