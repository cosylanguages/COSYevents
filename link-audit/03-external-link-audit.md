# COSYevents Outbound Ecosystem & Registration Link Audit

**Audit Date:** September 2025
**Target File:** `/link-audit/03-external-link-audit.md`

---

## 1. Executive Summary & Category Breakdown

Every file in the repository was scanned for references to sibling ecosystem domains and registration channels. A total of **7,303 link occurrences** across 68 unique URLs were identified and verified.

| Category | Unique URLs Found | Total Occurrences | Status Summary |
| :--- | :---: | :---: | :--- |
| **COSYlanguages** | 20 | 5,979 | Root, practice, privacy pages **OK (200)**. 12 sub-paths return **HTTP 404**. |
| **COSYplatform** | 4 | 6 | Root portal **OK (200)**. Lesson sub-paths return **HTTP 404**. |
| **COSYtools** | 1 | 8 | Landing page `https://cosylanguages.github.io/COSYtools/` **OK (200)**. |
| **COSYgames** | 1 | 9 | Landing page `https://cosylanguages.github.io/COSYgames/` **OK (200)**. |
| **COSYmanuals** | 1 (text token) | 4 | **No HTML hyperlinks exist.** (Text policy references in `README.md` & `manuals/MIGRATION_PLAN.md`). |
| **Telegram (`t.me`)** | 8 | 631 | All channel & bot registration pre-filled URLs return **OK (200)**. |
| **WhatsApp (`wa.me`)** | 31 | 658 | All pre-filled phone registration links return **Redirected (200)** to `api.whatsapp.com`. |

---

## 2. Detailed Verification Status Table of Unique Outbound URLs

Below is the verified status for every unique outbound URL found in the repository, along with sample source file locations.


| Destination URL | Category | HTTP Status | Status Flag | Sample Source Files |
| :--- | :--- | :---: | :---: | :--- |
| `https://cosylanguages.github.io/COSYlanguages/` | COSYlanguages | **200 OK** | **OK** | `index.html`, `browse.html`, `speaking-clubs.html` |
| `https://cosylanguages.github.io/COSYlanguages/index.html` | COSYlanguages | **200 OK** | **OK** | `sessions/mind-matters/limerence.html` |
| `https://cosylanguages.github.io/COSYlanguages/practice/index.html` | COSYlanguages | **200 OK** | **OK** | `browse.html`, `speaking-clubs.html`, `fr/index.html` |
| `https://cosylanguages.github.io/COSYlanguages/privacy.html` | COSYlanguages | **200 OK** | **OK** | `browse.html`, `speaking-clubs.html`, `ru/index.html` |
| `https://cosylanguages.github.io/COSYlanguages/images/icouldnthelpbutwonder.png` | COSYlanguages | **200 OK** | **OK** | `i-couldnt-help-but-wonder.html` |
| `https://cosylanguages.github.io/COSYlanguages/apps/premium-courses/exam/` | COSYlanguages | **404 Not Found** | **BROKEN** | `cinema-club.html`, `karaoke-club.html` |
| `https://cosylanguages.github.io/COSYlanguages/apps/premium-courses/exam/index.html` | COSYlanguages | **404 Not Found** | **BROKEN** | `browse.html` |
| `https://cosylanguages.github.io/COSYlanguages/apps/premium-courses/general/` | COSYlanguages | **404 Not Found** | **BROKEN** | `cinema-club.html`, `karaoke-club.html` |
| `https://cosylanguages.github.io/COSYlanguages/apps/premium-courses/general/index.html` | COSYlanguages | **404 Not Found** | **BROKEN** | `browse.html` |
| `https://cosylanguages.github.io/COSYlanguages/apps/premium-courses/professional/` | COSYlanguages | **404 Not Found** | **BROKEN** | `cinema-club.html`, `karaoke-club.html` |
| `https://cosylanguages.github.io/COSYlanguages/apps/premium-courses/relocation/` | COSYlanguages | **404 Not Found** | **BROKEN** | `cinema-club.html`, `karaoke-club.html` |
| `https://cosylanguages.github.io/COSYlanguages/apps/premium-courses/spoken/` | COSYlanguages | **404 Not Found** | **BROKEN** | `cinema-club.html`, `karaoke-club.html` |
| `https://cosylanguages.github.io/COSYlanguages/apps/premium-courses/spoken/index.html` | COSYlanguages | **404 Not Found** | **BROKEN** | `browse.html` |
| `https://cosylanguages.github.io/COSYlanguages/apps/premium-courses/travelling/` | COSYlanguages | **404 Not Found** | **BROKEN** | `cinema-club.html`, `karaoke-club.html` |
| `https://cosylanguages.github.io/COSYlanguages/events/index.html` | COSYlanguages | **404 Not Found** | **BROKEN** | `browse.html`, `fr/index.html`, `ru/index.html` |
| `https://cosylanguages.github.io/COSYlanguages/games/index.html` | COSYlanguages | **404 Not Found** | **BROKEN** | `browse.html`, `fr/index.html`, `ru/index.html` |
| `https://cosylanguages.github.io/COSYlanguages/karaoke-club.html` | COSYlanguages | **404 Not Found** | **BROKEN** | `fr/index.html`, `ru/index.html` |
| `https://cosylanguages.github.io/COSYlanguages/images/logos/speaking` | COSYlanguages | **404 Not Found** | **BROKEN** | `sessions/debatable-relatable/4-day-work-week.html` |
| `https://cosylanguages.github.io/COSYlanguages/shared/images/logo.png` | COSYlanguages | **404 Not Found** | **BROKEN** | `sessions/debatable-relatable/4-day-work-week.html` |
| `https://cosylanguages.github.io/COSYplatform/` | COSYplatform | **200 OK** | **OK** | `README.md`, `shared/calendar-data/events.json` |
| `https://cosylanguages.github.io/COSYplatform/lessons/` | COSYplatform | **404 Not Found** | **BROKEN** | `README.md` |
| `https://cosylanguages.github.io/COSYplatform/lessons/i-couldnt-help-but-wonder/do-bisexuals-have-to-choose` | COSYplatform | **404 Not Found** | **BROKEN** | `shared/calendar-data/events.json` |
| `https://cosylanguages.github.io/COSYplatform/lessons/keeping-up-with-science/childhood-obesity` | COSYplatform | **404 Not Found** | **BROKEN** | `shared/calendar-data/events.json` |
| `https://cosylanguages.github.io/COSYtools/` | COSYtools | **200 OK** | **OK** | `README.md`, `index.html`, `browse.html` |
| `https://cosylanguages.github.io/COSYgames/` | COSYgames | **200 OK** | **OK** | `README.md`, `index.html`, `browse.html` |

### 2.2 Registration Links (WhatsApp & Telegram)

| Destination URL / Pattern | Category | HTTP Status | Status Flag | Sample Source Files |
| :--- | :--- | :---: | :---: | :--- |
| `https://t.me/cosylanguagesproject` | Telegram | **200 OK** | **OK** | `index.html`, `browse.html`, `speaking-clubs.html` |
| `https://t.me/cosylanguages?text=...` | Telegram | **200 OK** | **OK** | `shared/calendar-data/events.json`, French/Russian masterclass sessions |
| `https://wa.me/330766784195` | WhatsApp | **200 OK (Redirect)** | **OK (Redirected)** | `index.html`, `browse.html`, `speaking-clubs.html` |
| `https://wa.me/330766784195?text=...` | WhatsApp | **200 OK (Redirect)** | **OK (Redirected)** | Over 600 session HTML pages under `sessions/` |
| `https://wa.me/34600000000` | WhatsApp | **200 OK (Redirect)** | **Placeholder Flag** | `shared/calendar-data/events.json` (`evt-2025-011`, `evt-2025-012`) |
| `https://wa.me/34600000000?text=...` | WhatsApp | **200 OK (Redirect)** | **Placeholder Flag** | `shared/calendar-data/events.json` (`evt-2025-001`, `evt-2025-002`, etc.) |

---

## 3. COSYmanuals Non-Public Access Model Policy Check

* **Rule:** `COSYmanuals` operates under a non-public access model and **must not be hyperlinked directly** on public user-facing pages within COSYevents.
* **Audit Findings:**
  * **0 direct `<a href="...">` links** to `COSYmanuals` exist across all HTML pages in the repository.
  * `COSYmanuals` is mentioned strictly as plain text in internal development and architecture documentation:
    * `README.md` (System architecture description)
    * `manuals/MIGRATION_PLAN.md` (Internal migration plan document)
  * **Policy Compliance:** **PASSED.** No public pages violate the non-public access restriction.

---

## 4. Missing Registration Links on Session Pages

Every public student session page should include a registration call-to-action link (e.g. WhatsApp `wa.me` or Telegram `t.me`).

* **Total Session Content Pages audited:** 596 pages.
* **Session Pages with Valid Registration CTAs:** 584 pages.
* **Session Pages MISSING Registration Links (12 Pages Flagged):**
  1. `fr/sessions/mind-matters/anticipatory-grief.html`
  2. `fr/sessions/mind-matters/broken-children-grown-bodies.html`
  3. `fr/sessions/mind-matters/depersonalization.html`
  4. `fr/sessions/mind-matters/fear-of-love-control.html`
  5. `fr/sessions/mind-matters/finding-the-right-person.html`
  6. `fr/sessions/mind-matters/gilberts-law.html`
  7. `fr/sessions/mind-matters/impersonation.html`
  8. `fr/sessions/mind-matters/kidlins-law.html`
  9. `fr/sessions/mind-matters/law-of-attraction.html`
  10. `fr/sessions/mind-matters/limerence.html`
  11. `fr/sessions/mind-matters/murphys-law.html`
  12. `fr/sessions/mind-matters/wilsons-law.html`
