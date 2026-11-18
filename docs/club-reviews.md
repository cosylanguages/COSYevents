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
    "fr": { "text": "Le texte de l'avis." }
  }
}
```

Field rules (enforced by `npm run test-club-reviews`):

- `id` — unique, any stable string.
- `club` — must be one of the club slugs in `CLUB_LABELS` in
  `shared/js/club-reviews.js` (for example `keeping-up-with-science`).
- `club_name` — the name shown under the quote.
- `author` — display name only; never a full legal name.
- `rating` — integer 1–5, shown as stars.
- `date` — the year only (`YYYY`). Rendered as just the year; the month and day are not shown.
- `text` — the review. At least 20 characters.
- `i18n` — optional. Add localized `text` (and optionally `author`) for any of
  `fr`, `it`, `ru`, `el`. Missing languages fall back to the top-level `text`.

The `featured` flag is reserved for future ordering; it is not required.

## Where it appears

Like the course reviews on COSYlanguages, the club reviews live in one place:
the main `index.html`, showing every review in a single carousel.

```html
<!-- index.html -->
<div data-club-reviews></div>
```

The speaking-clubs hub (`speaking-clubs.html`), where visitors choose a club,
mounts the same all-reviews carousel under its own `#reviews` anchor.

The language is detected from the page, so the same markup works on the localized
hub pages. The component hides itself when there are no reviews.

### Per-club reviews

Each club page carries the reviews for that club only, by naming the club slug on
the mount. The slug must be one of the keys in `CLUB_LABELS`.

```html
<!-- e.g. mind-matters.html -->
<div data-club-reviews="mind-matters"></div>
```

- `data-club-reviews` with no value (or empty) shows every review — this is what
  the main hub carousel uses.
- `data-club-reviews="<slug>"` shows only that club's reviews, and the section
  hides itself when the club has none yet.

The localized hubs (`fr/`, `it/`, `ru/`, `el/`) mount the same carousel as the
English home page and translate the interface automatically.

## Languages

The interface (heading, sub-heading, share button) is translated for
`en`, `fr`, `it`, `ru`, `el` in `REVIEWS_I18N` inside `shared/js/club-reviews.js`.
Review text is only translated when a review provides an `i18n` entry. The review
year is shown as-is (no localized month name).

## Tests

```bash
npm run test-club-reviews
```

Runs as part of `npm test`.
