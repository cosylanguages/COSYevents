const assert = require('assert');
const fs = require('fs');
const path = require('path');
const CosyLang = require('../shared/js/cosyevents-lang.js');

console.log('=== RUNNING COSYLANG UNIT TESTS ===\n');

// Mock localStorage / sessionStorage for Node environment
const mockLocalStorage = {};
const mockSessionStorage = {};

global.localStorage = {
  getItem: (k) => mockLocalStorage[k] || null,
  setItem: (k, v) => { mockLocalStorage[k] = String(v); },
  removeItem: (k) => { delete mockLocalStorage[k]; }
};

global.sessionStorage = {
  getItem: (k) => mockSessionStorage[k] || null,
  setItem: (k, v) => { mockSessionStorage[k] = String(v); },
  removeItem: (k) => { delete mockSessionStorage[k]; }
};

// Load real manifest and aliases
const rootDir = path.resolve(__dirname, '..');
const manifest = JSON.parse(fs.readFileSync(path.join(rootDir, 'shared', 'i18n', 'localized-pages.json'), 'utf8'));
const aliases = JSON.parse(fs.readFileSync(path.join(rootDir, 'shared', 'i18n', 'aliases.json'), 'utf8'));

// Test 1: Language Detection
console.log('Test 1: Language Detection');
assert.strictEqual(CosyLang.detectPageLang('fr/sessions/mind-matters/x.html'), 'fr');
assert.strictEqual(CosyLang.detectPageLang('sessions/karaoke-club/it/song.html'), 'it');
assert.strictEqual(CosyLang.detectPageLang('sessions/karaoke-club/es/x.html'), 'en');
assert.strictEqual(CosyLang.detectPageLang('mind-matters.html'), 'en');
assert.strictEqual(CosyLang.detectPageLang('ru/mind-matters.html'), 'ru');
console.log('✔ Passed Language Detection tests.');

// Test 2: Folder Stripping
console.log('\nTest 2: Folder Stripping');
assert.strictEqual(CosyLang.stripLangFolder('fr/sessions/mind-matters/x.html'), 'sessions/mind-matters/x.html');
assert.strictEqual(CosyLang.stripLangFolder('ru/index.html'), 'index.html');
assert.strictEqual(CosyLang.stripLangFolder('mind-matters.html'), 'mind-matters.html');
console.log('✔ Passed Folder Stripping tests.');

// Test 3: Alias Bidirectional Mapping Tests
console.log('\nTest 3: Alias Symmetric Bidirectional Mapping');

// Group 1: 4-day work week (EN, FR, RU)
const g1EN = 'sessions/debatable-relatable/4-day-work-week.html';
const g1FR = 'fr/sessions/debatable-relatable/la-semaine-de-4-jours.html';
const g1RU = 'ru/sessions/debatable-relatable/4-dnevnaya-rabochaya-nedelya.html';

assert.strictEqual(CosyLang.equivalentPath('fr', g1EN, manifest, aliases), g1FR);
assert.strictEqual(CosyLang.equivalentPath('ru', g1EN, manifest, aliases), g1RU);
assert.strictEqual(CosyLang.equivalentPath('en', g1FR, manifest, aliases), g1EN);
assert.strictEqual(CosyLang.equivalentPath('ru', g1FR, manifest, aliases), g1RU);
assert.strictEqual(CosyLang.equivalentPath('en', g1RU, manifest, aliases), g1EN);
assert.strictEqual(CosyLang.equivalentPath('fr', g1RU, manifest, aliases), g1FR);

// Group 2: assisted dying (EN, FR)
const g2EN = 'sessions/debatable-relatable/assisted-dying.html';
const g2FR = 'fr/sessions/debatable-relatable/l-aide-active-a-mourir.html';

assert.strictEqual(CosyLang.equivalentPath('fr', g2EN, manifest, aliases), g2FR);
assert.strictEqual(CosyLang.equivalentPath('en', g2FR, manifest, aliases), g2EN);
// Unmapped target language 'ru' for Group 2 falls back to same-path or hub
assert.strictEqual(CosyLang.equivalentPath('ru', g2EN, manifest, aliases), 'ru/index.html');

// Group 3: wisdom of socrates (EN, FR)
const g3EN = 'sessions/the-greatest-quotes/wisdom-of-socrates.html';
const g3FR = 'fr/sessions/the-greatest-quotes/la-sagesse-de-socrate.html';

assert.strictEqual(CosyLang.equivalentPath('fr', g3EN, manifest, aliases), g3FR);
assert.strictEqual(CosyLang.equivalentPath('en', g3FR, manifest, aliases), g3EN);
// Unmapped target language 'ru' for Group 3 falls back to hub if no same-path page
assert.strictEqual(CosyLang.equivalentPath('ru', g3EN, manifest, aliases), 'ru/index.html');

console.log('✔ Passed Symmetric Alias Mapping tests.');

// Test 4: General Equivalent Path Lookup & Fallback
console.log('\nTest 4: General Equivalent Path & Fallback Lookup');
assert.strictEqual(
  CosyLang.equivalentPath('ru', 'mind-matters.html', manifest, aliases),
  'ru/mind-matters.html'
);

assert.strictEqual(
  CosyLang.equivalentPath('ru', 'karaoke-club.html', manifest, aliases),
  'ru/index.html'
);

assert.strictEqual(
  CosyLang.equivalentPath('en', 'ru/mind-matters.html', manifest, aliases),
  'mind-matters.html'
);

assert.strictEqual(
  CosyLang.equivalentPath('fr', 'it/index.html', manifest, aliases),
  'fr/index.html'
);
console.log('✔ Passed General Equivalent Path tests.');

// Test 5: URL Relativity
console.log('\nTest 5: URL Relativity');
assert.strictEqual(CosyLang.relativeUrl('index.html', 'fr/index.html'), 'fr/index.html');
assert.strictEqual(CosyLang.relativeUrl('fr/index.html', 'index.html'), '../index.html');
assert.strictEqual(CosyLang.relativeUrl('fr/sessions/mind-matters/x.html', 'index.html'), '../../../index.html');
console.log('✔ Passed URL Relativity tests.');

// Test 6: Target Localization (Rule 7)
console.log('\nTest 6: Target Localization (Rule 7)');
assert.strictEqual(
  CosyLang.localizeTarget('fr', '../mind-matters.html', 'fr/index.html', manifest, aliases),
  'mind-matters.html'
);

// When pointing to English page without equivalent, append ?ui=fr
assert.strictEqual(
  CosyLang.localizeTarget('fr', '../sessions/unknown/page.html', 'fr/index.html', manifest, aliases),
  '../sessions/unknown/page.html?ui=fr'
);
console.log('✔ Passed Target Localization tests.');

// Test 7: My Languages Operations
console.log('\nTest 7: My Languages Storage Operations');
mockLocalStorage['ce-langs'] = JSON.stringify(['en']);
CosyLang.addMyLang('fr');
assert.deepStrictEqual(CosyLang.getMyLangs('en'), ['en', 'fr']);

CosyLang.addMyLang('it');
assert.deepStrictEqual(CosyLang.getMyLangs('en'), ['en', 'fr', 'it']);

// Keep at least one language
CosyLang.removeMyLang('it');
CosyLang.removeMyLang('fr');
assert.deepStrictEqual(CosyLang.getMyLangs('en'), ['en']);

// Attempt removing last remaining language
CosyLang.removeMyLang('en');
assert.deepStrictEqual(CosyLang.getMyLangs('en'), ['en']);
console.log('✔ Passed My Languages storage tests.');

console.log('\n=== ALL COSYLANG UNIT TESTS PASSED SUCCESSFULLY! ===\n');
