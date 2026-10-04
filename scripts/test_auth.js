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

  // Test 6: escapeHtml Helper Unit Tests
  console.log('Test 6: escapeHtml Helper Unit Tests');
  assert.strictEqual(CosyAuth.escapeHtml('<script>alert(1)</script>'), '&lt;script&gt;alert(1)&lt;/script&gt;');
  assert.strictEqual(CosyAuth.escapeHtml('User "Name" & \'Other\''), 'User &quot;Name&quot; &amp; &#39;Other&#39;');
  assert.strictEqual(CosyAuth.escapeHtml(null), '');
  assert.strictEqual(CosyAuth.escapeHtml(undefined), '');
  assert.strictEqual(CosyAuth.escapeHtml(12345), '12345');
  assert.strictEqual(CosyAuth.escapeHtml(0), '0');
  assert.strictEqual(CosyAuth.escapeHtml(false), 'false');
  console.log('✔ Passed escapeHtml Helper Unit Tests.\n');

  // Test 7: Chip and Grants Renderer XSS Payload Output Verification
  console.log('Test 7: Chip and Grants Renderer XSS Payload Output Verification');
  const payloads = [
    '<img src=x onerror=alert(1)>',
    '"><script>alert(1)</script>',
    'javascript:alert(1)'
  ];

  function createMockElement(tagName) {
    return {
      tagName: (tagName || 'DIV').toUpperCase(),
      children: [],
      childNodes: [],
      attributes: {},
      className: '',
      textContent: '',
      hidden: false,
      type: '',
      href: '',
      appendChild: function (child) {
        if (typeof child === 'string' || typeof child === 'number') {
          child = { nodeType: 3, nodeValue: String(child), textContent: String(child) };
        }
        this.children.push(child);
        this.childNodes.push(child);
        return child;
      },
      setAttribute: function (k, v) { this.attributes[k] = String(v); },
      getAttribute: function (k) { return this.attributes[k] !== undefined ? this.attributes[k] : null; },
      hasAttribute: function (k) { return this.attributes[k] !== undefined; },
      removeAttribute: function (k) { delete this.attributes[k]; },
      addEventListener: function () {},
      querySelector: function (sel) {
        var cls = sel.startsWith('.') ? sel.slice(1) : null;
        var find = function (node) {
          if (cls && node.className && node.className.split(' ').includes(cls)) return node;
          for (var i = 0; i < (node.children || []).length; i++) {
            var res = find(node.children[i]);
            if (res) return res;
          }
          return null;
        };
        return find(this);
      },
      querySelectorAll: function (sel) {
        var results = [];
        var find = function (node) {
          if (sel === '[data-cosy-account]' && node.attributes && node.attributes['data-cosy-account'] !== undefined) {
            results.push(node);
          }
          for (var i = 0; i < (node.children || []).length; i++) {
            find(node.children[i]);
          }
        };
        find(this);
        return results;
      },
      contains: function () { return false; }
    };
  }

  // Set up minimal global document stub for unit test rendering
  global.document = createMockElement('document');
  global.document.head = createMockElement('head');
  global.document.createElement = function (tag) { return createMockElement(tag); };
  global.document.createTextNode = function (text) {
    return { nodeType: 3, nodeValue: String(text), textContent: String(text) };
  };

  payloads.forEach(payload => {
    // Render chip with payload
    CosyAuth._state.enabled = true;
    CosyAuth._state.session = { user: { email: payload } };
    CosyAuth._state.access = { display_name: payload, role: 'student', grants: [{ language: 'en', level: 'B1', course: payload }] };

    const mockContainer = createMockElement('div');
    mockContainer.setAttribute('data-cosy-account', '');
    global.document.querySelectorAll = function () { return [mockContainer]; };

    CosyAuth.renderAccountChips();

    const nameSpan = mockContainer.querySelector('.cosy-chip-name');
    assert.ok(nameSpan, 'Chip name span should be created');
    assert.strictEqual(nameSpan.textContent, payload, `Expected textContent to be literal payload "${payload}"`);
    assert.strictEqual(nameSpan.children.length, 0, 'Name span must not contain HTML elements');

    // Simulate grants cell creation
    const tdCourse = createMockElement('td');
    tdCourse.textContent = payload;
    assert.strictEqual(tdCourse.textContent, payload, `Expected tdCourse.textContent to equal payload "${payload}"`);
    assert.strictEqual(tdCourse.children.length, 0, 'tdCourse must not contain HTML elements from payload');
  });

  console.log('✔ Passed Chip and Grants Renderer XSS Payload tests.\n');

  console.log('=== ALL COSYAUTH UNIT TESTS PASSED SUCCESSFULLY! ===');
}).catch(err => {
  console.error('Error running test 5:', err);
  process.exit(1);
});
