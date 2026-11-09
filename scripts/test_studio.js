/**
 * scripts/test_studio.js
 * Automated unit and schema validation tests for COSYevents Studio.
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const Ajv = require('ajv');

const Studio = require('../shared/js/studio.js');

console.log('Testing COSYevents Studio logic and access control...\n');

// 1. Role Authorization Check: Only founder, admin, owner allowed
console.log('Test 1: Role Authorization Check (Strict Founder Role)');
assert.strictEqual(Studio.isFounderRole('founder'), true, 'founder should be authorized');
assert.strictEqual(Studio.isFounderRole('admin'), true, 'admin should be authorized');
assert.strictEqual(Studio.isFounderRole('owner'), true, 'owner should be authorized');
assert.strictEqual(Studio.isFounderRole('FOUNDER'), true, 'role check should be case-insensitive');
assert.strictEqual(Studio.isFounderRole(' Admin '), true, 'role check should trim whitespace');

assert.strictEqual(Studio.isFounderRole('student'), false, 'student must NOT be authorized');
assert.strictEqual(Studio.isFounderRole('teacher'), false, 'teacher must NOT be authorized');
assert.strictEqual(Studio.isFounderRole('guest'), false, 'guest must NOT be authorized');
assert.strictEqual(Studio.isFounderRole(null), false, 'null must NOT be authorized');
assert.strictEqual(Studio.isFounderRole(undefined), false, 'undefined must NOT be authorized');
assert.strictEqual(Studio.isFounderRole(''), false, 'empty string must NOT be authorized');
console.log('PASS: Founder role gating correctly restricts access.\n');

// 2. Default Session and Known Sessions Validation against schemas/session.schema.json
console.log('Test 2: Schema Validation of Studio Session Output');
const schemaContent = JSON.parse(fs.readFileSync(path.join(__dirname, '../schemas/session.schema.json'), 'utf8'));
const ajv = new Ajv({ allErrors: true });
const validate = ajv.compile(schemaContent);

const defaultSession = Studio.createDefaultSession();
const isValidDefault = validate(defaultSession);
if (!isValidDefault) {
  console.error('Schema validation errors for default session:', validate.errors);
}
assert.strictEqual(isValidDefault, true, 'Default studio session template must conform to session.schema.json');

for (const sample of Studio.KNOWN_SESSIONS) {
  const isValidSample = validate(sample);
  if (!isValidSample) {
    console.error(`Schema validation errors for sample ${sample.slug}:`, validate.errors);
  }
  assert.strictEqual(isValidSample, true, `Sample session ${sample.slug} must conform to session.schema.json`);
}
console.log('PASS: All studio session templates strictly conform to session.schema.json.\n');

// 3. Verify HTML & CSS files exist and contain required markers
console.log('Test 3: Studio HTML & CSS Asset Integrity');
const htmlContent = fs.readFileSync(path.join(__dirname, '../studio.html'), 'utf8');
assert.ok(htmlContent.includes('styles/studio.css'), 'studio.html links to styles/studio.css');
assert.ok(htmlContent.includes('shared/js/studio.js'), 'studio.html loads shared/js/studio.js');
assert.ok(htmlContent.includes('id="btn-save-session"'), 'studio.html contains save session button');
assert.ok(htmlContent.includes('id="cards-nav-list"'), 'studio.html contains cards outline list');
assert.ok(htmlContent.includes('id="preview-slide-canvas"'), 'studio.html contains live preview canvas');
assert.ok(htmlContent.includes('id="lock-banner"'), 'studio.html contains lock notice banner');

const cssContent = fs.readFileSync(path.join(__dirname, '../styles/studio.css'), 'utf8');
assert.ok(cssContent.includes('.studio-workspace'), 'styles/studio.css styles workspace 3-pane layout');
assert.ok(cssContent.includes('.card-thumb-item'), 'styles/studio.css styles card thumbnails');
assert.ok(cssContent.includes('.slide-canvas'), 'styles/studio.css styles preview slide canvas');
assert.ok(cssContent.includes('.lock-banner'), 'styles/studio.css styles lock banner');
console.log('PASS: Studio HTML & CSS files are complete and properly configured.\n');

console.log('All COSYevents Studio tests passed successfully! ✅');
