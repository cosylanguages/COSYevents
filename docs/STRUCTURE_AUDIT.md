# COSYevents Structure Audit Report

**Date:** May 2025
**Scope:** Light audit of top-level event format folders, category hubs, root catalog pages, and session deck directories.

---

## 📌 Executive Summary

COSYevents currently maintains three structural tiers for event formats:
1. **Root Format Catalogs (`<format>.html`):** Legacy/primary interactive catalog pages located at the repository root (e.g. `cinema-club.html`, `game-evenings.html`, `karaoke-club.html`, `long-reads.html`, `speaking-clubs.html`).
2. **Subfolder Catalogs (`<format>/index.html`):** Subdirectory copies/indexes providing catalog grids or deck views (e.g. `cinema-club/index.html`, `game-evening/index.html`, `karaoke-club/index.html`, `long-reads/index.html`).
3. **Event Category Hubs (`<category-plural>/index.html`):** Calendar-driven filter hubs matching the core event types defined in `events.json` (`speaking-clubs/index.html`, `cinema-nights/index.html`, `teacher-led-sessions/index.html`, `special-events/index.html`).
4. **Session Content Decks (`sessions/<format>/<slug>.html`):** Full standalone interactive session decks and prompt cards.

This audit identifies functional overlap and potential content duplication between root HTML pages, subfolder index pages, and category hubs.

---

## 🔍 Detailed Folder & File Audit Findings

### 1. Cinema Club vs. Cinema Nights
- **Files/Folders:**
  - `cinema-club.html` (Root)
  - `cinema-club/index.html` (Folder)
  - `cinema-nights/index.html` (Category Hub)
  - `sessions/cinema-club/` (Session Decks)
- **Findings:**
  - `cinema-club.html` and `cinema-club/index.html` both present film catalogs and vocabulary decks.
  - `cinema-nights/index.html` serves as the calendar event filter hub matching the `cinema-night` event type in `events.json`.
  - Content sessions reside in `sessions/cinema-club/`.
- **Recommendation:**
  - Standardize naming across the ecosystem (e.g. `cinema-club`).
  - Merge `cinema-club/index.html` into `cinema-club.html` or redirect `cinema-club/index.html` to `cinema-club.html` to avoid dual-maintaining two cinema catalog pages.
  - Keep `cinema-nights/index.html` focused on upcoming/live calendar views or unify route naming.

### 2. Game Evening vs. Game Evenings
- **Files/Folders:**
  - `game-evenings.html` (Root)
  - `game-evening/index.html` (Folder)
  - `special-events/index.html` (Category Hub)
- **Findings:**
  - Singular vs. plural folder naming mismatch (`game-evening/` vs `game-evenings.html`).
  - `game-evenings.html` is the primary root landing page; `game-evening/index.html` contains an interactive controls panel and game deck catalog.
  - `special-events/index.html` links to game evening materials (`game-evening/`).
- **Recommendation:**
  - Standardize on plural `game-evenings` for folder naming.
  - Consolidate catalog rendering between `game-evenings.html` and `game-evening/index.html`.

### 3. Karaoke Club
- **Files/Folders:**
  - `karaoke-club.html` (Root)
  - `karaoke-club/index.html` (Folder)
  - `sessions/karaoke-club/` (Session Decks)
- **Findings:**
  - `karaoke-club.html` is a rich, standalone catalog containing song cards and lyrics decks.
  - `karaoke-club/index.html` contains a secondary song grid layout.
- **Recommendation:**
  - Retain `sessions/karaoke-club/` for individual song study decks.
  - Eliminate double catalog maintenance by designating `karaoke-club.html` as the single source of truth and pointing `karaoke-club/index.html` to it.

### 4. Long Reads
- **Files/Folders:**
  - `long-reads.html` (Root)
  - `long-reads/index.html` (Folder)
  - `sessions/long-reads/` (Session Decks)
- **Findings:**
  - Structural duplication between root `long-reads.html` and `long-reads/index.html`.
- **Recommendation:**
  - Consolidate folder index into root catalog page or standardize folder navigation across all clubs.

### 5. Speaking Clubs
- **Files/Folders:**
  - `speaking-clubs.html` (Root overview)
  - `speaking-clubs/index.html` (Calendar event category hub)
  - Individual club root files (`mind-matters.html`, `debatable-relatable.html`, `i-couldnt-help-but-wonder.html`, `if-you-were.html`, `keeping-up-with-science.html`, `lets-celebrate.html`, `my-life-with-without.html`, `the-greatest-quotes.html`)
  - `sessions/<club-name>/` (Session Decks)
- **Findings:**
  - Clean separation: `speaking-clubs.html` serves as format overview; `speaking-clubs/index.html` serves as calendar hub; individual club pages host topic lists; `sessions/<club-name>/` host individual HTML decks.

---

## 🛠️ Summary Table of Audit Findings

| Format / Club | Root File | Folder Index | Category Hub | Session Content Folder | Status / Risk |
|---|---|---|---|---|---|
| **Cinema** | `cinema-club.html` | `cinema-club/index.html` | `cinema-nights/index.html` | `sessions/cinema-club/` | High duplication between root and folder index |
| **Game Evenings** | `game-evenings.html` | `game-evening/index.html` | `special-events/index.html` | N/A (interactive decks) | Singular/plural mismatch (`game-evening` vs `game-evenings`) |
| **Karaoke Club** | `karaoke-club.html` | `karaoke-club/index.html` | N/A | `sessions/karaoke-club/` | Duplicate catalog index |
| **Long Reads** | `long-reads.html` | `long-reads/index.html` | N/A | `sessions/long-reads/` | Duplicate catalog index |
| **Speaking Clubs** | `speaking-clubs.html` | N/A | `speaking-clubs/index.html` | `sessions/<club>/` | Well-structured |
| **Teacher Sessions** | N/A | N/A | `teacher-led-sessions/index.html` | N/A | Well-structured category hub |
| **Special Events** | N/A | N/A | `special-events/index.html` | N/A | Well-structured category hub |

---

## 📋 Flagged Recommendations for Future Clean-Up

1. **Do not delete or modify content folders during this PR** per product guidelines.
2. **Phase 2 Restructuring (Future Task):**
   - Choose one index pattern: either root-level `.html` pages OR folder-based `/index.html` pages for all formats, but not both.
   - Standardize singular/plural directory names (`game-evenings/`, `cinema-club/`).
   - Retain COSYevents as the single public, free source of truth for all club formats.
