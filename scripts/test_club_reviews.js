/**
 * scripts/test_club_reviews.js
 *
 * Tests for the speaking-club reviews feature:
 * 1. Schema and integrity of `data/club-reviews.json`
 * 2. Multilingual dictionary parity across en, fr, it, ru, el
 * 3. Rendering: stars, localization, escaping, headings
 * 4. Date formatting across locales
 * 5. Mount attributes present on the pages that host the component
 */

const assert = require('assert');
const vm = require('vm');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const REVIEWS_PATH = path.join(ROOT, 'data', 'club-reviews.json');
const {
  renderSection,
  sanitizeHtml,
  formatDate,
  stars,
  clubLabel,
  localized,
  reviewsForMount,
  REVIEWS_I18N,
  CLUB_LABELS,
  CLUB_LABELS_I18N
} = require('../shared/js/club-reviews.js');

const LANGS = ['en', 'fr', 'it', 'ru', 'el'];

console.log('🧪 Starting Club Reviews unit and integrity tests...\n');

// Test 1: JSON structure
console.log('Test 1: Verifying data/club-reviews.json schema...');
assert(fs.existsSync(REVIEWS_PATH), 'data/club-reviews.json must exist');
const data = JSON.parse(fs.readFileSync(REVIEWS_PATH, 'utf-8'));
assert(data.updated_at, 'updated_at is required');
assert(Array.isArray(data.reviews) && data.reviews.length > 0, 'reviews must be a non-empty array');

const seenIds = new Set();
for (const review of data.reviews) {
  assert(typeof review.id === 'string' && review.id.length > 0, 'each review needs an id');
  assert(!seenIds.has(review.id), `duplicate review id: ${review.id}`);
  seenIds.add(review.id);
  assert(typeof review.club === 'string' && review.club.length > 0, `${review.id}: club is required`);
  assert(CLUB_LABELS[review.club], `${review.id}: club "${review.club}" must be a known club slug`);
  assert(typeof review.author === 'string' && review.author.length > 0, `${review.id}: author is required`);
  assert(typeof review.text === 'string' && review.text.trim().length >= 20, `${review.id}: text is required`);
  assert(Number.isInteger(review.rating) && review.rating >= 1 && review.rating <= 5, `${review.id}: rating must be 1-5`);
  assert(/^\d{4}$/.test(review.date), `${review.id}: date must be a 4-digit year`);
  if (review.i18n) {
    for (const lang of Object.keys(review.i18n)) {
      assert(LANGS.includes(lang), `${review.id}: i18n has unsupported language "${lang}"`);
      assert(review.i18n[lang].text, `${review.id}: i18n.${lang}.text is required`);
    }
  }
  // Every review must be readable in every site language: the carousel switches
  // wholesale when the visitor changes language, so a missing locale would leave
  // a stray English (or French) quote in an otherwise translated page.
  for (const lang of LANGS) {
    if (lang === 'en') continue;
    assert(
      review.i18n && review.i18n[lang] && review.i18n[lang].text,
      `${review.id}: missing i18n.${lang}.text — every review needs all site languages`
    );
  }
}
console.log(`  PASS: ${data.reviews.length} reviews are well-formed.\n`);

// Test 2: i18n dictionary parity
console.log('Test 2: Verifying multilingual dictionary parity...');
for (const lang of LANGS) {
  const dict = REVIEWS_I18N[lang];
  assert(dict, `dictionary for "${lang}" must exist`);
  for (const key of ['heading', 'sub', 'share', 'prev', 'next']) {
    assert(typeof dict[key] === 'string' && dict[key].length > 0, `${lang}.${key} required`);
  }
}
console.log('  PASS: All 5 languages complete.\n');

// Test 3: Rendering + localization + escaping
console.log('Test 3: Verifying rendering, localization and escaping...');
const sample = {
  id: 'x',
  club: 'keeping-up-with-science',
  club_name: 'Keeping Up with Science',
  author: 'O\'Brien',
  language: 'English',
  level: 'C1',
  rating: 4,
  date: '2026-09-19',
  text: 'A study <turns> into an "hour" of debate & vocabulary.',
  i18n: {
    fr: { text: 'Une étude <devient> une "heure" de débat & de vocabulaire.' }
  }
};

const enHtml = renderSection([sample], 'en');
assert(enHtml.includes('What our members say'), 'EN heading missing');
assert(enHtml.includes('&lt;turns&gt;'), 'EN text not escaped');
assert(enHtml.includes('&amp; vocabulary'), 'EN ampersand not escaped');
assert(enHtml.includes('O&#39;Brien'), 'EN author apostrophe not escaped');
assert((enHtml.match(/★/g) || []).length === 5, 'expected 5 star elements');
assert((enHtml.match(/is-on/g) || []).length === 4, 'expected 4 filled stars for rating 4');
assert(enHtml.includes('data-reviews-track'), 'carousel track missing');
assert(enHtml.includes('Keeping Up with Science'), 'club label missing');
assert(enHtml.includes('docs.google.com/forms'), 'share link should point to the Google Form');
assert(enHtml.includes('class="club-reviews-share" href="https://docs.google.com/forms/'), 'share anchor malformed');

const frHtml = renderSection([sample], 'fr');
assert(frHtml.includes('Ce que disent nos membres'), 'FR heading missing');
assert(frHtml.includes('Une étude'), 'FR localized text missing');

const ruHtml = renderSection([sample], 'ru');
assert(ruHtml.includes('Что говорят наши участники'), 'RU heading missing');

// Single review must not render nav buttons.
const single = renderSection([sample], 'en');
assert(!single.includes('data-reviews-prev'), 'single review should not render nav');
const multi = renderSection([sample, sample], 'en');
assert(multi.includes('data-reviews-prev') && multi.includes('data-reviews-next'), 'multiple reviews should render nav');
console.log('  PASS: Rendering localizes, escapes, and toggles nav correctly.\n');

// Test 4: Date formatting (year only)
console.log('Test 4: Verifying formatDate renders the year only...');
assert.strictEqual(formatDate('2026-09-19', 'en'), '2026', 'full date should render just the year');
assert.strictEqual(formatDate('2026', 'en'), '2026', 'year-only input should render the year');
assert.strictEqual(formatDate('2026-09-19', 'fr'), '2026', 'year should be locale-independent');
assert.strictEqual(formatDate('', 'en'), '', 'empty date should render empty');
assert.strictEqual(formatDate('no-year', 'en'), '', 'unparseable date should render empty');
console.log('  PASS: Dates render as the year only.\n');

// Test 5: Helpers
console.log('Test 5: Verifying helpers...');
assert.strictEqual(sanitizeHtml('<b>&"\'</b>'), '&lt;b&gt;&amp;&quot;&#39;&lt;/b&gt;');
assert.strictEqual(sanitizeHtml(null), '');
assert.strictEqual(clubLabel({ club: 'mind-matters' }), 'Mind Matters');
assert.strictEqual(clubLabel({ club: 'mind-matters' }, 'fr'), 'Mind Matters');
assert.strictEqual(clubLabel({ club: 'cinema-club' }, 'ru'), 'Киноклуб', 'club names follow the site language');
assert.strictEqual(clubLabel({ club: 'unknown-club', club_name: 'Custom Name' }), 'Custom Name');
assert.strictEqual(localized({ author: 'A', text: 'T' }, 'fr').text, 'T', 'falls back to top-level text');
assert.strictEqual(localized({ author: 'A', text: 'T', i18n: { fr: { text: 'FR' } } }, 'fr').text, 'FR');
assert(stars(0).includes('is-on') === false, 'zero rating should have no filled stars');
console.log('  PASS: Helpers behave as expected.\n');

// Test 5b: One shared carousel
console.log('Test 5b: Verifying every mount shows the whole review set...');
const filterSample = [
  { id: 'a', club: 'mind-matters' },
  { id: 'b', club: 'cinema-club' },
  { id: 'c', club: 'mind-matters' }
];
assert.deepStrictEqual(reviewsForMount(filterSample).map(r => r.id), ['a', 'b', 'c'], 'all reviews are always together');
console.log('  PASS: Reviews are never split by club.\n');

// Test 6: Host page carries the mount + assets
console.log('Test 6: Verifying host page mounts the component...');
const indexHtml = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
assert(/<div id="reviews" data-club-reviews><\/div>/.test(indexHtml), 'index.html: missing reviews mount');
assert(indexHtml.includes('shared/js/club-reviews.js'), 'index.html: missing component script');
assert(indexHtml.includes('shared/css/club-reviews.css'), 'index.html: missing component stylesheet');
console.log('  PASS: index.html mounts the component with the right assets.\n');

// Test 6b: The speaking-clubs hub carries the carousel
console.log('Test 6b: Verifying the speaking-clubs hub mounts the carousel...');
const clubsHub = fs.readFileSync(path.join(ROOT, 'speaking-clubs.html'), 'utf8');
assert(/<div data-club-reviews><\/div>/.test(clubsHub), 'speaking-clubs.html: missing reviews mount');
assert(clubsHub.includes('shared/js/club-reviews.js'), 'speaking-clubs.html: missing component script');
assert(clubsHub.includes('shared/css/club-reviews.css'), 'speaking-clubs.html: missing component stylesheet');
console.log('  PASS: speaking-clubs.html mounts the carousel.\n');

// Test 6c: The hub page the site nav links to also carries the carousel
console.log('Test 6c: Verifying the speaking-clubs/ hub page mounts the carousel...');
const clubsIndex = fs.readFileSync(path.join(ROOT, 'speaking-clubs', 'index.html'), 'utf8');
assert(/<div data-club-reviews><\/div>/.test(clubsIndex), 'speaking-clubs/index.html: missing reviews mount');
assert(clubsIndex.includes('../shared/js/club-reviews.js'), 'speaking-clubs/index.html: missing component script');
assert(clubsIndex.includes('../shared/css/club-reviews.css'), 'speaking-clubs/index.html: missing component stylesheet');
console.log('  PASS: speaking-clubs/index.html mounts the carousel.\n');

// Test 6d: Localized club hubs carry the carousel too
console.log('Test 6d: Verifying localized club hubs mount the carousel...');
for (const lang of ['fr', 'ru']) {
  const hub = fs.readFileSync(path.join(ROOT, lang, 'speaking-clubs.html'), 'utf8');
  assert(/data-club-reviews/.test(hub), `${lang}/speaking-clubs.html: missing reviews mount`);
  assert(hub.includes('../shared/js/club-reviews.js'), `${lang}/speaking-clubs.html: missing component script`);
  assert(hub.includes('../shared/css/club-reviews.css'), `${lang}/speaking-clubs.html: missing component stylesheet`);
}
console.log('  PASS: Localized club hubs mount the carousel.\n');

// Test 6e: The reviews fetch path resolves from every mount depth
console.log('Test 6e: Verifying the reviews path prefix resolves at every depth...');
for (const [pathname, expected] of [
  ['/index.html', ''],
  ['/speaking-clubs.html', ''],
  ['/fr/index.html', '../'],
  ['/speaking-clubs/index.html', '../'],
  ['/fr/speaking-clubs.html', '../'],
  ['/COSYevents/speaking-clubs/index.html', '../']
]) {
  const sandbox = { window: { location: { pathname } }, document: undefined, module: { exports: {} } };
  vm.createContext(sandbox);
  vm.runInContext(fs.readFileSync(path.join(ROOT, 'shared', 'js', 'club-reviews.js'), 'utf8'), sandbox);
  const actual = sandbox.module.exports.getPathPrefix();
  assert.strictEqual(actual, expected, `${pathname}: expected prefix "${expected}", got "${actual}"`);
}
console.log('  PASS: The data path resolves from every mount depth.\n');

// Test 7: Localized hubs mount the component
console.log('Test 7: Verifying localized hubs mount the component...');
for (const lang of ['fr', 'it', 'ru', 'el']) {
  const hub = fs.readFileSync(path.join(ROOT, lang, 'index.html'), 'utf8');
  assert(/data-club-reviews/.test(hub), `${lang}/index.html: missing reviews mount`);
  assert(hub.includes('../shared/js/club-reviews.js'), `${lang}/index.html: missing component script`);
  assert(hub.includes('../shared/css/club-reviews.css'), `${lang}/index.html: missing component stylesheet`);
}
console.log('  PASS: All localized hubs mount the component.\n');

// Test 8: Club pages do not carry their own review carousel
console.log('Test 8: Verifying club pages have no separate review carousel...');
const CLUB_PAGES = [
  'basic-speaking-club.html',
  'intermediate-speaking-club.html',
  'keeping-up-with-science.html',
  'lets-celebrate.html',
  'the-greatest-quotes.html',
  'mind-matters.html',
  'my-life-with-without.html',
  'debatable-relatable.html',
  'i-couldnt-help-but-wonder.html',
  'if-you-were.html',
  'long-reads.html',
  'cinema-club.html',
  'karaoke-club.html',
  'game-evenings.html'
];
for (const file of CLUB_PAGES) {
  const html = fs.readFileSync(path.join(ROOT, file), 'utf8');
  assert(!/data-club-reviews/.test(html), `${file}: reviews must live only in the shared carousel`);
  assert(!html.includes('shared/js/club-reviews.js'), `${file}: should not load the reviews component`);
  assert(!html.includes('shared/css/club-reviews.css'), `${file}: should not load the reviews stylesheet`);
}
console.log(`  PASS: All ${CLUB_PAGES.length} club pages leave reviews to the shared carousel.\n`);

// Test 9: Every mount renders every review, in every site language
console.log('Test 9: Verifying all reviews render together in every language...');
for (const lang of LANGS) {
  const html = renderSection(data.reviews, lang);
  for (const review of data.reviews) {
    const expected = sanitizeHtml(localized(review, lang).text).slice(0, 40);
    assert(html.includes(expected), `${lang}: ${review.id} missing from carousel`);
  }
  const slideCount = (html.match(/class="club-review-slide/g) || []).length;
  assert(slideCount === data.reviews.length, `${lang}: expected ${data.reviews.length} slides, got ${slideCount}`);
  const counter = `1/${data.reviews.length}`;
  assert(html.includes(counter), `${lang}: expected counter ${counter}`);
}
assert(
  reviewsForMount(data.reviews).length === data.reviews.length,
  'reviewsForMount must return every review'
);
console.log(`  PASS: All ${data.reviews.length} reviews render together in all ${LANGS.length} languages.\n`);

console.log('🎉 All Club Reviews tests passed successfully!');
