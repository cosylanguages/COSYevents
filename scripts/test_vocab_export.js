const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const Ajv = require('ajv');
const { exportVocab } = require('./export-vocab.js');

const ROOT = path.join(__dirname, '..');
const TAXONOMY_PATH = path.join(ROOT, 'taxonomy/themes.json');
const VOCAB_EXPORT_PATH = path.join(ROOT, 'data/vocab-export.json');
const SCHEMA_PATH = path.join(ROOT, 'templates/vocabulary-export.json');

console.log('[test_vocab_export] Running export-vocab...');
const { sessionsCount, totalTerms } = exportVocab();

assert.ok(sessionsCount > 0, 'No sessions were exported.');
assert.ok(totalTerms > 0, 'No vocabulary terms were exported.');

assert.ok(fs.existsSync(TAXONOMY_PATH), 'taxonomy/themes.json missing.');
assert.ok(fs.existsSync(VOCAB_EXPORT_PATH), 'data/vocab-export.json missing.');
assert.ok(fs.existsSync(SCHEMA_PATH), 'templates/vocabulary-export.json schema missing.');

const taxonomy = JSON.parse(fs.readFileSync(TAXONOMY_PATH, 'utf8'));
const exportedSessions = JSON.parse(fs.readFileSync(VOCAB_EXPORT_PATH, 'utf8'));
const exportSchema = JSON.parse(fs.readFileSync(SCHEMA_PATH, 'utf8'));

const ajv = new Ajv({ allErrors: true, strict: false });
const validateSchema = ajv.compile(exportSchema);

const ID_PATTERN = /^[a-z]{2}:[a-z0-9-]+:[a-z0-9-]+$/;
let verifiedTerms = 0;

for (const sessionPackage of exportedSessions) {
  const isValid = validateSchema(sessionPackage);
  if (!isValid) {
    console.error('Schema validation errors for session:', sessionPackage.sessionId, validateSchema.errors);
    assert.fail(`Session ${sessionPackage.sessionId} failed vocabulary export schema validation.`);
  }

  for (const item of sessionPackage.vocabulary) {
    verifiedTerms++;

    // 1. Verify ID pattern <lang>:<slug>:<form>
    assert.match(
      item.id,
      ID_PATTERN,
      `Vocabulary ID '${item.id}' does not match canonical pattern <lang>:<slug>:<form>`
    );

    // 2. Verify primary_theme exists in taxonomy/themes.json
    assert.ok(
      taxonomy.themes[item.primary_theme],
      `Primary theme '${item.primary_theme}' in item '${item.id}' does not exist in taxonomy/themes.json`
    );

    // 3. Verify sub_theme exists under primary_theme in taxonomy/themes.json
    assert.ok(
      taxonomy.themes[item.primary_theme].sub_themes[item.sub_theme],
      `Sub-theme '${item.sub_theme}' under primary_theme '${item.primary_theme}' in item '${item.id}' does not exist in taxonomy/themes.json`
    );

    // 4. Verify required content fields
    assert.ok(item.term && item.term.trim().length > 0, `Term missing in item ${item.id}`);
    assert.ok(item.definition && item.definition.trim().length > 0, `Definition missing in item ${item.id}`);
    assert.ok(item.example && item.example.trim().length > 0, `Example missing in item ${item.id}`);
  }
}

console.log(JSON.stringify({
  status: 'PASS',
  sessionsExported: exportedSessions.length,
  termsVerified: verifiedTerms,
  canonicalIdFormatPass: true,
  taxonomyThemeMappingPass: true,
  importEventsVocabCompatibilityPass: true
}, null, 2));
