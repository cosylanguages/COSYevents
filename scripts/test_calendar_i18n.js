const assert = require('assert');
const i18n = require('../shared/calendar/calendar-i18n.js');

console.log('=== RUNNING CALENDAR I18N UNIT TESTS ===\n');

const LANGUAGES = ['en', 'fr', 'it', 'ru', 'el'];
const enKeys = Object.keys(i18n.en);

// Test 1: Key Parity & Non-Empty Values
console.log('Test 1: Key Parity & Non-Empty Values');
for (const lang of LANGUAGES) {
  assert.ok(i18n[lang], `Language "${lang}" must exist in COSY_CAL_I18N`);
  const keys = Object.keys(i18n[lang]);
  assert.deepStrictEqual(keys.sort(), enKeys.sort(), `Keys for "${lang}" must match English keys exactly`);

  for (const k of enKeys) {
    const val = i18n[lang][k];
    assert.ok(typeof val === 'string' && val.trim().length > 0, `Value for key "${k}" in "${lang}" must be non-empty string`);
  }
}
console.log('✔ Passed Key Parity & Non-Empty Value tests.');

// Test 2: Placeholder Preservation
console.log('\nTest 2: Placeholder Preservation');
const placeholderRegex = /\{[a-zA-Z0-9_]+\}/g;

for (const k of enKeys) {
  const enVal = i18n.en[k];
  const enMatches = enVal.match(placeholderRegex) || [];
  if (enMatches.length > 0) {
    for (const lang of LANGUAGES) {
      const langVal = i18n[lang][k];
      const langMatches = langVal.match(placeholderRegex) || [];
      assert.deepStrictEqual(
        langMatches.sort(),
        enMatches.sort(),
        `Placeholders in key "${k}" for language "${lang}" must match English placeholders`
      );
    }
  }
}
console.log('✔ Passed Placeholder Preservation tests.');

// Test 3: Month Formatting for October
console.log('\nTest 3: Month Title Formatting (October 2026)');
const octoberDate = new Date(2026, 9, 1);

function formatMonth(lang) {
  const dtf = new Intl.DateTimeFormat(lang, { month: 'long', year: 'numeric' });
  const parts = dtf.formatToParts(octoberDate);
  let monthStr = '';
  let yearStr = '';
  for (const p of parts) {
    if (p.type === 'month') monthStr = p.value;
    if (p.type === 'year') yearStr = p.value;
  }
  return monthStr.charAt(0).toUpperCase() + monthStr.slice(1);
}

assert.strictEqual(formatMonth('fr'), 'Octobre');
assert.strictEqual(formatMonth('it'), 'Ottobre');
assert.strictEqual(formatMonth('ru'), 'Октябрь');
assert.strictEqual(formatMonth('el'), 'Οκτώβριος');
console.log('✔ Passed Month Title Formatting tests (Octobre, Ottobre, Октябрь, Οκτώβριος).');

// Test 4: Intl.DisplayNames for Language Translation
console.log('\nTest 4: Intl.DisplayNames for Event Languages');
const langMap = {
  Greek: { code: 'el', expected: { el: 'Ελληνικά', it: 'Greco', fr: 'Grec', ru: 'Греческий' } },
  Italian: { code: 'it', expected: { el: 'Ιταλικά', it: 'Italiano', fr: 'Italien', ru: 'Итальянский' } }
};

for (const [englishName, testInfo] of Object.entries(langMap)) {
  for (const [targetLang, expectedVal] of Object.entries(testInfo.expected)) {
    const dn = new Intl.DisplayNames([targetLang], { type: 'language' });
    let localized = dn.of(testInfo.code);
    localized = localized.charAt(0).toUpperCase() + localized.slice(1);
    assert.strictEqual(localized, expectedVal, `Display name of ${englishName} in ${targetLang} should be ${expectedVal}`);
  }
}
console.log('✔ Passed Intl.DisplayNames tests.');

console.log('\n=== ALL CALENDAR I18N UNIT TESTS PASSED SUCCESSFULLY! ===\n');
