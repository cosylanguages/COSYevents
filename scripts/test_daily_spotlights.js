/**
 * scripts/test_daily_spotlights.js
 *
 * Tests for the daily spotlights functionality:
 * 1. Schema and integrity of `data/daily-spotlights.json`
 * 2. Sanitize and HTML rendering helper unit tests
 * 3. Multilingual dictionary completeness across en, fr, it, ru, el
 * 4. Localized date formatting and card rendering for each language
 * 5. Extraction functions fallback verification
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');

const SPOTLIGHTS_PATH = path.join(__dirname, '..', 'data', 'daily-spotlights.json');
const {
  renderCard,
  sanitizeHtml,
  formatDisplayDate,
  SPOTLIGHT_I18N
} = require('../shared/js/daily-spotlights.js');

const {
  fetchCelebration,
  fetchScienceEvent,
  fetchMusicEvent,
  fetchFilmTvEvent
} = require('./fetch_daily_spotlights.js');

console.log('🧪 Starting Daily Spotlights unit and integrity tests...\n');

// Test 1: JSON File Structure
console.log('Test 1: Verifying data/daily-spotlights.json schema and completeness...');
assert(fs.existsSync(SPOTLIGHTS_PATH), 'data/daily-spotlights.json must exist');
const rawData = fs.readFileSync(SPOTLIGHTS_PATH, 'utf-8');
const data = JSON.parse(rawData);

assert(data.updated_at, 'updated_at timestamp is required');
assert(data.display_date, 'display_date is required');
assert(data.items, 'items object is required');

const requiredCategories = ['celebration', 'science', 'music', 'film'];
for (const cat of requiredCategories) {
  const item = data.items[cat];
  assert(item, `Category "${cat}" must exist in items`);
  assert(typeof item.title === 'string' && item.title.trim().length > 0, `${cat}.title must be a non-empty string`);
  assert(typeof item.description === 'string' && item.description.trim().length > 0, `${cat}.description must be a non-empty string`);
  assert(typeof item.clubLink === 'string' && item.clubLink.trim().length > 0, `${cat}.clubLink must be a non-empty string`);
  assert(typeof item.clubName === 'string' && item.clubName.trim().length > 0, `${cat}.clubName must be a non-empty string`);
}
console.log('  PASS: All 4 categories present with valid titles, descriptions, and club links.\n');

// Test 2: Multilingual Dictionary Completeness
console.log('Test 2: Verifying multilingual dictionary parity (en, fr, it, ru, el)...');
const languages = ['en', 'fr', 'it', 'ru', 'el'];
for (const lang of languages) {
  const dict = SPOTLIGHT_I18N[lang];
  assert(dict, `Language dictionary for "${lang}" must exist`);
  assert(dict.tag && dict.tag.length > 0, `${lang}.tag required`);
  assert(dict.heading && dict.heading.length > 0, `${lang}.heading required`);
  assert(dict.sub && dict.sub.includes('{date}'), `${lang}.sub must include {date}`);
  assert(dict.discuss_prefix && dict.discuss_prefix.length > 0, `${lang}.discuss_prefix required`);
  assert(dict.source && dict.source.length > 0, `${lang}.source required`);

  for (const cat of requiredCategories) {
    assert(dict.categories[cat], `${lang}.categories.${cat} required`);
    assert(dict.badges[cat], `${lang}.badges.${cat} required`);
    assert(dict.clubs[cat], `${lang}.clubs.${cat} required`);
  }
}
console.log('  PASS: All 5 languages have complete translations for all headings, categories, and clubs.\n');

// Test 3: Localized Card Rendering
console.log('Test 3: Verifying localized card rendering for all languages...');
const mockItem = {
  categoryTitle: 'Today in Science',
  title: 'Discovery of <X-Rays> & "Radiation"',
  year: '1895',
  badge: 'Physics',
  description: 'Wilhelm Röntgen discovers X-rays & investigates properties.',
  clubLink: 'keeping-up-with-science.html',
  clubName: 'Keeping Up with Science',
  source: 'Science History',
  sourceUrl: 'https://todayinsci.com/'
};

// French test
const frCard = renderCard('science', mockItem, 'fr', '../');
assert(frCard.includes('Aujourd&#39;hui dans les Sciences'), 'FR title missing');
assert(frCard.includes('Recherche &amp; Découverte'), 'FR badge missing');
assert(frCard.includes('Discuter dans Keeping Up with Science'), 'FR discuss action missing');
assert(frCard.includes('href="../keeping-up-with-science.html"'), 'FR relative path prefix missing');

// Russian test
const ruCard = renderCard('celebration', mockItem, 'ru', '../');
assert(ruCard.includes('Праздник дня'), 'RU category missing');
assert(ruCard.includes('Обсудить в Let&#39;s Celebrate'), 'RU discuss action missing');

// Greek test
const elCard = renderCard('music', mockItem, 'el', '../');
assert(elCard.includes('Σήμερα στη Μουσική'), 'EL category missing');
assert(elCard.includes('Συζητήστε στο Karaoke Club'), 'EL discuss action missing');

console.log('  PASS: Cards correctly render localized labels, actions, and relative links.\n');

// Test 4: Localized Date Formatting
console.log('Test 4: Verifying formatDisplayDate across languages...');
const testData = { month: 11, day: 11, updated_at: '2026-11-11T12:00:00.000Z' };
const frDate = formatDisplayDate(testData, 'fr');
assert(frDate.toLowerCase().includes('novembre'), `Expected French month in "${frDate}"`);
const ruDate = formatDisplayDate(testData, 'ru');
assert(ruDate.toLowerCase().includes('ноябр'), `Expected Russian month in "${ruDate}"`);
const itDate = formatDisplayDate(testData, 'it');
assert(itDate.toLowerCase().includes('novembre'), `Expected Italian month in "${itDate}"`);
console.log('  PASS: Dates properly localize across locales.\n');

// Test 5: Sanitize helper unit test
console.log('Test 5: Verifying sanitizeHtml unit edge cases...');
assert.strictEqual(sanitizeHtml('<b>Hello</b> & "World"'), '&lt;b&gt;Hello&lt;/b&gt; &amp; &quot;World&quot;');
assert.strictEqual(sanitizeHtml(null), '');
assert.strictEqual(sanitizeHtml(undefined), '');
console.log('  PASS: sanitizeHtml handles special characters and falsy inputs.\n');

// Test 6: Extractor Functions Resilience
console.log('Test 6: Verifying fetch functions return valid structured objects...');
(async () => {
  const cel = await fetchCelebration(11, 11);
  assert.strictEqual(cel.category, 'celebration');
  assert(cel.title.length > 0);
  assert(cel.clubLink.includes('lets-celebrate.html'));

  const sci = await fetchScienceEvent(11, 11);
  assert.strictEqual(sci.category, 'science');
  assert(sci.title.length > 0);
  assert(sci.clubLink.includes('keeping-up-with-science.html'));

  const mus = await fetchMusicEvent();
  assert.strictEqual(mus.category, 'music');
  assert(mus.title.length > 0);
  assert(mus.clubLink.includes('karaoke-club.html'));

  const flm = await fetchFilmTvEvent();
  assert.strictEqual(flm.category, 'film');
  assert(flm.title.length > 0);
  assert(flm.clubLink.includes('cinema-nights'));

  console.log('  PASS: All extractor functions return valid structured objects.\n');
  console.log('🎉 All Daily Spotlights tests passed successfully!');
})().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});
