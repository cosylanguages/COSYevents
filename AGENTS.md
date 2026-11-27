# AGENTS.md

Repository-specific notes for anyone (human or agent) working in COSYevents.

## Isolation rule

A page may load assets only from its own top-level folder or from `shared/`.
Nothing else. `shared/` is the single cross-cutting folder — there is no
`styles/`, `assets/` or `images/` at the repository root any more.

`node scripts/check_isolation.js` enforces this. It parses every HTML page for
asset references (`link`, `script`, `img`, `source`, `video`, `audio`,
`iframe`, `object`), ignores navigation `<a href>`, and also scans `.js` files
for cross-repo assets fetched at runtime. CI fails on any coupling not already
in `reports/isolation-baseline.json`. After intentionally removing coupling,
regenerate the baseline with `node scripts/check_isolation.js --update` and say
so in the PR.

`manifest.json` stays at the repository root and is allowlisted: its `scope`
and `start_url` resolve relative to the manifest's own location, so moving it
would silently break PWA install.

## Templates are not pages

Files in `templates/` are rendered into pages at a different depth, so their
relative paths must match the **output** depth, not the template's own
location. `sessions/<club>/` is two levels deep, hence `../../shared/...`.

If you move shared assets, update the templates and then **regenerate**, because
generators overwrite their output:

```bash
node scripts/build_basic_speaking_club.js          # then
node scripts/build_basic_speaking_club.js --check  # must be up to date
```

`npm test` runs that check, which is how a template depth mismatch surfaces.

## Tooling with hardcoded paths

Several scripts list asset paths literally. If you move a shared file, grep for
it in `scripts/` before assuming the move is complete:

- `scripts/check_orphan_classes.js` — CSS files scanned for orphan classes
- `scripts/test_studio.js` — asserts `studio.html` links its stylesheet
- `scripts/categorize_broken.js`, `scripts/inspect_editable.js` — do-not-touch lists

## Brand

- `#0abbb5` — primary, from the COSYlanguages logo. Already canonical as
  `--cosy-signal`.
- `#0ca2b0` — secondary. Already canonical as `--cosy-signal-secondary`.
- Terracotta `#B84318` — the COSYevents product accent, canonical as
  `--cosy-events-accent`.

The teal ramp (`--cosy-signal-50` … `-900`) and the semantic aliases
(`--product-signal-*`) live in `shared/css/product-tokens.css`. Numeric steps are
decoration only: the ramp does not adapt to dark mode. Anything textual or a
surface must use the aliases, which resolve through canonical semantic tokens and
therefore follow the dark overrides.

`#0abbb5` is 2.39:1 on white and 2.24:1 on cream. Never set text on it, and never
put white text on it. Text starts at step 700.

`npm run check-contrast` parses the real CSS and asserts these pairs. Update it
when you add a colour, and keep the ratio table in `product-tokens.css` honest.
Visual reference: `docs/design/colors.html` (noindex, so not in the sitemap).

`shared/css/tokens.css` is an entry point that imports the vendored canonical
COSYlanguages tokens, then `shared/css/product-tokens.css`. Put COSYevents-only
tokens in the product layer; never edit `shared/vendor/` by hand (it is
sha256-pinned — `npm run check-vendor`).

## Fonts

`shared/css/tokens.css` imports the vendored `fonts.css`, so every page that
links tokens gets Fraunces (headings), Literata (Cyrillic/Greek headings) and
Commissioner (body). Do not add a second `fonts.css` link to a page.

Before this import existed, only the 5 homepage variants loaded fonts and the
other 706 pages silently fell back to Georgia and system-ui, because the
canonical stacks name fonts that were never actually fetched.

Chrome fetches every subset of a family it uses, so a first visit costs about
360 KB of woff2 regardless of `unicode-range`. They are cached afterwards and
`font-display: swap` keeps text visible, so this is accepted rather than
worked around.

### No third-party font CDNs

643 pages used to load Playfair Display, DM Sans and Nunito from
fonts.googleapis.com. That was an external runtime dependency: it leaked
visitor IPs, broke rendering when the CDN was blocked, and meant the site
depended on a service it does not control.

Those pages now use the self-hosted COSY families: Playfair Display maps to
Fraunces, and DM Sans and Nunito map to Commissioner. `npm run
check-external-fonts` fails if a font CDN link or `@import` returns.

Italic cuts live in `shared/fonts/` and are declared in
`shared/css/product-fonts.css`, because the vendored `fonts.css` ships upright
faces only while 398 pages set italic. Commissioner has no true italic, so body
italics are synthesised; Fraunces and Literata italics are real.

Removing the CDN also invalidated the privacy pages, which disclosed the Google
Fonts request. `privacy.html` and `fr/privacy.html` now state that fonts are
self-hosted. Any future change to hosting or assets must be checked against
those pages.

## Verification

```bash
npm ci          # node_modules is not committed
npm test
npm run check-isolation
npm run check-vendor
node scripts/check_links.js
```
