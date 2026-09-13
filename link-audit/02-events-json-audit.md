# COSYevents Calendar Events JSON Audit

**Audit Date:** September 2025
**Target File:** `/shared/calendar-data/events.json`
**Audit Scope:** Verification of all 12 event records in `events.json` against actual disk files, validation of `materials`, `poster`, and `convertedLessonUrl` links, check for placeholder/TODO links, identification of unreferenced session pages on disk, and validation of `language` and `level` schema constraints.

---

## 1. Field Verification: `materials` and `convertedLessonUrl`

Each event record in `shared/calendar-data/events.json` was audited to verify that its `materials` link resolves to an existing file in the repository and its `convertedLessonUrl` is well-formed.

### 1.1 Complete Event Record Audit Table

| Event ID | Event Title | Materials Link Status | Resolved Local Path | Converted Lesson URL Status | Poster Asset Status |
| :--- | :--- | :---: | :--- | :---: | :---: |
| `evt-2025-001` | Do Bisexuals Have to Choose? | **OK** | `sessions/i-couldnt-help-but-wonder/do-bisexuals-have-to-choose.html` | **OK** (Valid COSYplatform URL) | **BROKEN** (`assets/speaking-clubs-cover.jpg` missing) |
| `evt-2025-002` | Roman Holiday - Classic Film | **OK** | `sessions/cinema-club/roman-holiday-intermediate.html` | N/A (`null`) | **BROKEN** (`assets/roman-holiday-poster.jpg` missing) |
| `evt-2025-003` | French Pronunciation Workshop | **BROKEN** | `shared/materials/french-phonetics-guide.pdf` (File missing) | N/A (`null`) | N/A (`null`) |
| `evt-2025-004` | Polyglot Language Exchange | **OK** | `game-evenings.html` | N/A (`null`) | N/A (`null`) |
| `evt-2025-005` | AI & Art: Can Machines Be Creative? | **OK** | `sessions/debatable-relatable/ai-and-art.html` | **OK** (Planned, `null` URL) | N/A (`null`) |
| `evt-2025-006` | Ratatouille (French Audio) | **OK** | `sessions/cinema-club/ratatouille-french.html` | N/A (`null`) | **BROKEN** (`assets/ratatouille-poster.jpg` missing) |
| `evt-2025-007` | Russian Idioms & Metaphors | **BROKEN** | `shared/materials/russian-idioms.pdf` (File missing) | N/A (`null`) | N/A (`null`) |
| `evt-2025-008` | The 4-Day Work Week | **OK** | `sessions/debatable-relatable/4-day-work-week.html` | **OK** (Not-planned, `null` URL) | N/A (`null`) |
| `evt-2025-009` | La Dolce Vita & Gastronomy | **BROKEN** | `sessions/lets-celebrate/italian-gastronomy.html` (File missing) | N/A (`null`) | N/A (`null`) |
| `evt-2025-010` | Greek Mythology & Philosophy | **OK** | `sessions/the-greatest-quotes/wisdom-of-socrates.html` | N/A (`null`) | N/A (`null`) |
| `evt-2025-011` | Childhood Obesity Theory | **OK** | `sessions/keeping-up-with-science/childhood-obesity-theory-intermediate.html` | **OK** (Valid COSYplatform URL) | N/A (`null`) |
| `evt-2025-012` | The Devil Wears Prada | **OK** | `sessions/cinema-club/the-devil-wears-prada-intermediate.html` | N/A (`null`) | **BROKEN** (`assets/prada-poster.jpg` missing) |

---

## 2. Broken, Missing, or Placeholder Link Flags

The following exact record IDs and field values are flagged for broken target paths or generic registration placeholders:

### 2.1 Broken `materials` File Paths
* **`evt-2025-003`** — `materials`: `"https://cosylanguages.github.io/COSYevents/shared/materials/french-phonetics-guide.pdf"`
  * **Issue:** Target file `shared/materials/french-phonetics-guide.pdf` does **NOT** exist on disk in the repository.
* **`evt-2025-007`** — `materials`: `"https://cosylanguages.github.io/COSYevents/shared/materials/russian-idioms.pdf"`
  * **Issue:** Target file `shared/materials/russian-idioms.pdf` does **NOT** exist on disk in the repository.
* **`evt-2025-009`** — `materials`: `"https://cosylanguages.github.io/COSYevents/sessions/lets-celebrate/italian-gastronomy.html"`
  * **Issue:** Target file `sessions/lets-celebrate/italian-gastronomy.html` does **NOT** exist on disk in the repository.

### 2.2 Broken `poster` Image Paths
* **`evt-2025-001`** — `poster`: `"https://cosylanguages.github.io/COSYevents/assets/speaking-clubs-cover.jpg"`
  * **Issue:** Target file `assets/speaking-clubs-cover.jpg` does **NOT** exist on disk in the repository.
* **`evt-2025-002`** — `poster`: `"https://cosylanguages.github.io/COSYevents/assets/roman-holiday-poster.jpg"`
  * **Issue:** Target file `assets/roman-holiday-poster.jpg` does **NOT** exist on disk in the repository.
* **`evt-2025-006`** — `poster`: `"https://cosylanguages.github.io/COSYevents/assets/ratatouille-poster.jpg"`
  * **Issue:** Target file `assets/ratatouille-poster.jpg` does **NOT** exist on disk in the repository.
* **`evt-2025-012`** — `poster`: `"https://cosylanguages.github.io/COSYevents/assets/prada-poster.jpg"`
  * **Issue:** Target file `assets/prada-poster.jpg` does **NOT** exist on disk in the repository.

### 2.3 Placeholder Registration Links
* **`evt-2025-011`** & **`evt-2025-012`** — `registration_link`: `"https://wa.me/34600000000"`
  * **Issue:** Generic placeholder WhatsApp phone number (`34600000000`) without specific pre-filled message text parameters.

---

## 3. Session Pages on Disk Unreferenced in `events.json`

The calendar schedule in `shared/calendar-data/events.json` only contains **12 active event entries**.

* **Total Session HTML Pages on Disk:** 596 content pages (excluding template boilerplates and `index.html` redirects).
* **Session Pages Referenced in `events.json`:** 8 session pages (`do-bisexuals-have-to-choose.html`, `roman-holiday-intermediate.html`, `ai-and-art.html`, `ratatouille-french.html`, `4-day-work-week.html`, `wisdom-of-socrates.html`, `childhood-obesity-theory-intermediate.html`, `the-devil-wears-prada-intermediate.html`).
* **Unreferenced Session Pages on Disk:** **588 session pages** exist in the repository but have no corresponding event entry in `events.json`.

*(Note: `events.json` represents the live/upcoming calendar schedule rather than the full historical archive catalog in `data/sessions.json`.)*

---

## 4. Schema Compliance: `language` and `level` Fields

### 4.1 Schema Rules
According to repository documentation and `events.json` specification:
* **Allowed `language` Values:** `English`, `French`, `Italian`, `Russian`, `Greek`
* **Allowed `level` Values:** `A1`, `A2`, `B1`, `B2`, `C1`, `C2`

### 4.2 Audit Verification Results
* **Language Casing & Typos:** All 12 records strictly use correct capitalization and valid allowed language strings (`English`, `French`, `Italian`, `Russian`, `Greek`). **0 typos or casing errors found.**
* **Level Casing & Typos:** All 12 records strictly use valid CEFR levels (`A2`, `B1`, `B2`, `C1`). **0 typos or invalid levels found.**
