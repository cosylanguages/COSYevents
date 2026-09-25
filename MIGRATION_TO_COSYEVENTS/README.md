# Migration to COSYevents Repository

## Overview & Ecosystem Architecture

Per the COSY ecosystem architecture:
- **COSYlanguages** is the principal, fully public entry point where visitors can browse event names, titles, and themes without account login.
- **COSYevents** is the dedicated repo owning full event & session content (interactive prompt decks, session HTML pages, JSON datasets, and materials).

This folder (`MIGRATION_TO_COSYEVENTS/`) contains all existing event/session content exported from `COSYlanguages` and prepared for migration into the `COSYevents` repository.

---

## Folder Structure & Files Prepared for Import

```
MIGRATION_TO_COSYEVENTS/
├── README.md                          <- Migration guide and instructions (this file)
├── data/                              <- Event JSON prompt decks
│   ├── events/                        <- Categorized JSON event decks
│   │   ├── cinema-club.json
│   │   ├── game-evening.json
│   │   ├── karaoke-club.json
│   │   ├── long-reads.json
│   │   └── speaking-clubs.json
│   ├── needs-review.json
│   └── sessions.json                  <- Master catalog of all 600+ sessions
├── sessions/                          <- Full HTML session decks (English & multi-topic)
│   ├── basic-speaking-club/
│   ├── cinema-club/
│   ├── debatable-relatable/
│   ├── i-couldnt-help-but-wonder/
│   ├── if-you-were/
│   ├── karaoke-club/
│   ├── keeping-up-with-science/
│   ├── lets-celebrate/
│   ├── long-reads/
│   ├── mind-matters/
│   ├── my-life-with-without/
│   └── the-greatest-quotes/
├── fr/sessions/                       <- French localized session decks
├── ru/sessions/                       <- Russian localized session decks
└── *.html                             <- Event catalog landing pages (speaking-clubs.html, cinema-club.html, etc.)
```

---

## Target Migration Actions for COSYevents

When working on the **COSYevents** repository follow-up task:

1. **Copy JSON Decks:** Copy `data/events/` and `data/sessions.json` into `data/` in `COSYevents`.
2. **Copy Session HTML Files:** Copy `sessions/`, `fr/sessions/`, and `ru/sessions/` into the root or corresponding directories in `COSYevents`.
3. **Verify Catalog Linkage:** Run `node scripts/verify_catalog.js` and `node scripts/check_hub_links.js` in `COSYevents` to confirm all imported sessions resolve properly.
4. **Access Model:** Maintain restricted access for full session decks in COSYevents for hosts and registered students while keeping event titles/schedules public on COSYlanguages.
