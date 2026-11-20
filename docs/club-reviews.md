# Club Reviews

Learner reviews of the COSYevents speaking clubs. This mirrors the course
reviews carousel on [COSYlanguages](https://cosylanguages.github.io/COSYlanguages/):
one carousel on the main page that shows every review.

Reviews are written by hand. There is no backend yet: the "Share your club
experience" button opens a public Google Form
(`https://docs.google.com/forms/d/e/1FAIpQLSdvd8pfIbBb08n2JcVkG2ThMU_4MRC3K9zqhOERHWJ0bCxVog/viewform`),
and a maintainer copies the response into the data file.

## Files

| File | Purpose |
|---|---|
| `data/club-reviews.json` | The reviews, edited by hand |
| `shared/js/club-reviews.js` | Renders the carousel and wires navigation |
| `shared/css/club-reviews.css` | Styling |
| `scripts/test_club_reviews.js` | Schema, i18n and rendering tests |

## Add a review

Open `data/club-reviews.json` and add an object to the `reviews` array:

```json
{
  "id": "cr-mind-002",
  "club": "mind-matters",
  "club_name": "Mind Matters",
  "author": "Ines",
  "language": "English",
  "level": "B2",
  "rating": 5,
  "date": "2026",
  "featured": true,
  "text": "The review text goes here.",
  "i18n": {
    "fr": { "text": "Le texte de l'avis." },
    "it": { "text": "Il testo della recensione." },
    "ru": { "text": "Текст отзыва." },
    "el": { "text": "Το κείμενο της κριτικής." }
  }
}
```

Field rules (enforced by `npm run test-club-reviews`):

- `id` — unique, any stable string.
- `club` — must be one of the club slugs in `CLUB_LABELS` in
  `shared/js/club-reviews.js` (for example `keeping-up-with-science`).
- `club_name` — the English name, used as a fallback when a club has no entry in
  `CLUB_LABELS_I18N`.
- `author` — display name only; never a full legal name.
- `rating` — integer 1–5, shown as stars.
- `date` — the year only (`YYYY`). Rendered as just the year; the month and day are not shown.
- `text` — the English review. At least 20 characters. Use `\n\n` between
  paragraphs; the carousel preserves the line breaks.
- `i18n` — **required for `fr`, `it`, `ru` and `el`.** The carousel switches
  wholesale with the site language, so every review needs every language; a
  missing locale leaves an untranslated quote on a translated page. `author` can
  be localized too.

The `featured` flag is reserved for future ordering; it is not required.

## Where it appears

Like the course reviews on COSYlanguages, the club reviews live in one place and
are never split up: one carousel holding every review.

```html
<!-- index.html -->
<div data-club-reviews></div>
```

The speaking-clubs hub (`speaking-clubs.html`) mounts the same all-reviews
carousel under its own `#reviews` anchor, and so do the localized hubs (`fr/`,
`it/`, `ru/`, `el/`), the nav's Speaking Clubs hub (`speaking-clubs/index.html`)
and the localized club hubs (`fr/speaking-clubs.html`, `ru/speaking-clubs.html`).
Club pages do not carry their own copy — the reviews stay together in one list.

The language is detected from the page, so the same markup works on the localized
hub pages. The component hides itself when there are no reviews.

The data path is resolved from the page's own depth, so the same mount works at
the site root, one level down (`fr/index.html`) or in a nested hub directory
(`speaking-clubs/index.html`).

## Languages

The interface (heading, sub-heading, share button) and the club names are
translated for `en`, `fr`, `it`, `ru`, `el` in `REVIEWS_I18N` and
`CLUB_LABELS_I18N` inside `shared/js/club-reviews.js`. Every review carries its
own text in all five languages, so the carousel is fully translated as soon as
the visitor picks a language. The review year is shown as-is (no localized month
name).

## Tests

```bash
npm run test-club-reviews
```

Runs as part of `npm test`.
