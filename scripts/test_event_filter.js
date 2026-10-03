const assert = require('assert');
const calendar = require('../shared/calendar/calendar.js');

console.log('=== RUNNING EVENT FILTER UNIT TESTS ===\n');

// Mock events data for testing
const mockEvents = [
  { id: '1', title: 'English Speaking Club', type: 'speaking-club', language: 'English' },
  { id: '2', title: 'French Cinema Night', type: 'cinema-night', language: 'French' },
  { id: '3', title: 'Italian Conversation', type: 'speaking-club', language: 'Italian' },
  { id: '4', title: 'Russian Karaoke', type: 'karaoke', language: 'Russian' },
  { id: '5', title: 'Greek Game Evening', type: 'game-evening', language: 'Greek' },
  { id: '6', title: 'Japanese Special Event', type: 'special-event', language: 'Japanese' }
];

// Test 1: Language Name to Code Mapping
console.log('Test 1: Language Name to Code Mapping');
assert.strictEqual(calendar.langNameToCode('English'), 'en');
assert.strictEqual(calendar.langNameToCode('French'), 'fr');
assert.strictEqual(calendar.langNameToCode('Italian'), 'it');
assert.strictEqual(calendar.langNameToCode('Russian'), 'ru');
assert.strictEqual(calendar.langNameToCode('Greek'), 'el');
assert.strictEqual(calendar.langNameToCode('en'), 'en');
assert.strictEqual(calendar.langNameToCode('Japanese'), 'ja');
console.log('✔ Passed Language Name to Code Mapping tests.');

// Test 2: "all" Selection Passes Everything
console.log('\nTest 2: "all" Selection Passes Everything');
for (const evt of mockEvents) {
  assert.strictEqual(calendar.eventMatches(evt, 'all', 'all'), true, `Event "${evt.title}" must match under "all"`);
}
console.log('✔ Passed "all" Selection tests.');

// Test 3: Array Selection Filtering (["en", "fr"])
console.log('\nTest 3: Array Selection Filtering (["en", "fr"])');
const customSel = ['en', 'fr'];
assert.strictEqual(calendar.eventMatches(mockEvents[0], customSel, 'all'), true, 'English event should match ["en", "fr"]');
assert.strictEqual(calendar.eventMatches(mockEvents[1], customSel, 'all'), true, 'French event should match ["en", "fr"]');
assert.strictEqual(calendar.eventMatches(mockEvents[2], customSel, 'all'), false, 'Italian event should NOT match ["en", "fr"]');
assert.strictEqual(calendar.eventMatches(mockEvents[3], customSel, 'all'), false, 'Russian event should NOT match ["en", "fr"]');
console.log('✔ Passed Array Selection Filtering tests.');

// Test 4: Non-Site Languages (e.g. Japanese) Only Pass Under "all" / "mine" Preset Fallback
console.log('\nTest 4: Unknown / Non-site Languages Behavior');
assert.strictEqual(calendar.eventMatches(mockEvents[5], 'all', 'all'), true, 'Japanese event passes under "all"');
assert.strictEqual(calendar.eventMatches(mockEvents[5], ['en', 'fr', 'it', 'ru', 'el'], 'all'), false, 'Japanese event rejected under custom site lang array');
console.log('✔ Passed Unknown Language tests.');

// Test 5: "mine" Preset Resolution
console.log('\nTest 5: "mine" Preset Resolution');
assert.deepStrictEqual(calendar.resolveSelection('mine', ['en', 'fr'], true), ['en', 'fr'], 'Explicit My Languages resolves to stored array');
assert.strictEqual(calendar.resolveSelection('mine', ['en'], false), 'all', 'Non-explicit My Languages falls back to "all"');
assert.strictEqual(calendar.resolveSelection('all', ['en', 'fr'], true), 'all', '"all" preset stays "all"');
console.log('✔ Passed "mine" Preset Resolution tests.');

// Test 6: Saved JSON Parsing & Fallback Logic
console.log('\nTest 6: Saved Selection Parsing & Fallback');
assert.strictEqual(calendar.parseSelection('all'), 'all');
assert.strictEqual(calendar.parseSelection('mine'), 'mine');
assert.deepStrictEqual(calendar.parseSelection('["en","fr"]'), ['en', 'fr']);
assert.strictEqual(calendar.parseSelection('invalid json'), null);
assert.strictEqual(calendar.parseSelection('{}'), null);
console.log('✔ Passed Saved Selection Parsing tests.');

// Test 7: ?langs Query Parameter Parsing
console.log('\nTest 7: ?langs Query Parameter Parsing');
assert.deepStrictEqual(calendar.parseLangsParam('?langs=en,fr'), ['en', 'fr']);
assert.deepStrictEqual(calendar.parseLangsParam('?langs=EN, FR '), ['en', 'fr']);
assert.deepStrictEqual(calendar.parseLangsParam('?langs=en,unknown,ru'), ['en', 'ru']);
assert.strictEqual(calendar.parseLangsParam('?langs=unknown1,unknown2'), null);
assert.strictEqual(calendar.parseLangsParam('?type=speaking-club'), null);
console.log('✔ Passed ?langs Parameter Parsing tests.');

// Test 8: Combined Type and Language Filter Matching
console.log('\nTest 8: Combined Type and Language Filter Matching');
assert.strictEqual(calendar.eventMatches(mockEvents[0], ['en'], 'speaking-club'), true);
assert.strictEqual(calendar.eventMatches(mockEvents[0], ['en'], 'cinema-night'), false);
assert.strictEqual(calendar.eventMatches(mockEvents[1], ['en'], 'cinema-night'), false);
console.log('✔ Passed Combined Filter Matching tests.');

console.log('\n=== ALL EVENT FILTER UNIT TESTS PASSED SUCCESSFULLY! ===\n');
