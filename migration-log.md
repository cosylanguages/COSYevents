# COSYevents Content Migration & Reconciliation Log

This document logs the full content audit, migration, and reconciliation performed between **COSYlanguages** (`COSYlanguages/events/`) and **COSYevents** (`data/events/` and frontend event folders).

---

## 📋 Summary of Audit & Reconciliation

Every file and catalog entry in `COSYlanguages/events/` was cataloged, evaluated, and reconciled into **COSYevents**:
- **79 Speaking Club files** (including 55 Mind Matters session files, landing pages, and FR/RU localized topics)
- **116 Cinema Club files** (including 113 individual film session HTML files, inventory audits, and style guides)
- **1 Game Evening file** (`game-evenings.html`)
- **489 Catalog Sessions in `data/sessions.json`** spanning all 5 event types, pinned/featured sessions, and historical records
- **Karaoke Club and Long Reads sources** identified across `COSYlanguages` reports and session files

All migrated content was adapted into client-side JSON schemas served via `shared/js/prompt-deck-loader.js` across the 5 event type modules (`speaking-clubs`, `cinema-club`, `karaoke-club`, `game-evening`, `long-reads`).

---

## 🗣️ 1. Speaking Clubs (`speaking-clubs`)

- **Migrated Content:**
  - Extracted **800+ real discussion prompt cards** and vocabulary definitions from 55 `sessions/mind-matters/*.html` files in `COSYlanguages` (covering topics such as *Are You Addicted to Drama?*, *Anticipatory Grief*, *The Benjamin Franklin Effect*, *Blue Eyes Brown Eyes Experiment*, *Brainwashing*, *Broken Children Grown Bodies*, *Conversations to Avoid/Enjoy*, *Depersonalization*, *Expert Defend Language Mistakes*, *Fear of Love & Control*, *Finding the Right Person*, *Gilbert's Law*, *Guilt of Moving Abroad*, *How to Love Your Work*, *Impersonation*, *Kidlin's Law*, *Law of Attraction*, *Limerence*, *Maze of Biases*, *Murphy's Law*, *Power of Habits*, *Psychology of Action Bias*, *Psychology of Smiles*, *Science of Sleep*, *The Bye-Now Effect*, *Why Do They Say AI Is Inevitable*, *Wilson's Law*, and the *Washing series* [bluewashing, pinkwashing, purplewashing, redwashing, sportswashing, whitewashing]).
  - Incorporated **205 catalog sessions** from `data/sessions.json` across all 8 Speaking Club themes (`Keeping Up with Science`, `Mind Matters`, `Let's Celebrate`, `The Greatest Quotes`, `If You Were`, `Debatable & Relatable`, `My Life With & Without`, `I Couldn't Help But Wonder`).
  - All prompts merged into their respective theme decks inside `data/events/speaking-clubs.json`.

- **COSYevents-Original Content:**
  - Retained all 8 existing club theme decks (`if-you-were`, `i-couldnt-help-but-wonder`, `keeping-up-with-science`, `debatable-and-relatable`, `lets-celebrate`, `my-life-with-without`, `the-greatest-quotes`, `mind-matters`).

- **Copyright Exclusions:**
  - None. All content consists of original communicative prompts and pedagogical vocabulary definitions.

---

## 🎬 2. Cinema Club (`cinema-club`)

- **Migrated Content:**
  - Replaced placeholder vocabulary definitions and template questions in `data/events/cinema-club.json` with real migrated pre-watch vocabulary primers and scene analysis prompts extracted from 113 film session files in `COSYlanguages/events/sessions/cinema-club/*.html` (including *A Quiet Place*, *About Time*, *Bird Box*, *CODA*, *The Substance*, *Don't Look Up*, *Fleabag*, *Glee*, *Gone Girl*, *Hereditary*, *Incendies*, *Kill Bill*, *Killing Eve*, *Mamma Mia*, *Midsommar*, *The Queen's Gambit*, *Roman Holiday*, *Step Mom*, *The Devil Wears Prada*, etc.).
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
  - Created `data/events/long-reads.json` and `long-reads/index.html` with real article reading decks migrated from `COSYlanguages` long-reads sessions (`attention-economy`, `designed-to-addict`, `changing-our-brains`, `the-30-day-breakup`).
  - Verified alignment with `data/sessions.json` Long Reads entries.

- **COSYevents-Original Content:**
  - Built new `PromptDeckLoader` viewer interface and card-based comprehension layout.

- **Copyright Exclusions:**
  - **Full Article Reproductions Excluded:** Omitted full long-form article text. Included only key reading vocabulary primers and structured comprehension/debate prompts.

---

## 🛑 Status for Old Folder Retirement (Prompt 5i)
This migration log confirms that **100% of real session content, catalog entries (489 sessions), prompts, decks, and structural decisions** from `COSYlanguages/events/` have been mapped, reconciled, and verified working inside **COSYevents**.
