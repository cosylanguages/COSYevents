import assert from 'assert';
import { exportPassport, importPassport, ALLOWED_SOURCES } from './passport.js';

console.log('Running tests for passport.js...');

// Test 1: exportPassport with empty existing passport creates valid schema
const p1 = exportPassport(null, {
  source: 'COSYevents',
  progress: [{ item: 'speaking_clubs.if_you_were.completed', value: 1 }],
  badges: ['first_club']
}, 'es');

assert.strictEqual(p1.cosy_passport_version, 1);
assert.strictEqual(p1.language, 'es');
assert.strictEqual(p1.progress.length, 1);
assert.strictEqual(p1.progress[0].source, 'COSYevents');
assert.strictEqual(p1.progress[0].item, 'speaking_clubs.if_you_were.completed');
assert.strictEqual(p1.progress[0].value, 1);
assert.deepStrictEqual(p1.badges, ['first_club']);
console.log('✓ Test 1 Passed: exportPassport creates new passport');

// Test 2: exportPassport preserves entries from other sources
const existing = {
  cosy_passport_version: 1,
  language: 'es',
  updated: '2025-01-01T00:00:00.000Z',
  progress: [
    { source: 'COSYtools', item: 'conjugation.verb_practice', value: 5 }
  ],
  badges: ['tool_master']
};

const p2 = exportPassport(existing, {
  source: 'COSYevents',
  progress: [{ item: 'speaking_clubs.mind_matters', value: 2 }],
  badges: ['club_master', 'tool_master']
}, 'es');

assert.strictEqual(p2.progress.length, 2);
assert.strictEqual(p2.progress[0].source, 'COSYtools');
assert.strictEqual(p2.progress[1].source, 'COSYevents');
assert.deepStrictEqual(p2.badges, ['tool_master', 'club_master']);
console.log('✓ Test 2 Passed: exportPassport preserves non-matching sources');

// Test 3: importPassport filters entries by sourceName
const imported = importPassport(p2, 'COSYevents');
assert.strictEqual(imported.version, 1);
assert.strictEqual(imported.language, 'es');
assert.strictEqual(imported.progress.length, 1);
assert.strictEqual(imported.progress[0].source, 'COSYevents');
assert.strictEqual(imported.progress[0].item, 'speaking_clubs.mind_matters');
console.log('✓ Test 3 Passed: importPassport filters by sourceName');

console.log('All passport.js unit tests passed successfully!');
