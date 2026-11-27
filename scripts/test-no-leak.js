const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');

const rootDir = path.join(__dirname, '..');
const eventsDir = path.join(rootDir, 'events');
const publicJsonPath = path.join(rootDir, 'public-events.json');

const sessionRuntimePath = path.join(rootDir, 'shared/js/cosyevents-session.js');
const sessionRuntime = fs.readFileSync(sessionRuntimePath, 'utf8');

if (/\.from\(['"]session_content['"]\)/.test(sessionRuntime) ||
    /initGatedContent|loadSupabaseConfig|loadSupabaseSdk/.test(sessionRuntime)) {
  console.error('FAIL: session runtime must not fetch or gate session content through Supabase.');
  process.exit(1);
}

const { buildSession, renderSessionPage } = require('./session_new');
const generatedSession = buildSession({
  session_id: 'session-demo',
  public: { title: 'Demo Session', format: 'Mind Matters', language: 'English', level: 'B1-B2', summary: 'A sample session.' },
  content: {
    rounds: [{ title: 'Round 1', items: [{ main: 'What do you think?' }] }],
    vocabulary: [{ word: 'resilient', definition: 'Able to recover.', example: 'She is resilient.' }],
    full_notes: 'Facilitator notes'
  },
  sources: [{ title: 'Reference', url: 'https://example.com/source' }],
  recording_url: 'https://example.com/recording'
}, 'english-a2-foundations', 'English');
assert.equal(generatedSession.level, 'B1');
assert.equal(generatedSession.activities[0].content, 'What do you think?');
assert.equal(generatedSession.vocabulary[0].word, 'resilient');
assert.equal(generatedSession.full_notes, 'Facilitator notes');
assert.equal(generatedSession.sources[0].source_url, 'https://example.com/source');
assert.equal(generatedSession.recording_url, 'https://example.com/recording');
const generatedPage = renderSessionPage(generatedSession, 'mind-matters', 'english-a2-foundations');
assert.ok(generatedPage.includes('../../events/english-a2-foundations/sessions/demo.json'));
assert.ok(generatedPage.includes('window.CosySessionRenderer.render'));
assert.ok(generatedPage.includes('class="session-hero"'));
assert.ok(generatedPage.includes('class="content-container"'));
assert.equal((generatedPage.match(/<h1[\s>]/gi) || []).length, 1);
assert.ok(!generatedPage.includes('SUPABASE_URL'));

const publisherPath = path.join(rootDir, 'scripts/publish-events.js');
const publisherSource = fs.readFileSync(publisherPath, 'utf8');

if (/createClient|session_content|SUPABASE_SERVICE_ROLE_KEY|@supabase\/supabase-js/i.test(publisherSource)) {
  console.error('FAIL: npm run publish must build static repository data, not publish to Supabase.');
  process.exit(1);
}

console.log('Building public event data...');
execFileSync(process.execPath, [path.join(__dirname, 'build-public.js')], {
  cwd: rootDir,
  stdio: 'inherit'
});

function fail(message) {
  console.error(`FAIL: ${message}`);
  process.exitCode = 1;
}

if (!fs.existsSync(publicJsonPath)) {
  fail('public-events.json was not generated.');
  process.exit(1);
}

let publicEvents;
try {
  publicEvents = JSON.parse(fs.readFileSync(publicJsonPath, 'utf8'));
} catch (error) {
  fail(`public-events.json is not valid JSON (${error.message}).`);
  process.exit(1);
}

if (!Array.isArray(publicEvents)) {
  fail('Public output must be an array of events.');
  process.exit(1);
}

// Treat the public export as an allowlist: new fields remain private by default.
const allowedEventKeys = new Set([
  'slug', 'title', 'description', 'languages', 'status', 'sessions'
]);
const allowedSessionKeys = new Set(['title', 'theme', 'date', 'language']);

function checkAllowedKeys(value, allowedKeys, label) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    fail(`${label} must be an object.`);
    return;
  }

  for (const key of Object.keys(value)) {
    if (!allowedKeys.has(key)) {
      // Do not print the value: it may be intended to remain private.
      fail(`${label} contains unexpected field "${key}".`);
    }
  }
}

for (const [eventIndex, event] of publicEvents.entries()) {
  const label = `event at index ${eventIndex}`;
  checkAllowedKeys(event, allowedEventKeys, label);

  if (!Array.isArray(event.sessions)) {
    fail(`${label}.sessions must be an array.`);
    continue;
  }

  for (const [sessionIndex, session] of event.sessions.entries()) {
    checkAllowedKeys(session, allowedSessionKeys, `${label}, session ${sessionIndex}`);
  }
}

function findFiles(directory, predicate, results = []) {
  if (!fs.existsSync(directory)) return results;

  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const filePath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      findFiles(filePath, predicate, results);
    } else if (entry.isFile() && predicate(entry.name, filePath)) {
      results.push(filePath);
    }
  }
  return results;
}

const sessionFiles = findFiles(
  eventsDir,
  (name, filePath) =>
    name.endsWith('.json') &&
    name !== 'event.json' &&
    filePath.split(path.sep).includes('sessions')
);

const publicText = fs.readFileSync(publicJsonPath, 'utf8').toLocaleLowerCase('en');
const possibleLeaks = [];

for (const sessionFile of sessionFiles) {
  let sessionData;
  try {
    sessionData = JSON.parse(fs.readFileSync(sessionFile, 'utf8'));
  } catch (error) {
    fail(`Could not parse session JSON at ${path.relative(rootDir, sessionFile)} (${error.message}).`);
    continue;
  }

  const sensitiveStrings = [];
  function collectSensitiveStrings(value, keyPath = '') {
    if (Array.isArray(value)) {
      value.forEach((item, index) => collectSensitiveStrings(item, `${keyPath}[${index}]`));
    } else if (value && typeof value === 'object') {
      for (const [key, item] of Object.entries(value)) {
        collectSensitiveStrings(item, keyPath ? `${keyPath}.${key}` : key);
      }
    } else if (typeof value === 'string' && /^(activities|vocabulary)(\.|\[|$)/.test(keyPath)) {
      const normalized = value.trim().toLocaleLowerCase('en');
      // Short strings often overlap public metadata. The allowlist above is the
      // primary guard; this check catches longer accidental copies of private text.
      if (normalized.length >= 12) sensitiveStrings.push({ field: keyPath, text: normalized });
    }
  }

  collectSensitiveStrings(sessionData);
  for (const item of sensitiveStrings) {
    if (publicText.includes(item.text)) {
      possibleLeaks.push({ file: path.relative(rootDir, sessionFile), field: item.field });
    }
  }
}

if (possibleLeaks.length > 0) {
  for (const leak of possibleLeaks) {
    console.error(`POSSIBLE LEAK: content from ${leak.file} (${leak.field}) appears in public-events.json.`);
  }
  fail('Private session text was found in public output.');
}

if (process.exitCode) {
  console.error('Public export safety checks FAILED.');
  process.exit(1);
}

console.log(`PASS: public export uses allowlisted fields; checked ${publicEvents.length} events and ${sessionFiles.length} session files.`);
console.log('PASS: no matching private activity or vocabulary text found in public output.');
