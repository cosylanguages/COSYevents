# Archived Migration & One-Time Tooling

This directory contains historical one-time migration and generation scripts used during the initial setup, content reconciliation, and catalog expansion of **COSYevents**. They are preserved here as documentation of past data transformations.

---

## 📜 Inventory of Archived Scripts

| Script File | Purpose & Historical Role | Execution Era |
|---|---|---|
| `generate_a0_a1_sessions.js` | Generated initial HTML session files for A0–A1 Basic Speaking Club topics. | May 2024 / Migration Pass 1 |
| `generate_basic_speaking_club_sessions.js` | Automated generation of the 30 adult foundation session HTML pages in `sessions/basic-speaking-club/`. | May 2024 / Migration Pass 1 |
| `update_basic_speaking_club_page.js` | Updated layout, session card grids, and relative links on `basic-speaking-club.html`. | May 2024 / Migration Pass 1 |
| `update_speaking_clubs_json.js` | Inserted the Basic Speaking Club (A0–A1) theme object and prompt decks into `data/events/speaking-clubs.json`. | May 2024 / Migration Pass 1 |
| `update_master_metadata.js` | Populated master metadata, vocabulary decks, and grammar focus rules into `data/events/speaking-clubs.json`. | May 2024 / Migration Pass 1 |
| `update_sessions_catalog.js` | Ingested generated Basic Speaking Club sessions into the master catalog in `data/sessions.json`. | May 2024 / Migration Pass 1 |
| `check_cross_repo_links.js` | Performed one-time validation of cross-repository links, WhatsApp/Telegram contact links, and JSON database paths. | August 2026 / Migration Pass 2 |

---

## ⚡ Active Scripts
Active verification and publication scripts remain in `scripts/`:
- `verify_catalog.js` — Verifies session catalog completeness against disk HTML files.
- `check_hub_links.js` — Checks relative links across localized hub pages.
- `verify_hub_linkage.js` — Confirms localized session visibility on hub pages.
- `publish_to_supabase.js` — Handles Supabase sync for event schedules.
- `convert_session.py` / `verify_ui.py` — Handles session conversion & UI verification routines.
