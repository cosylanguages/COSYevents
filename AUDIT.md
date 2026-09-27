# Master Repository Audit & State Report — COSYevents

**Audit Date:** September 2026
**Auditor:** Jules (AI Software Engineer)
**Repository:** COSYevents (`cosylanguages/COSYevents`)
**Status:** FULLY RECONCILED & VERIFIED

---

## Executive Summary

This report serves as the consolidated single source of truth for the audit state, architecture, taxonomy, asset integrity, and data pipelines of the **COSYevents** repository. All prior audit findings across legacy documents (`docs/STRUCTURE_AUDIT.md` and the `link-audit/` directory) have been verified against the live repository state as of **September 2026**, with all previously flagged issues marked as resolved.

---

## 1. Taxonomy & Architecture

### Single Source of Truth Catalog Architecture
- **Root Format & Topic Catalogs (`<topic>.html`):** The primary interactive catalog pages reside at the repository root (`speaking-clubs.html`, `cinema-club.html`, `karaoke-club.html`, `game-evenings.html`, `long-reads.html`, `basic-speaking-club.html`, `debatable-relatable.html`, `i-couldnt-help-but-wonder.html`, `if-you-were.html`, `keeping-up-with-science.html`, `lets-celebrate.html`, `mind-matters.html`, `my-life-with-without.html`, `the-greatest-quotes.html`).
- **Category Hubs (`<category>/index.html`):** Filter hubs for calendar views (`speaking-clubs/index.html`, `cinema-nights/index.html`, `teacher-led-sessions/index.html`, `special-events/index.html`).
- **Taxonomy Subfolder Index Routes (`events/speaking-clubs/*/index.html` and `events/multimedia-nights/*/index.html`):** All 12 subfolder index pages act as client-side redirect routes pointing seamlessly to their canonical root catalog pages (`../../../<topic>.html`), ensuring URL compatibility across sibling ecosystem repositories (`cosylanguages`, `cosydata`, `cosyplatform`).

### PagesCMS Configuration (`.pages.yml`)
- **Media Paths:** `media.input` points to `images` (existing root directory) and `media.output` to `/images`.
- **Collections Mapping:** Collections map directly to real event JSON datasets in `data/events/`:
  - `speaking_clubs` → `data/events/speaking-clubs.json`
  - `karaoke` → `data/events/karaoke-club.json`
  - `film_sessions` → `data/events/cinema-club.json`
  - `game_evening` → `data/events/game-evening.json`
  - `long_reads` → `data/events/long-reads.json`

---

## 2. Session Content & Catalog Verification

### Master Catalog Statistics (`data/sessions.json`)
- **Total Session Files on Disk:** 645 standalone HTML session pages across all supported languages:
  - English Sessions (`sessions/`): 560 files
  - French Sessions (`fr/sessions/`): 44 files
  - Russian Sessions (`ru/sessions/`): 41 files
- **Total Catalog Entries in `data/sessions.json`:** 645 sessions (100% match, verified via `scripts/verify_catalog.js`).
- **Master Calendar Records (`shared/calendar-data/events.json`):** 19 scheduled event entries.

### Public / Gated Content Model
- **Public Catalog Views:** Expose strictly event metadata, format, topic, CEFR level scope, and public blurbs. No interactive prompt decks or unlisted session materials are rendered publicly on catalog pages.
- **Session Materials:** Interactive decks and prompt cards are served inside self-contained session pages (`sessions/`) accessed via unlisted URLs sent to registered attendees.

---

## 3. Asset & Link Integrity Verification

All issues previously flagged in legacy audit summaries have been verified and resolved as of **September 2026**:

| Category | Flagged Issue | Resolution Status | Verified Location |
|---|---|---|---|
| **Materials PDFs** | `french-phonetics-guide.pdf` & `russian-idioms.pdf` | ✅ RESOLVED (Sept 2026) | `shared/materials/` |
| **Session Pages** | `italian-gastronomy.html` | ✅ RESOLVED (Sept 2026) | `sessions/lets-celebrate/` |
| **Poster Images** | Cover posters (`speaking-clubs-cover.jpg`, `roman-holiday-poster.jpg`, `ratatouille-poster.jpg`, `prada-poster.jpg`) | ✅ RESOLVED (Sept 2026) | `assets/` |
| **Hub Navigation** | Relative links on `browse.html`, `cinema-club.html`, `fr/index.html`, `ru/index.html` | ✅ RESOLVED (Sept 2026) | `node scripts/check_hub_links.js` |
| **Localized Linkage** | French and Russian session grids | ✅ RESOLVED (Sept 2026) | `node scripts/verify_hub_linkage.js` |
| **Authoring Templates** | Scattered template files in `sessions/` | ✅ RESOLVED (Sept 2026) | Consolidated into `templates/` (14 templates total) |
| **Migration Tooling** | One-time scripts in `scripts/` | ✅ RESOLVED (Sept 2026) | Archived in `scripts/archive/` with `README.md` |

---

## 4. Localized Language Hubs

- **French Portal (`fr/`):** `fr/index.html`, `fr/speaking-clubs.html`, `fr/mind-matters.html` (44 standalone session pages in `fr/sessions/`).
- **Russian Portal (`ru/`):** `ru/index.html`, `ru/speaking-clubs.html`, `ru/mind-matters.html` (41 standalone session pages in `ru/sessions/`).
- **Italian Portal (`it/`):** `it/index.html` (7 sessions).
- **Greek Portal (`el/`):** `el/index.html` (9 sessions).

---

## 5. Ecosystem Interchange Specifications

### Vocabulary Interchange (`COSYdata`)
- **Specification:** `templates/vocabulary-export.json` & `docs/vocabulary-pipeline.md`.
- **Function:** Standardized Draft-07 JSON schema for exporting session vocabulary entries into `COSYdata` ingestion pipelines.

### Session → Lesson Conversion (`COSYplatform` & `COSYlanguages`)
- **Specification:** `docs/session-conversion-spec.md` (`session-export.json`).
- **Function:** Defines export structure for converting completed live sessions into structured COSYplatform lessons, published in `COSYlanguages` as "Event Lessons".

---

## 6. Automated Verification Tooling

Active verification scripts in `scripts/`:
- `verify_catalog.js` — Confirms 1:1 catalog mapping between `data/sessions.json` and disk HTML files.
- `check_hub_links.js` — Validates relative link integrity across localized hubs.
- `verify_hub_linkage.js` — Ensures 100% of localized sessions are displayed and linked on hub pages.
