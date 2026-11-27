/**
 * Tests for publishing Studio sessions to the repository:
 * HTML conversion, publish checks, schema conformance, the file writer,
 * catalog values, and the studio dialog wiring.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const Ajv = require('ajv');

const Studio = require('../shared/js/studio.js');
const { publishSession, resolveClub, parseArgs } = require('./session_publish.js');

const validateSchema = new Ajv({ allErrors: true }).compile(
  JSON.parse(fs.readFileSync(path.join(__dirname, '../schemas/session.schema.json'), 'utf8'))
);

function goodSession(overrides) {
  return Object.assign({
    slug: 'test-publish-session',
    event: 'english-a2-foundations',
    title: 'Test publish',
    theme: 'Daily Life',
    language: 'English',
    level: 'A2',
    date: '2026-11-10',
    host: 'Host',
    summary: 'A short summary.',
    activities: [{ type: 'warmup', title: 'Warm-up', instructions: 'Talk.', content: '<ul><li>First question?</li><li>Second &amp; third?</li></ul><a href="https://example.com/x">Read</a>' }],
    vocabulary: [{ word: 'habit', example: 'A good habit.', level: 'A2', definition: 'Something you do often.' }]
  }, overrides || {});
}

// --- HTML to plain text
console.log('Test: htmlToPlainText');
assert.equal(Studio.htmlToPlainText('<p>One</p><p>Two<br>Three</p>'), 'One\nTwo\nThree');
assert.equal(Studio.htmlToPlainText('<ul><li>A &amp; B</li><li>C</li></ul>'), 'A & B\nC');
assert.ok(!/[<>]/.test(Studio.htmlToPlainText('<div onclick="x()"><script>alert(1)</script>Hi <b>there</b></div>')), 'no tags or script survive');
assert.equal(Studio.htmlToPlainText('<script>alert(1)</script>Safe'), 'Safe');
assert.ok(Studio.htmlToPlainText('<iframe src="https://www.youtube.com/embed/abc"></iframe>').includes('Link: https://www.youtube.com/embed/abc'));
assert.ok(!Studio.htmlToPlainText('<a href="javascript:alert(1)">x</a><a href="http://insecure.test">y</a>').includes('Link:'), 'only https links are kept');
assert.equal(Studio.htmlToPlainText(''), '');
assert.equal(Studio.htmlToPlainText(null), '');

// --- Publish checks
console.log('Test: validateForPublish');
assert.equal(Studio.validateForPublish(goodSession()).filter(p => p.level === 'error').length, 0);
const errs = (o) => Studio.validateForPublish(goodSession(o)).filter(p => p.level === 'error').map(p => p.field);
assert.ok(errs({ slug: 'Bad Slug' }).includes('slug'));
assert.ok(errs({ level: 'Z9' }).includes('level'));
assert.ok(errs({ date: 'tomorrow' }).includes('date'));
assert.ok(errs({ title: '  ' }).includes('title'));
assert.ok(errs({ activities: [] }).includes('activities'));
assert.ok(errs({ vocabulary: [{ word: 'x', example: '' }] }).includes('vocabulary'));
const demo = Studio.validateForPublish(Studio.createStandardFiveStageSession());
assert.ok(demo.some(p => p.level === 'warn' && /demo media/i.test(p.message)), 'template demo media is flagged');
assert.ok(Studio.validateForPublish(goodSession({ summary: 'This is secret.' })).some(p => p.level === 'warn' && p.field === 'content'), 'private-sounding text is flagged');

// --- Repository form conforms to the schema
console.log('Test: toRepositorySession');
const repo = Studio.toRepositorySession(goodSession({ unexpected: 'x', recording_url: 'http://insecure.test', sources: [{ title: 'A', url: 'https://example.com' }, { title: 'B', url: 'javascript:1' }] }));
assert.ok(validateSchema(repo), JSON.stringify(validateSchema.errors));
assert.ok(!('unexpected' in repo), 'unknown fields are dropped');
assert.ok(!('recording_url' in repo), 'non-https recording url is dropped');
assert.equal(repo.sources.length, 1);
assert.equal(repo.activities[0].content, 'First question?\nSecond & third?\nRead\nLink: https://example.com/x');
for (const preset of [Studio.createDefaultSession, Studio.createStandardFiveStageSession, Studio.createScienceClubSession, Studio.createWonderClubSession, Studio.createCinemaClubSession, Studio.createDebateClubSession]) {
  const s = preset(); s.slug = 'preset-check'; s.event = 'english-a2-foundations';
  assert.ok(validateSchema(Studio.toRepositorySession(s)), preset.name + ' converts to a schema-valid session: ' + JSON.stringify(validateSchema.errors));
}

// --- Club resolution
console.log('Test: resolveClub and parseArgs');
const catalog = [
  { href: 'sessions/mind-matters/a.html', club: 'Mind Matters', format: 'Speaking Club' },
  { href: 'sessions/mind-matters/b.html', club: 'Mind Matters', format: 'Speaking Club' },
  { href: 'sessions/cinema-club/c.html', club: 'Cinema Club', format: 'Cinema Club' }
];
assert.deepEqual(resolveClub(catalog, 'mind-matters'), { club: 'Mind Matters', format: 'Speaking Club' });
assert.deepEqual(resolveClub(catalog, 'new-club', 'New', 'Games'), { club: 'New', format: 'Games' });
assert.throws(() => resolveClub(catalog, 'new-club'), /--club-name/);
assert.throws(() => parseArgs(['file.json']), /Usage/);
assert.throws(() => parseArgs(['file.json', '--club', '../evil']), /Invalid club slug/);
assert.deepEqual(parseArgs(['f.json', '--club', 'mind-matters', '--update']), { input: 'f.json', club: 'mind-matters', clubName: null, format: null, update: true });

// --- Writing files in a temp copy of the repo skeleton
console.log('Test: publishSession');
const root = fs.mkdtempSync(path.join(os.tmpdir(), 'cosy-publish-'));
fs.mkdirSync(path.join(root, 'events/english-a2-foundations'), { recursive: true });
fs.mkdirSync(path.join(root, 'data'), { recursive: true });
fs.writeFileSync(path.join(root, 'events/english-a2-foundations/event.json'), JSON.stringify({ slug: 'english-a2-foundations' }));
fs.writeFileSync(path.join(root, 'data/sessions.json'), JSON.stringify(catalog));
const run = (extra) => publishSession(Object.assign({ root, studioSession: goodSession(), club: 'mind-matters', validate: false }, extra));

const created = run();
assert.equal(created.updated, false);
const jsonFile = path.join(root, 'events/english-a2-foundations/sessions/test-publish-session.json');
const pageFile = path.join(root, 'sessions/mind-matters/test-publish-session.html');
assert.ok(validateSchema(JSON.parse(fs.readFileSync(jsonFile, 'utf8'))), 'written session matches the schema');
const pageHtml = fs.readFileSync(pageFile, 'utf8');
assert.ok(pageHtml.includes('<title>Test publish : COSYlanguages</title>'), 'tab title is the session title');
assert.ok(pageHtml.includes('<div class="club-tag">Mind Matters</div>'), 'club tag shows the club name');
const evil = Studio.toRepositorySession(goodSession({ title: '<img src=x onerror=alert(1)> & co' }));
const evilPage = require('./session_publish.js').renderPublicPage({ root, session: evil, clubSlug: 'mind-matters', clubName: 'Mind <b>Matters</b>' });
assert.ok(!/<img src=x/.test(evilPage) && !/<b>Matters/.test(evilPage), 'title and club name are HTML-escaped');
const cat = JSON.parse(fs.readFileSync(path.join(root, 'data/sessions.json'), 'utf8'));
const entry = cat.find(c => c.href === 'sessions/mind-matters/test-publish-session.html');
assert.equal(entry.club, 'Mind Matters');
assert.equal(entry.format, 'Speaking Club');
assert.equal(cat.length, catalog.length + 1);

assert.throws(() => run(), /already exists/, 'never overwrites without update');
const updated = run({ update: true, studioSession: goodSession({ title: 'Renamed' }) });
assert.equal(updated.updated, true);
const cat2 = JSON.parse(fs.readFileSync(path.join(root, 'data/sessions.json'), 'utf8'));
assert.equal(cat2.length, catalog.length + 1, 'update does not duplicate the catalog entry');
assert.ok(cat2.find(c => c.href === 'sessions/mind-matters/test-publish-session.html').title.startsWith('Renamed'));
assert.throws(() => run({ update: true, studioSession: goodSession({ slug: 'never-published' }) }), /does not exist yet/);
assert.throws(() => run({ studioSession: goodSession({ slug: 'other-one', event: 'no-such-event' }) }), /does not exist/);
assert.throws(() => run({ studioSession: goodSession({ slug: 'bad', title: '' }) }), /cannot be published/);

const before = fs.readFileSync(path.join(root, 'data/sessions.json'), 'utf8');
assert.throws(() => run({ studioSession: goodSession({ slug: 'new-club-one' }), club: 'brand-new-club' }), /--club-name/);
assert.equal(fs.readFileSync(path.join(root, 'data/sessions.json'), 'utf8'), before, 'a refused publish writes nothing');
assert.ok(!fs.existsSync(path.join(root, 'events/english-a2-foundations/sessions/new-club-one.json')));
fs.rmSync(root, { recursive: true, force: true });

// --- Studio wiring
console.log('Test: studio dialog wiring');
const html = fs.readFileSync(path.join(__dirname, '../studio.html'), 'utf8');
for (const id of ['publish-modal', 'publish-checks', 'btn-publish-copy', 'btn-publish-download', 'input-publish-club']) {
  assert.ok(html.includes('id="' + id + '"'), 'studio.html has #' + id);
}
const src = fs.readFileSync(path.join(__dirname, '../shared/js/studio.js'), 'utf8');
assert.ok(!/Session saved successfully/.test(src), 'Save no longer claims a save that did not happen');
assert.ok(/openPublishDialog\(\);/.test(src), 'Save opens the publish dialog');
const wf = fs.readFileSync(path.join(__dirname, '../.github/workflows/publish-session.yml'), 'utf8');
const inputLines = wf.split('\n').filter(l => /\$\{\{\s*inputs\./.test(l));
assert.ok(inputLines.length >= 5, 'workflow uses its inputs');
assert.ok(inputLines.every(l => /^\s+[A-Z_]+:\s*\$\{\{\s*inputs\.[a-z_]+\s*\}\}\s*$/.test(l)),
  'every workflow input reaches the shell only through an environment variable: ' + inputLines.filter(l => !/^\s+[A-Z_]+:\s*\$\{\{\s*inputs\.[a-z_]+\s*\}\}\s*$/.test(l)).join(' | '));

console.log('All session publishing tests passed! ✅');
