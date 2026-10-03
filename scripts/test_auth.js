const assert = require('assert');
const CosyAuth = require('../shared/js/cosy-auth.js');

console.log('=== RUNNING COSYAUTH UNIT TESTS ===\n');

// Test 1: Next Parameter Validation
console.log('Test 1: Next Parameter Validation');
const validCases = [
  ['account.html', 'account.html'],
  ['/COSYevents/hub/', '/COSYevents/hub/'],
  ['speaking-clubs/index.html', 'speaking-clubs/index.html'],
  ['  index.html  ', 'index.html']
];

validCases.forEach(([input, expected]) => {
  const result = CosyAuth.validateNextParam(input, 'index.html');
  assert.strictEqual(result, expected, `Expected ${input} to validate to ${expected}, got ${result}`);
});

const invalidCases = [
  'https://evil.com',
  '//evil.com',
  'javascript:alert(1)',
  '\\\\evil',
  '%2f%2fevil.com',
  'http:\\\\evil.com',
  'ftp://evil.com',
  'data:text/html,evil',
  'https:\\\\evil.com'
];

invalidCases.forEach(input => {
  const result = CosyAuth.validateNextParam(input, 'index.html');
  assert.strictEqual(result, 'index.html', `Expected invalid input "${input}" to fall back to index.html, got "${result}"`);
});
console.log('✔ Passed Next Parameter Validation tests.\n');


// Test 2: Dictionary Key Parity Across All 5 Languages
console.log('Test 2: Dictionary Key Parity');
const dict = CosyAuth.DICTIONARY;
const supportedLangs = ['en', 'fr', 'it', 'ru', 'el'];

supportedLangs.forEach(lang => {
  assert.ok(dict[lang], `Dictionary missing language: ${lang}`);
});

const enKeys = Object.keys(dict.en).sort();

supportedLangs.forEach(lang => {
  const langKeys = Object.keys(dict[lang]).sort();
  assert.deepStrictEqual(langKeys, enKeys, `Keys for ${lang} do not match 'en' keys.\nMissing: ${enKeys.filter(k => !langKeys.includes(k))}\nExtra: ${langKeys.filter(k => !enKeys.includes(k))}`);
});
console.log('✔ Passed Dictionary Key Parity tests.\n');


// Test 3: Access Summarising Helpers
console.log('Test 3: Access Summarising Helpers');
// Mock state
CosyAuth._state.session = { user: { email: 'test@example.com' } };
CosyAuth._state.access = {
  role: 'teacher',
  teaches: ['en', 'fr'],
  grants: [
    { language: 'en', level: 'B2', course: 'Spoken' },
    { language: 'it', level: 'A2', course: 'Travelling' }
  ]
};

assert.strictEqual(CosyAuth.role(), 'teacher');
const userLangs = CosyAuth.languages();
assert.deepStrictEqual(userLangs.sort(), ['en', 'fr', 'it'].sort());
assert.deepStrictEqual(CosyAuth.levelsFor('en'), ['B2']);
assert.deepStrictEqual(CosyAuth.levelsFor('it'), ['A2']);
assert.deepStrictEqual(CosyAuth.levelsFor('ru'), []);
console.log('✔ Passed Access Summarising Helpers tests.\n');


// Test 4: ce-langs Union Logic
console.log('Test 4: ce-langs Union Logic');
// Test pure logic: union of access languages into current myLangs
const currentMyLangs = ['fr', 'ru'];
const accessLangs = ['en', 'fr', 'it'];
const unionResult = [].concat(currentMyLangs);
accessLangs.forEach(l => {
  if (!unionResult.includes(l)) unionResult.push(l);
});

assert.deepStrictEqual(unionResult, ['fr', 'ru', 'en', 'it']);
// Existing languages ('fr', 'ru') preserved!
assert.ok(unionResult.includes('fr') && unionResult.includes('ru'));
console.log('✔ Passed ce-langs Union Logic tests.\n');


// Test 5: Disabled Mode Zero Network Calls
console.log('Test 5: Disabled Mode Zero Network Calls');
CosyAuth._state.session = null;
CosyAuth._state.access = null;
CosyAuth._state.enabled = false;

let fetchCalled = false;
global.fetch = function () {
  fetchCalled = true;
  return Promise.reject(new Error('Fetch should not be called in disabled mode'));
};

CosyAuth.init({ config: { enabled: false } }).then(() => {
  assert.strictEqual(CosyAuth._state.enabled, false);
  assert.strictEqual(CosyAuth.getSession(), null);
  assert.strictEqual(CosyAuth.getAccess(), null);
  assert.strictEqual(fetchCalled, false, 'Fetch was called in disabled mode!');
  console.log('✔ Passed Disabled Mode Zero Network Calls tests.\n');

  console.log('=== ALL COSYAUTH UNIT TESTS PASSED SUCCESSFULLY! ===');
}).catch(err => {
  console.error('Error running test 5:', err);
  process.exit(1);
});
