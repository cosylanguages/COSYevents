# COSYevents Content Migration & Reconciliation Log

This document logs the full content audit, migration, and reconciliation performed between **COSYlanguages** (`COSYlanguages/events/`) and **COSYevents** (`data/events/`, `sessions/`, and frontend event folders).

---

## 📋 Summary of Audit & Reconciliation

Every file and catalog entry in `COSYlanguages/events/` was cataloged, evaluated, and reconciled into **COSYevents**:
- **113 Cinema Club separate session HTML files** (`sessions/cinema-club/`)
- **55 Mind Matters separate session HTML files** (`sessions/mind-matters/`)
- **4 Long Reads separate session HTML files** (`sessions/long-reads/`)
- **14 Localized FR and RU session HTML files** (`fr/sessions/`, `ru/sessions/`)
- **489 Catalog Sessions in `data/sessions.json`** spanning all 5 event types, pinned/featured sessions, and historical records

All migrated content was preserved as full standalone session HTML pages in addition to client-side JSON schemas served via `shared/js/prompt-deck-loader.js` across the 5 event type modules (`speaking-clubs`, `cinema-club`, `karaoke-club`, `game-evening`, `long-reads`).

---

## 🗣️ 1. Speaking Clubs (`speaking-clubs`)

- **Migrated Content:**
  - Preserved **55 standalone session HTML files** in `sessions/mind-matters/` (e.g. *Are You Addicted to Drama?*, *Anticipatory Grief*, *The Benjamin Franklin Effect*, *Science of Sleep*, *Power of Habits*, *Why Do They Say AI Is Inevitable*, *Washing series*, etc.).
  - Extracted **800+ real discussion prompt cards** and vocabulary definitions into `data/events/speaking-clubs.json`.
  - Incorporated **205 catalog sessions** from `data/sessions.json` across all 8 Speaking Club themes (`Keeping Up with Science`, `Mind Matters`, `Let's Celebrate`, `The Greatest Quotes`, `If You Were`, `Debatable & Relatable`, `My Life With & Without`, `I Couldn't Help But Wonder`).

- **COSYevents-Original Content:**
  - Retained all 8 existing club theme decks (`if-you-were`, `i-couldnt-help-but-wonder`, `keeping-up-with-science`, `debatable-and-relatable`, `lets-celebrate`, `my-life-with-without`, `the-greatest-quotes`, `mind-matters`).

- **Copyright Exclusions:**
  - None. All content consists of original communicative prompts and pedagogical vocabulary definitions.

---

## 🎬 2. Cinema Club (`cinema-club`)

- **Migrated Content:**
  - Preserved **113 standalone film session HTML files** in `sessions/cinema-club/` (including *A Quiet Place*, *About Time*, *Bird Box*, *CODA*, *The Substance*, *Don't Look Up*, *Fleabag*, *Glee*, *Gone Girl*, *Hereditary*, *Incendies*, *Kill Bill*, *Killing Eve*, *Mamma Mia*, *Midsommar*, *The Queen's Gambit*, *Roman Holiday*, *Step Mom*, *The Devil Wears Prada*, etc.).
  - Replaced placeholder vocabulary definitions and template questions in `data/events/cinema-club.json` with real migrated pre-watch vocabulary primers and scene analysis prompts.
  - Verified all 113 Cinema Club catalog entries from `data/sessions.json` are present in `data/events/cinema-club.json`.

- **COSYevents-Original Content:**
  - Retained top-level genre category structures (`sci-fi-and-future-visions`, `drama-and-human-connections`, `mystery-and-suspense`, `comedy-and-social-satire`) as genre-agnostic entry decks.

- **Copyright Exclusions:**
  - **Full Plot Summaries & Screenplays Excluded:** Omitted verbatim screenplay excerpts and plot-spoiling synopses.
  - **Video Files & Direct Streams Excluded:** No copyrighted video clips or movie files are hosted or embedded. External search links and official trailer references are used exclusively.

---

## 🎤 3. Karaoke Club (`karaoke-club`)

- **Migrated Content:**
  - Integrated iconic song challenges identified in `KARAOKE_CHALLENGES_AUDIT_REPORT.md` (e.g. ABBA, Cass Elliot, Angèle, Heathers The Musical, Crazy Ex-Girlfriend, Kate Bush) into structured themes (`pop-and-disco-iconic`, `stage-screen-satire`) inside `data/events/karaoke-club.json`.
  - Merged **104 catalog song sessions** from `data/sessions.json` into a global karaoke catalog deck.

- **COSYevents-Original Content:**
  - Retained original song challenge themes (`80s-pop-classics`, `love-and-ballads`, `kids-and-animation`).

- **Copyright Exclusions:**
  - **Song Lyrics Excluded:** STRICTLY NO song lyrics are included or stored in dataset files per COSYevents copyright policy. Entries contain only song titles, artists, search links, CEFR level calibrations, and pronunciation/singing guidance prompts.

---

## 🎲 4. Game Evening (`game-evening`)

- **Migrated Content:**
  - Reconciled game names, descriptions, and pedagogical goals against `COSYlanguages/events/game-evenings.html`.
  - Updated *Battle of Wits* from generic trivia to its actual two-sided debate format.
  - Aligned *Action Hero*, *Identity Mystery*, *Story Chain*, *Word Linker*, and *Lucky Numbers (Bingo)* descriptions and icons.

- **COSYevents-Original Content:**
  - Retained multi-game event lineups (`quick-warmup-icebreakers`, `trivia-and-brain-teasers`, `storytelling-and-improv`, `vocab-and-wordplay-party`) and URL parameter handoff conventions to `COSYgames`.

- **Copyright Exclusions:**
  - None. All game mechanics, rules, and descriptions are original.

---

## 📖 5. Long Reads (`long-reads`)

- **Migrated Content:**
  - Preserved **4 standalone article session HTML files** in `sessions/long-reads/` (`attention-economy.html`, `designed-to-addict.html`, `changing-our-brains.html`, `the-30-day-breakup.html`).
  - Created `data/events/long-reads.json` and `long-reads/index.html` with real article reading decks.

- **COSYevents-Original Content:**
  - Built new `PromptDeckLoader` viewer interface and card-based comprehension layout.

- **Copyright Exclusions:**
  - **Full Article Reproductions Excluded:** Omitted full long-form article text. Included only key reading vocabulary primers and structured comprehension/debate prompts.

---

---

## 🚀 Second Migration Pass: Full Premium Speaking & Karaoke Sessions (August 2026)

In addition to the initial 180+ standalone session pages migrated from `COSYlanguages/events/`, a comprehensive second migration pass was performed to bring over all remaining full standalone session HTML pages from `COSYlanguages/apps/premium-events/`:

- **Speaking Clubs (215 new session HTML pages):**
  - **I Couldn't Help But Wonder:** 27 session HTML pages (`sessions/i-couldnt-help-but-wonder/`)
  - **Keeping Up with Science:** 57 session HTML pages (`sessions/keeping-up-with-science/`)
  - **Debatable & Relatable:** 26 session HTML pages (`sessions/debatable-relatable/`)
  - **Let's Celebrate:** 24 session HTML pages (`sessions/lets-celebrate/`)
  - **My Life With/Without:** 19 session HTML pages (`sessions/my-life-with-without/`)
  - **The Greatest Quotes:** 57 session HTML pages (`sessions/the-greatest-quotes/`)
  - **If You Were:** 5 session HTML pages (`sessions/if-you-were/`)

- **Karaoke Club (120 new session HTML pages):**
  - **Core Karaoke Sessions:** 13 session HTML pages (`sessions/karaoke-club/`)
  - **Artist & Theme Challenges:** 107 session HTML pages (`sessions/karaoke-club/challenges/`)

- **Restyling & Copyright Compliance:**
  - Restyled all imported HTML pages to conform to COSYevents platform standards, replacing old premium navigation chrome with COSYevents design tokens and relative asset paths.
  - Applied strict copyright compliance for Karaoke Club session pages by stripping verbatim song lyric text while retaining song metadata, external licensed links, pronunciation drills, and discussion questions.

---

## 🛑 Status for Old Folder Retirement
This migration log confirms that **100% of real session content, full standalone session HTML pages (510+ total files across all 5 event types), catalog entries (489+ sessions), prompt decks, specifications, and structural decisions** from `COSYlanguages` have been mapped, restyled, reconciled, and verified working inside **COSYevents**.
