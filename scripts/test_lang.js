const assert = require('assert');
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

// Fixture Manifest & Aliases
const fixtureManifest = {
  languages: ['fr', 'it', 'ru', 'el'],
  pages: [
    'fr/index.html',
    'fr/mind-matters.html',
    'fr/sessions/mind-matters/x.html',
    'ru/index.html',
    'ru/mind-matters.html',
    'ru/sessions/mind-matters/x.html',
    'it/index.html',
    'el/index.html'
  ]
};

const fixtureAliases = {
  groups: [
    {
      en: 'sessions/debatable-relatable/4-day-work-week.html',
      fr: 'fr/sessions/debatable-relatable/la-semaine-de-4-jours.html',
      ru: 'ru/sessions/debatable-relatable/4-dnevnaya-rabochaya-nedelya.html'
    }
  ]
};

// Test 1: Language Detection
console.log('Test 1: Language Detection');
assert.strictEqual(CosyLang.detectPageLang('fr/sessions/mind-matters/x.html'), 'fr');
assert.strictEqual(CosyLang.detectPageLang('sessions/karaoke-club/it/song.html'), 'it');
assert.strictEqual(CosyLang.detectPageLang('sessions/karaoke-club/es/x.html'), 'en');
assert.strictEqual(CosyLang.detectPageLang('mind-matters.html'), 'en');
assert.strictEqual(CosyLang.detectPageLang('ru/mind-matters.html'), 'ru');
console.log('✔ Passed Language Detection tests.');

// Test 2: Strip Folder
console.log('\nTest 2: Folder Stripping');
assert.strictEqual(CosyLang.stripLangFolder('fr/sessions/mind-matters/x.html'), 'sessions/mind-matters/x.html');
assert.strictEqual(CosyLang.stripLangFolder('ru/index.html'), 'index.html');
assert.strictEqual(CosyLang.stripLangFolder('mind-matters.html'), 'mind-matters.html');
console.log('✔ Passed Folder Stripping tests.');

// Test 3: Equivalent Path Lookup
console.log('\nTest 3: Equivalent Path Lookup');
assert.strictEqual(
  CosyLang.equivalentPath('ru', 'mind-matters.html', fixtureManifest, fixtureAliases),
  'ru/mind-matters.html'
);

assert.strictEqual(
  CosyLang.equivalentPath('ru', 'karaoke-club.html', fixtureManifest, fixtureAliases),
  'ru/index.html'
);

assert.strictEqual(
  CosyLang.equivalentPath('en', 'ru/mind-matters.html', fixtureManifest, fixtureAliases),
  'mind-matters.html'
);

assert.strictEqual(
  CosyLang.equivalentPath('fr', 'it/index.html', fixtureManifest, fixtureAliases),
  'fr/index.html'
);

// Alias group override check
assert.strictEqual(
  CosyLang.equivalentPath('fr', 'sessions/debatable-relatable/4-day-work-week.html', fixtureManifest, fixtureAliases),
  'fr/sessions/debatable-relatable/la-semaine-de-4-jours.html'
);

assert.strictEqual(
  CosyLang.equivalentPath('en', 'fr/sessions/debatable-relatable/la-semaine-de-4-jours.html', fixtureManifest, fixtureAliases),
  'sessions/debatable-relatable/4-day-work-week.html'
);
console.log('✔ Passed Equivalent Path Lookup tests.');

// Test 4: URL Relativity
console.log('\nTest 4: URL Relativity');
assert.strictEqual(CosyLang.relativeUrl('index.html', 'fr/index.html'), 'fr/index.html');
assert.strictEqual(CosyLang.relativeUrl('fr/index.html', 'index.html'), '../index.html');
assert.strictEqual(CosyLang.relativeUrl('fr/sessions/mind-matters/x.html', 'index.html'), '../../../index.html');
console.log('✔ Passed URL Relativity tests.');

// Test 5: Target Localization (Rule 7)
console.log('\nTest 5: Target Localization (Rule 7)');
assert.strictEqual(
  CosyLang.localizeTarget('fr', '../mind-matters.html', 'fr/index.html', fixtureManifest, fixtureAliases),
  'mind-matters.html'
);

// When pointing to English page without equivalent, append ?ui=fr
assert.strictEqual(
  CosyLang.localizeTarget('fr', '../sessions/unknown/page.html', 'fr/index.html', fixtureManifest, fixtureAliases),
  '../sessions/unknown/page.html?ui=fr'
);
console.log('✔ Passed Target Localization tests.');

// Test 6: My Languages Operations
console.log('\nTest 6: My Languages Storage Operations');
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
