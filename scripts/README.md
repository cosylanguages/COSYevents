# Scripts

Tooling for COSYevents. Most scripts run from the repository root and resolve paths
relative to `scripts/..`, so run them with `npm run <name>` where an npm script exists,
or `node scripts/<file>` from the repo root.

Scripts marked with an npm name are exposed in `package.json`; the rest are run directly.

## Build and generate

| Script | npm | What it does |
|---|---|---|
| `build-public.js` | `build-public` | Builds the calendar discovery index from `events/` |
| `build_localized_manifest.js` | `build-i18n`, `check-i18n` | Builds or verifies the localized page manifest |
| `build-sessions.js` | — | Converts Markdown session files under `sessions/<club>/` to HTML |
| `build_basic_speaking_club.js` | `build-basic-speaking-club`, `check-basic-speaking-club` | Builds the A0–A1 Basic Speaking Club pages and Markdown from `data/basic-speaking-club-sessions.json`; `--check` fails if a page is stale |
| `build_science_hub.js` | — | Rebuilds the `keeping-up-with-science.html` hub from its session cards |
| `convert-html-to-md.js` | — | Inverse of `build-sessions`: HTML sessions to Markdown |
| `convert_session.py` | — | Converts a single session export to the repository format |
| `generate-sitemap.js` | `build-sitemap`, `check-sitemap` | Writes `sitemap.xml`; `--check` verifies it is current |
| `fetch_daily_spotlights.js` | `fetch-daily-spotlights` | Fetches the four daily spotlight elements |
| `publish-events.js` | `publish` | Prepares the event catalog for the static site (never uploads session content) |
| `enrich_all_clubs_taxonomy.js` | — | Adds theme and taxonomy fields to `data/sessions.json` |
| `vendor_supabase.js` | — | Vendors the Supabase JS bundle into `shared/vendor/` with a hash check |

## Check and verify

| Script | npm | What it does |
|---|---|---|
| `check_links.js` | `check-links` | Validates every internal link and asset reference |
| `check_redirects.js` | `check-redirects`, `test` | Verifies redirect stubs resolve and match `data/redirect-stubs.json` |
| `check_page_structure.js` | `check-structure` | Enforces structure on all session pages |
| `check-names.js` | — | Fails if a forbidden personal name appears in content |
| `check-gated-pages.js` | `check:gated` | Checks gated pages are marked correctly |
| `check_orphan_classes.js` | `check-orphans` | Finds CSS classes used in HTML but defined nowhere |
| `check_ecosystem_links.js` | — | Verifies outbound COSYlanguages links against `allowed-cosylanguages-paths.txt` |
| `check_hub_links.js` | — | Checks hub pages link to the sessions they should |
| `check_hero_contrast.js` | — | WCAG 2.1 AA contrast check on session hero titles, light and dark |
| `verify_catalog.js` | — | Confirms every session HTML file on disk has a catalog entry |
| `verify_hub_linkage.js` | — | Confirms every French and Russian session is linked from its hub |
| `verify_fidelity.py` | — | Compares converted session output against the source |
| `verify_ui.py`, `verify_audit.js` | — | Playwright walkthroughs of the UI and audit checklist |
| `validate-events.js` | `validate` | Validates `event.json` files against the schemas |
| `audit_gated_markers.js` | — | Reports gated-marker coverage per club |

## Test

| Script | npm | What it does |
|---|---|---|
| `test-no-leak.js` | `test` | Asserts the public export exposes no gated fields |
| `test_studio.js` | `test`, `test-studio` | Unit and schema tests for COSYevents Studio |
| `test_session_publish.js` | `test` | Tests publishing Studio sessions to the repository |
| `test_session_directory.js` | `test` | Tests session directory filtering |
| `test_daily_spotlights.js` | `test`, `test-daily-spotlights` | Tests the daily spotlights feature |
| `test_club_reviews.js` | `test`, `test-club-reviews` | Tests the speaking-club reviews carousel |
| `test_club_music.js` | `test` | Tests speaking-club background music |
| `test_lang.js` | `test-lang` | Tests language handling |
| `test_calendar_i18n.js` | `test-calendar-i18n` | Tests calendar key parity across locales |
| `test_event_filter.js` | `test-event-filter` | Tests event filtering |
| `test_auth.js` | `test-auth` | Tests auth redirect and next-parameter validation |
| `test_auth_e2e.js` | — | End-to-end auth across enabled and disabled modes |
| `test_sso_cms.js` | `test-sso-cms` | Tests cross-domain SSO and CMS overrides |
| `test_vocab_export.js` | `test-vocab-export` | Tests the vocabulary export |
| `test_private_export.js` | `test:private-export` | Tests the private session export |
| `test_round_trip.js` | — | Round-trip verification across 10 clubs, 50 sessions |
| `test_timezones.js` | — | Tests timezone handling |
| `test_hubs_visual.js` | `test:hubs` | Visual tests for hub pages |
| `test_filter_visual.js` | — | Visual tests for filters across viewports |
| `run_db_tests.sh` | `test-db` | Applies migrations to `DATABASE_URL` and runs the DB suites |
| `test_video_meetings_schema.sh` | `test:video-meetings` | Tests the video meetings schema |
| `tests/*.spec.js` | `test-e2e` | Playwright end-to-end specs (see `playwright.config.*`) |

## Authoring and maintenance

| Script | npm | What it does |
|---|---|---|
| `session_new.js` | `session:new` | Creates a repository-hosted session from an export JSON |
| `session_publish.js` | `session:publish` | Publishes a Studio session to the repository |
| `split_sessions.js` | — | Splits a combined session file into per-session files (`--dry-run` supported) |
| `export-vocab.js` | `export-vocab` | Exports the vocabulary dataset |
| `export_private_sessions.js` | `export:private-sessions` | Exports gated session content separately |
| `set_contact.js` | `set-contact`, `check-contact` | Sets or verifies the contact address across pages |
| `inspect_editable.js` | — | Groups broken references by editable region |
| `analyze_broken.js`, `categorize_broken.js` | — | Diagnose and categorise broken references |

## Data files

| File | What it is |
|---|---|
| `schema.sql` | Core database schema |
| `video_meetings_schema.sql` | Video meetings schema |
| `test_video_meetings_schema.sql` | Assertions for the video meetings schema |
| `allowed-cosylanguages-paths.txt` | Allowlist of COSYlanguages paths COSYevents may link to |

Database migrations live in `supabase/migrations/`, not here.
