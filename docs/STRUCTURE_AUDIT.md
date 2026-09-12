# COSYevents Structure Audit Report

**Date:** May 2025 (Updated: Consolidation Completed)
**Scope:** Structural audit of top-level event format folders, category hubs, root catalog pages, session deck directories, needs-review reconciliations, and COSYplatform conversion status links.

---

## 📌 Executive Summary

COSYevents maintains structural tiers for event formats:
1. **Root Format Catalogs (`<format>.html`):** Designated single sources of truth for interactive format catalog pages located at the repository root (`cinema-club.html`, `game-evenings.html`, `karaoke-club.html`, `long-reads.html`, `speaking-clubs.html`).
2. **Subfolder Catalogs (`<format>/index.html`):** Subdirectory routes that perform seamless client-side redirects to their respective root format catalog pages (`cinema-club/index.html`, `game-evenings/index.html`, `game-evening/index.html`, `karaoke-club/index.html`, `long-reads/index.html`).
3. **Event Category Hubs (`<category-plural>/index.html`):** Calendar-driven filter hubs matching core event types (`speaking-clubs/index.html`, `cinema-nights/index.html`, `teacher-led-sessions/index.html`, `special-events/index.html`).
4. **Session Content Decks (`sessions/<format>/<slug>.html`):** Full standalone interactive session decks and prompt cards.

All structural page duplications, singular/plural directory mismatches, needs-review session flags, and conversion link statuses identified in this audit have been resolved.

---

## 🔍 Detailed Audit Findings & Resolutions

### 1. Cinema Club vs. Cinema Nights
- **Files/Folders:**
  - `cinema-club.html` (Root Catalog - Primary Source of Truth)
  - `cinema-club/index.html` (Folder Index - Redirect)
  - `cinema-nights/index.html` (Calendar Category Hub)
  - `sessions/cinema-club/` (Session Decks)
- **Resolution:**
  - Designated `cinema-club.html` as the single source of truth for the Cinema Club catalog.
  - Configured `cinema-club/index.html` to perform a seamless client-side redirect to `../cinema-club.html`.
  - Preserved `cinema-nights/index.html` focused purely on live calendar screening views.

### 2. Game Evening vs. Game Evenings
- **Files/Folders:**
  - `game-evenings.html` (Root Catalog - Primary Source of Truth)
  - `game-evenings/index.html` (Folder Index - Redirect)
  - `game-evening/index.html` (Legacy Directory - Fallback Redirect)
  - `special-events/index.html` (Category Hub)
- **Resolution:**
  - Standardized directory naming on plural `game-evenings/`.
  - Configured `game-evenings/index.html` and legacy `game-evening/index.html` to redirect to `../game-evenings.html`.
  - Updated references in `special-events/index.html` and `shared/calendar-data/events.json` to point to `game-evenings.html`.

### 3. Karaoke Club
- **Files/Folders:**
  - `karaoke-club.html` (Root Catalog - Primary Source of Truth)
  - `karaoke-club/index.html` (Folder Index - Redirect)
  - `sessions/karaoke-club/` (Session Decks)
- **Resolution:**
  - Retained `sessions/karaoke-club/` for individual song study decks and challenges.
  - Designated `karaoke-club.html` as the single source of truth and configured `karaoke-club/index.html` to redirect to `../karaoke-club.html`.

### 4. Long Reads
- **Files/Folders:**
  - `long-reads.html` (Root Catalog - Primary Source of Truth)
  - `long-reads/index.html` (Folder Index - Redirect)
  - `sessions/long-reads/` (Session Decks)
- **Resolution:**
  - Consolidated catalog rendering into root `long-reads.html`.
  - Configured `long-reads/index.html` to redirect to `../long-reads.html`.

### 5. Speaking Clubs
- **Files/Folders:**
  - `speaking-clubs.html` (Root overview)
  - `speaking-clubs/index.html` (Calendar event category hub)
  - Individual club root files (`mind-matters.html`, `debatable-relatable.html`, `i-couldnt-help-but-wonder.html`, `if-you-were.html`, `keeping-up-with-science.html`, `lets-celebrate.html`, `my-life-with-without.html`, `the-greatest-quotes.html`)
  - `sessions/<club-name>/` (Session Decks)
- **Resolution:**
  - Well-structured separation maintained.

### 6. Needs-Review Sessions Reconciliation (`data/needs-review.json`)
- **Resolution:**
  - Reconciled all 12 flagged items in `data/needs-review.json`.
  - 11 legitimate Karaoke Club session challenge files confirmed cataloged in `data/events/karaoke-club.json` and active under `sessions/karaoke-club/challenges/`.
  - Documented `template-karaoke.html` as excluded developer authoring template.
  - Updated `data/needs-review.json` status to `resolved` or `excluded` with explicit resolution notes. No session HTML files were deleted.

### 7. COSYplatform Conversion Link Verification
- **Audit Findings:**
  - Inspected `shared/calendar-data/events.json` for sessions with `conversionStatus: "converted"`.
  - `evt-2025-001` ("Do Bisexuals Have to Choose?"): `convertedLessonUrl` (`https://cosylanguages.github.io/COSYplatform/lessons/i-couldnt-help-but-wonder/do-bisexuals-have-to-choose`) returns HTTP 404 (Missing / Broken URL on COSYplatform).
  - `evt-2025-011` ("Childhood Obesity Theory Debunked"): `convertedLessonUrl` (`https://cosylanguages.github.io/COSYplatform/lessons/keeping-up-with-science/childhood-obesity`) returns HTTP 404 (Missing / Broken URL on COSYplatform).
  - Status flagged for COSYplatform maintainers (no modifications made in COSYplatform repository per constraints).

---

## 🛠️ Summary Table of Audit Findings & Status

| Format / Club | Root File | Folder Index | Category Hub | Session Content Folder | Status |
|---|---|---|---|---|---|
| **Cinema** | `cinema-club.html` | `cinema-club/index.html` (Redirect) | `cinema-nights/index.html` | `sessions/cinema-club/` | ✅ Resolved |
| **Game Evenings** | `game-evenings.html` | `game-evenings/index.html` (Redirect) | `special-events/index.html` | N/A (interactive decks) | ✅ Resolved |
| **Karaoke Club** | `karaoke-club.html` | `karaoke-club/index.html` (Redirect) | N/A | `sessions/karaoke-club/` | ✅ Resolved |
| **Long Reads** | `long-reads.html` | `long-reads/index.html` (Redirect) | N/A | `sessions/long-reads/` | ✅ Resolved |
| **Speaking Clubs** | `speaking-clubs.html` | N/A | `speaking-clubs/index.html` | `sessions/<club>/` | ✅ Well-structured |
| **Teacher Sessions** | N/A | N/A | `teacher-led-sessions/index.html` | N/A | ✅ Well-structured |
| **Special Events** | N/A | N/A | `special-events/index.html` | N/A | ✅ Well-structured |
