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
  renderContainer,
  directorySlotHTML,
  sanitizeHtml,
  formatDisplayDate,
  isStale,
  getLocalDateKey,
  pickDay,
  SPOTLIGHT_I18N,
  STALE_I18N
} = require('../shared/js/daily-spotlights.js');

const {
  fetchCelebration,
  fetchScienceEvent,
  fetchMusicEvent,
  fetchFilmTvEvent,
  completeSentence,
  applyOverrides
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

// Test with i18n field
const mockMultilingualItem = {
  categoryTitle: 'Today in Science',
  title: 'Discovery of X-Rays',
  year: '1895',
  badge: 'Physics',
  description: 'Wilhelm Röntgen discovers X-rays.',
  clubLink: 'keeping-up-with-science.html',
  clubName: 'Keeping Up with Science',
  source: 'Science History',
  sourceUrl: 'https://todayinsci.com/',
  i18n: {
    en: { title: 'Discovery of X-Rays', description: 'Wilhelm Röntgen discovers X-rays.' },
    fr: { title: 'Découverte des rayons X', description: 'Wilhelm Röntgen découvre les rayons X.' },
    it: { title: 'Scoperta dei raggi X', description: 'Wilhelm Röntgen scopre i raggi X.' },
    ru: { title: 'Открытие рентгеновских лучей', description: 'Вильгельм Рентген открывает рентгеновские лучи.' },
    el: { title: 'Ανακάλυψη των ακτίνων Χ', description: 'Ο Βίλχελμ Ρέντγκεν ανακαλύπτει τις ακτίνες Χ.' }
  }
};

// French test
const frCard = renderCard('science', mockMultilingualItem, 'fr', '../');
assert(frCard.includes('Aujourd&#39;hui dans les Sciences'), 'FR title missing');
assert(frCard.includes('Recherche &amp; Découverte'), 'FR badge missing');
assert(frCard.includes('Découverte des rayons X'), 'FR translated content missing');
assert(frCard.includes('Discuter dans Keeping Up with Science'), 'FR discuss action missing');
assert(frCard.includes('href="../keeping-up-with-science.html"'), 'FR relative path prefix missing');

// Russian test
const ruCard = renderCard('celebration', mockMultilingualItem, 'ru', '../');
assert(ruCard.includes('Праздник дня'), 'RU category missing');
assert(ruCard.includes('Открытие рентгеновских лучей'), 'RU translated content missing');
assert(ruCard.includes('Обсудить в Let&#39;s Celebrate'), 'RU discuss action missing');

// Greek test
const elCard = renderCard('music', mockMultilingualItem, 'el', '../');
assert(elCard.includes('Σήμερα στη Μουσική'), 'EL category missing');
assert(elCard.includes('Ανακάλυψη των ακτίνων Χ'), 'EL translated content missing');
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

// Test 4b: A stale payload is labelled, not presented as today's spotlights
console.log('Test 4b: Verifying stale spotlight detection and labels...');
const nowLocal = new Date();
const todayKey = getLocalDateKey(nowLocal);
const yesterdayLocal = new Date(nowLocal.getFullYear(), nowLocal.getMonth(), nowLocal.getDate() - 1);
const yesterdayKey = getLocalDateKey(yesterdayLocal);
const todayPayload = {
  ...data,
  days: undefined,
  date: todayKey,
  month: nowLocal.getMonth() + 1,
  day: nowLocal.getDate(),
  updated_at: nowLocal.toISOString()
};
const stalePayload = {
  ...data,
  days: undefined,
  date: yesterdayKey,
  month: yesterdayLocal.getMonth() + 1,
  day: yesterdayLocal.getDate(),
  updated_at: yesterdayLocal.toISOString()
};
assert.strictEqual(isStale(todayPayload), false, 'today payload must be fresh');
assert.strictEqual(isStale(stalePayload), true, 'yesterday payload must be stale');
const staleHtml = renderContainer(stalePayload, 'en', '', {});
assert(staleHtml.includes('daily-spotlights-stale-badge'), 'stale payload needs a visible badge');
assert(staleHtml.includes('Latest available spotlights'), 'stale payload must not claim to be today');
const freshHtml = renderContainer(todayPayload, 'en', '', {});
assert(!freshHtml.includes('daily-spotlights-stale-badge'), 'fresh payload must not show a stale badge');
for (const lang of languages) {
  assert(STALE_I18N[lang] && STALE_I18N[lang].updated && STALE_I18N[lang].stale_sub.includes('{date}'),
    `${lang} needs a stale label and a {date} placeholder`);
}
console.log('  PASS: Stale payloads are labelled in every language.\n');

// Test 4c: A published day window is read by the reader's local date, not by UTC.
console.log('Test 4c: Verifying local-date selection from a day window...');
const tomorrowLocal = new Date(nowLocal.getFullYear(), nowLocal.getMonth(), nowLocal.getDate() + 1);
const tomorrowKey = getLocalDateKey(tomorrowLocal);
const windowPayload = {
  updated_at: nowLocal.toISOString(),
  display_date: 'Today',
  date: todayKey,
  month: nowLocal.getMonth() + 1,
  day: nowLocal.getDate(),
  items: data.items,
  days: {
    [todayKey]: { display_date: 'Today', items: data.items },
    [tomorrowKey]: {
      display_date: 'Tomorrow',
      items: {
        celebration: { ...data.items.celebration, title: 'Tomorrow celebration' },
        science: { ...data.items.science, title: 'Tomorrow science' }
      }
    }
  }
};
const pickedTomorrow = pickDay(windowPayload, tomorrowKey);
assert.strictEqual(pickedTomorrow.date, tomorrowKey, 'window must resolve the requested local day');
assert.strictEqual(pickedTomorrow.items.celebration.title, 'Tomorrow celebration', 'window must use that day\'s celebration');
assert.strictEqual(pickedTomorrow.items.science.title, 'Tomorrow science', 'window must use that day\'s science');
assert.strictEqual(pickedTomorrow.items.music.latest_available, true, 'a category missing from the day must be flagged');
assert.strictEqual(pickedTomorrow.exact, false, 'a partial day must not be marked exact');
assert.strictEqual(isStale(windowPayload, tomorrowKey), false, 'a covered future day is not stale');
assert.strictEqual(isStale(windowPayload, '2099-01-01'), true, 'an uncovered day must be flagged stale');
assert.strictEqual(pickDay(windowPayload, '2099-01-01').date, todayKey, 'an uncovered day falls back to the file date');
console.log('  PASS: Day windows resolve by local date and flag partial days.\n');

// Test 4c: Descriptions are cut at sentence boundaries, never mid-sentence
console.log('Test 4c: Verifying complete-sentence truncation...');
assert.strictEqual(completeSentence('First sentence. Second sentence is longer.', 20), 'First sentence.');
assert.strictEqual(completeSentence('Short text.', 50), 'Short text.');
const longWord = 'word '.repeat(80);
const cut = completeSentence(longWord, 40);
assert(cut.endsWith('…'), 'no sentence boundary should fall back to an ellipsis');
assert(cut.length <= 41, 'fallback cut must respect the limit');
for (const cat of requiredCategories) {
  const item = data.items[cat];
  assert(item.description.length <= 301, `${cat} description is too long for the card`);
  assert(!/[,\s]$/.test(item.description), `${cat} description ends mid-sentence`);
  for (const [lang, loc] of Object.entries(item.i18n || {})) {
    assert(loc.description.length <= 301, `${cat}.${lang} description is too long`);
    assert(!/[,\s]$/.test(loc.description), `${cat}.${lang} description ends mid-sentence`);
  }
}
console.log('  PASS: Spotlight descriptions end at a sentence or word boundary.\n');

// Test 5: Sanitize helper unit test
console.log('Test 5: Verifying sanitizeHtml unit edge cases...');
assert.strictEqual(sanitizeHtml('<b>Hello</b> & "World"'), '&lt;b&gt;Hello&lt;/b&gt; &amp; &quot;World&quot;');
assert.strictEqual(sanitizeHtml(null), '');
assert.strictEqual(sanitizeHtml(undefined), '');
console.log('  PASS: sanitizeHtml handles special characters and falsy inputs.\n');

// Test 5b: Ecosystem directory embedded in the container (mirrors the hub strip)
console.log('Test 5b: Verifying the embedded "Daily across the COSY ecosystem" line...');
const realData = data; // the on-disk spotlights payload
const withDir = renderContainer(realData, 'en', '', { directory: true });
assert(withDir.includes('data-daily-directory'), 'directory slot missing when opted in');
assert(withDir.includes('data-compact="true"'), 'directory slot must be the compact form');
assert(withDir.includes('data-self="events"'), 'directory slot must mark COSYevents as "You are here"');
assert(withDir.includes('daily-spotlights-directory'), 'directory slot needs its layout class');
assert(withDir.indexOf('daily-spotlights-directory') > withDir.indexOf('daily-spotlights-grid'), 'directory line must follow the cards');

const withoutDir = renderContainer(realData, 'en', '', {});
assert(!withoutDir.includes('data-daily-directory'), 'directory slot must be absent by default');

const localizedDir = renderContainer(realData, 'fr', '', { directory: true });
assert(localizedDir.includes('data-lang="fr"'), 'directory slot must carry the page language');
assert(directorySlotHTML('ru').includes('data-lang="ru"'), 'directorySlotHTML localises the lang attribute');
console.log('  PASS: The compact ecosystem directory embeds inside the container only when opted in.\n');

// Test 5c: Host page wiring
console.log('Test 5c: Verifying the main page mounts the strip with the directory, and only there...');
const INDEX_HTML = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
assert(INDEX_HTML.includes('id="daily-spotlights-root" data-directory="true"'), 'index.html: spotlights root must opt into the directory');
assert(!/data-daily-directory[^>]*data-self="events"/.test(INDEX_HTML), 'index.html: the standalone full directory block should be gone');

const LOCALIZED_PAGES = ['fr/index.html', 'it/index.html', 'ru/index.html', 'el/index.html'];
for (const rel of LOCALIZED_PAGES) {
  const page = fs.readFileSync(path.join(__dirname, '..', rel), 'utf8');
  assert(page.includes('id="daily-spotlights-root"'), `${rel}: spotlights root missing`);
  assert(!page.includes('data-directory="true"'), `${rel}: localized pages must not show the ecosystem directory`);
  assert(!page.includes('data-daily-directory'), `${rel}: localized pages must not mount the directory`);
}
console.log('  PASS: The directory line is on the main page only.\n');

// Test 5d: Curated translation overrides
console.log('Test 5d: Verifying curated translation overrides...');
const overrideOutput = {
  date: '2026-11-24', month: 11, day: 24,
  items: {
    science: {
      i18n: {
        en: { title: 'English title', description: 'English description' },
        fr: { title: 'Titre machine', description: 'Description machine' }
      }
    }
  }
};
applyOverrides(overrideOutput, {
  '2026-11-24': { science: { fr: { description: 'Description vérifiée.' } } }
});
assert.strictEqual(overrideOutput.items.science.i18n.fr.description, 'Description vérifiée.', 'override replaces the description');
assert.strictEqual(overrideOutput.items.science.i18n.fr.title, 'Titre machine', 'unspecified fields keep the machine value');
assert.strictEqual(overrideOutput.items.science.i18n.en.description, 'English description', 'other languages are untouched');
console.log('  PASS: Curated overrides replace only the fields they name.\n');

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
