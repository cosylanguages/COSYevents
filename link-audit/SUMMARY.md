# COSYevents Master Audit Summary & Actionable Remediation Plan

**Audit Date:** September 2025
**Target File:** `/link-audit/SUMMARY.md`
**Consolidated Audit Scope:** Synthesis of `00-repo-map.md`, `01-internal-link-audit.md`, `02-events-json-audit.md`, `03-external-link-audit.md`, and `04-docs-spec-link-audit.md`.

This report groups every issue discovered across COSYevents by type, prioritizes them from most critical (data-breaking calendar defects) to lowest severity (orphan boilerplate templates), and proposes exact, single-line actionable fixes for human review prior to implementation.

---

## Priority 1: Data-Breaking Calendar & Asset Issues (`shared/calendar-data/events.json`)

*Data-breaking issues affect live user calendar widgets, break material PDF links, or prevent poster cover rendering.*

### 1.1 Broken `materials` PDF & HTML Paths in `events.json`
1. **`evt-2025-003`** — Target file `shared/materials/french-phonetics-guide.pdf` is missing from disk.
   * **Proposed Fix:** Add missing PDF asset `shared/materials/french-phonetics-guide.pdf` or update `materials` in `events.json` (Record `evt-2025-003`) to `https://cosylanguages.github.io/COSYevents/fr/speaking-clubs.html`.
2. **`evt-2025-007`** — Target file `shared/materials/russian-idioms.pdf` is missing from disk.
   * **Proposed Fix:** Add missing PDF asset `shared/materials/russian-idioms.pdf` or update `materials` in `events.json` (Record `evt-2025-007`) to `https://cosylanguages.github.io/COSYevents/ru/speaking-clubs.html`.
3. **`evt-2025-009`** — Target file `sessions/lets-celebrate/italian-gastronomy.html` is missing from disk.
   * **Proposed Fix:** Create session page `sessions/lets-celebrate/italian-gastronomy.html` or update `materials` in `events.json` (Record `evt-2025-009`) to `https://cosylanguages.github.io/COSYevents/lets-celebrate.html`.

### 1.2 Missing Poster Cover Image Assets in `events.json`
4. **`evt-2025-001`** — Poster cover `assets/speaking-clubs-cover.jpg` is missing from disk.
   * **Proposed Fix:** Add image asset `assets/speaking-clubs-cover.jpg` or set `"poster": null` in `events.json` (Record `evt-2025-001`).
5. **`evt-2025-002`** — Poster cover `assets/roman-holiday-poster.jpg` is missing from disk.
   * **Proposed Fix:** Add image asset `assets/roman-holiday-poster.jpg` or set `"poster": null` in `events.json` (Record `evt-2025-002`).
6. **`evt-2025-006`** — Poster cover `assets/ratatouille-poster.jpg` is missing from disk.
   * **Proposed Fix:** Add image asset `assets/ratatouille-poster.jpg` or set `"poster": null` in `events.json` (Record `evt-2025-006`).
7. **`evt-2025-012`** — Poster cover `assets/prada-poster.jpg` is missing from disk.
   * **Proposed Fix:** Add image asset `assets/prada-poster.jpg` or set `"poster": null` in `events.json` (Record `evt-2025-012`).

### 1.3 Placeholder Registration Links in `events.json`
8. **`evt-2025-011`** — Registration URL is generic placeholder `https://wa.me/34600000000`.
   * **Proposed Fix:** Update `registration_link` in `events.json` (Record `evt-2025-011`) to `https://wa.me/330766784195?text=Register%20Childhood%20Obesity%20evt-2025-011`.
9. **`evt-2025-012`** — Registration URL is generic placeholder `https://wa.me/34600000000`.
   * **Proposed Fix:** Update `registration_link` in `events.json` (Record `evt-2025-012`) to `https://wa.me/330766784195?text=Register%20Prada%20Cinema%20evt-2025-012`.

---

## Priority 2: Broken Internal Hub Navigation Links

*Broken internal links prevent site navigation across global portals, format catalogs, and language hubs.*

### 2.1 Navigation Bar & Footer Relativization Errors (96 Links Total)
10. **`browse.html`** — Navigation bar contains relative path errors `../practice/index.html`, `../games/index.html`, `../privacy.html`, `../index.html`.
    * **Proposed Fix:** In `browse.html`, update `href="../..."` to root-relative `href="practice/index.html"`, `href="games/index.html"`, `href="privacy.html"`, and `href="index.html"`.
11. **`cinema-club.html`** — Navigation bar contains relative path errors `../practice/index.html`, `../events/index.html`, `../games/index.html`, `../privacy.html`.
    * **Proposed Fix:** In `cinema-club.html`, update `href="../..."` to `href="practice/index.html"`, `href="speaking-clubs.html"`, `href="games/index.html"`, and `href="privacy.html"`.
12. **`speaking-clubs.html`** — Catalog cards contain broken paths `../apps/premium-events/...`.
    * **Proposed Fix:** In `speaking-clubs.html`, update card links from `../apps/premium-events/clubs/<name>/<catalog>.html` to root-level `<catalog>.html`.
13. **`fr/index.html`** — Language hub contains broken paths `../../apps/premium-events/...` and `../../events/index.html`.
    * **Proposed Fix:** In `fr/index.html`, update broken catalog card hrefs to `fr/speaking-clubs.html` and `fr/mind-matters.html`.
14. **`ru/index.html`** — Language hub contains broken paths `../../apps/premium-events/...` and `../../events/index.html`.
    * **Proposed Fix:** In `ru/index.html`, update broken catalog card hrefs to `ru/speaking-clubs.html` and `ru/mind-matters.html`.
15. **Topic Catalogs (`debatable-relatable.html`, `i-couldnt-help-but-wonder.html`, `if-you-were.html`, `karaoke-club.html`, `keeping-up-with-science.html`, `lets-celebrate.html`, `long-reads.html`, `mind-matters.html`, `my-life-with-without.html`, `the-greatest-quotes.html`)** — Footer navigation bar contains invalid relative depth `../../../../...`.
    * **Proposed Fix:** In all 10 root-level topic catalog HTML files, replace `../../../../` prefix in footer links with `./`.

---

## Priority 3: Missing Cross-Language & CEFR Level Parity

*Language and CEFR level inconsistencies result in incomplete student offerings and uncataloged entries.*

### 3.1 Missing Session Content for Scheduled Languages
16. **Italian Language Sessions & Hub** — Calendar schedules Italian events (`evt-2025-002`, `evt-2025-009`), but 0 Italian session pages exist on disk.
    * **Proposed Fix:** Create Italian session page `sessions/cinema-club/roman-holiday-italian.html` and add `it/` language hub.
17. **Greek Language Sessions & Hub** — Calendar schedules Greek events (`evt-2025-004`, `evt-2025-010`), but 0 Greek session pages exist on disk.
    * **Proposed Fix:** Create Greek session page `sessions/the-greatest-quotes/wisdom-of-socrates-greek.html` and add `el/` language hub.

### 3.2 Unlevelled Entries in Master Catalog (`data/sessions.json`)
18. **Unlevelled English & Russian Catalog Entries** — 370 English and 35 Russian session entries in `data/sessions.json` have `level: ""`.
    * **Proposed Fix:** Populate missing `level` metadata values in `data/sessions.json` for all unlevelled English and Russian sessions based on content analysis.

### 3.3 Missing CEFR Subdirectory Taxonomies
19. **Missing Folder Taxonomy** — Folders `speaking-clubs/`, `cinema-nights/`, `teacher-led-sessions/`, `special-events/`, and `past-events/` lack `<language>/<level>/` subdirectories across all branches.
    * **Proposed Fix:** Establish standard directory structure `<event-type>/<language>/<CEFR-level>/` and populate index pages.

---

## Priority 4: External Link Rot & Missing Registration CTAs

*External 404 links damage SEO and user experience; missing CTAs prevent student registrations.*

### 4.1 Broken Outbound Links to Sibling Ecosystem Sites
20. **`COSYlanguages` Course Sub-paths** — Catalog cards link to `https://cosylanguages.github.io/COSYlanguages/apps/premium-courses/...` which return **HTTP 404**.
    * **Proposed Fix:** Update links in `browse.html`, `cinema-club.html`, and `karaoke-club.html` to target valid root URL `https://cosylanguages.github.io/COSYlanguages/`.
21. **`COSYplatform` Lesson Paths** — `README.md` and `events.json` link to `COSYplatform/lessons/...` which return **HTTP 404**.
    * **Proposed Fix:** Update `README.md` and `events.json` `convertedLessonUrl` fields to target valid platform root URL `https://cosylanguages.github.io/COSYplatform/` or publish lesson pages on COSYplatform.

### 4.2 Missing Registration Links on French Mind Matters Session Pages
22. **12 French Session Pages Missing Registration CTAs** — French Mind Matters sessions (`fr/sessions/mind-matters/*.html`) do not contain WhatsApp/Telegram registration buttons.
    * **Proposed Fix:** Add WhatsApp registration button `https://wa.me/330766784195?text=Bonjour!%20Je%20souhaite%20rejoindre%20Mind%20Matters` to all 12 French Mind Matters HTML pages.

---

## Priority 5: Documentation & Specification Link Fixes

*Missing documentation links hinder contributor onboarding and specification compliance.*

23. **`README.md` Unlinked Spec Files** — `docs/cinema-inventory.md`, `docs/rules-template.md`, and `docs/STRUCTURE_AUDIT.md` are unlinked in `README.md`.
    * **Proposed Fix:** Add Markdown hyperlinks in `README.md` under a "Documentation & Specifications" section linking to `docs/cinema-inventory.md`, `docs/rules-template.md`, and `docs/STRUCTURE_AUDIT.md`.
24. **`CONTRIBUTING.md` Specification References** — `CONTRIBUTING.md` lacks direct links to event specifications.
    * **Proposed Fix:** In `CONTRIBUTING.md`, add direct links to `docs/speaking-clubs-spec.md` and `docs/cinema-content-style-guide.md`.

---

## Priority 6: Orphan Session Pages

*Orphan session templates exist on disk but are intentionally unlinked from student catalogs.*

25. **Boilerplate Template Files** — `sessions/lets-celebrate/template-celebrate.html`, `sessions/mind-matters/template-mind.html`, `sessions/the-greatest-quotes/template-quotes.html`.
    * **Proposed Fix:** Retain template files in `templates/` directory or document them as boilerplate templates in `README.md` to distinguish them from student content pages.
