/**
 * scripts/test_daily_spotlights.js
 *
 * Tests for the daily spotlights functionality:
 * 1. Schema and integrity of `data/daily-spotlights.json`
 * 2. Sanitize and HTML rendering helper unit tests
 * 3. Extraction functions fallback verification
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');

const SPOTLIGHTS_PATH = path.join(__dirname, '..', 'data', 'daily-spotlights.json');
const { renderCard, sanitizeHtml } = require('../shared/js/daily-spotlights.js');
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

// Test 2: HTML rendering and escaping
console.log('Test 2: Verifying renderCard HTML generation and XSS sanitization...');
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

const cardHtml = renderCard('science', mockItem);
assert(cardHtml.includes('daily-spotlight-card spotlight-card-science'), 'Should have correct card class');
assert(cardHtml.includes('&lt;X-Rays&gt; &amp; &quot;Radiation&quot;'), 'Should sanitize title');
assert(cardHtml.includes('1895'), 'Should contain year');
assert(cardHtml.includes('keeping-up-with-science.html'), 'Should link to the science club');
assert(!cardHtml.includes('<X-Rays>'), 'Raw unescaped tags should not be present');
console.log('  PASS: renderCard properly renders and escapes content.\n');

// Test 3: Sanitize helper unit test
console.log('Test 3: Verifying sanitizeHtml unit edge cases...');
assert.strictEqual(sanitizeHtml('<b>Hello</b> & "World"'), '&lt;b&gt;Hello&lt;/b&gt; &amp; &quot;World&quot;');
assert.strictEqual(sanitizeHtml(null), '');
assert.strictEqual(sanitizeHtml(undefined), '');
console.log('  PASS: sanitizeHtml handles special characters and falsy inputs.\n');

// Test 4: Extractor Functions Resilience
console.log('Test 4: Verifying fetch functions return valid structured objects...');
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
