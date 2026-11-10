#!/usr/bin/env node
/**
 * Publish a COSYevents Studio session to the repository.
 *
 * Usage:
 *   npm run session:publish -- <studio-session.json> --club <club-slug> [--club-name <name> --format <type>] [--update]
 *
 * --club is the sessions/ directory (e.g. mind-matters). Its catalog name and
 * format are taken from that club's existing sessions; a new club must pass
 * --club-name and --format.
 *
 * Takes the JSON the Studio exports (its own format, rich HTML content),
 * checks it, converts it to the public session format, and writes:
 *   events/<event>/sessions/<slug>.json
 *   sessions/<club>/<slug>.html
 *   data/sessions.json            (catalog entry)
 * then validates events and rebuilds the public index.
 *
 * Everything written is public once committed. Nothing is sent to Supabase.
 * Without --update an existing session is never overwritten.
 */
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');

const Studio = require('../shared/js/studio.js');
const { renderSessionPage } = require('./session_new.js');

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function parseArgs(args) {
  let input = null;
  let club = null;
  let clubName = null;
  let format = null;
  let update = false;
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--club' && args[i + 1]) club = args[++i];
    else if (args[i] === '--club-name' && args[i + 1]) clubName = args[++i];
    else if (args[i] === '--format' && args[i + 1]) format = args[++i];
    else if (args[i] === '--update') update = true;
    else if (!input && !args[i].startsWith('--')) input = args[i];
  }
  if (!input || !club) {
    throw new Error('Usage: npm run session:publish -- <studio-session.json> --club <club-slug> [--club-name <name> --format <type>] [--update]');
  }
  if (!SLUG_RE.test(club)) throw new Error(`Invalid club slug "${club}". Use lowercase letters, numbers and hyphens.`);
  return { input, club, clubName, format, update };
}


/**
 * The catalog's `club` and `format` are display values ("Mind Matters",
 * "Speaking Club"), and the directory filters depend on them. For a club that
 * already has sessions, reuse its values; a new club must name both.
 */
function resolveClub(catalog, slug, clubName, format) {
  const counts = new Map();
  for (const item of catalog) {
    if (typeof item.href !== 'string' || item.href.split('/')[1] !== slug || !item.club || !item.format) continue;
    const key = `${item.club}\u0000${item.format}`;
    counts.set(key, (counts.get(key) || 0) + 1);
  }
  let known = null;
  [...counts.entries()].sort((a, b) => b[1] - a[1]).forEach(([key], i) => {
    if (i === 0) { const [club, fmt] = key.split('\u0000'); known = { club, format: fmt }; }
  });
  const club = clubName || (known && known.club);
  const fmt = format || (known && known.format);
  if (!club || !fmt) {
    const slugs = [...new Set(catalog.map(i => (i.href || '').split('/')[1]).filter(Boolean))].sort();
    throw new Error(
      `Club "${slug}" has no sessions in the catalog yet. Pass --club-name and --format ` +
      `(for example --club-name "Mind Matters" --format "Speaking Club"), or use an existing club: ${slugs.join(', ')}.`
    );
  }
  return { club, format: fmt };
}

function escapeHtml(value) {
  return String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

/**
 * The shared page template shows the slug in the tab and club tag. Swap in the
 * real title and club name (escaped) and link the club stylesheet if it exists.
 */
function renderPublicPage({ root, session, clubSlug, clubName }) {
  let page = renderSessionPage(session, clubSlug, session.event);
  page = page.replace(`<title>${session.slug} — COSYevents</title>`, `<title>${escapeHtml(session.title)} : COSYlanguages</title>`);
  page = page.replace(`<div class="club-tag">${clubSlug}</div>`, `<div class="club-tag">${escapeHtml(clubName)}</div>`);
  if (fs.existsSync(path.join(root, 'shared', 'css', 'clubs', `${clubSlug}.css`))) {
    page = page.replace(
      '<link rel="stylesheet" href="../../shared/css/sessions.css">',
      `<link rel="stylesheet" href="../../shared/css/sessions.css">\n  <link rel="stylesheet" href="../../shared/css/clubs/${clubSlug}.css">`
    );
  }
  return page;
}

/**
 * Write a studio session into `root`. Returns the files written.
 * `validate: false` skips the repo-wide validation/build (used by tests).
 */
function publishSession({ root, studioSession, club, clubName, format, update = false, validate = true }) {
  if (!SLUG_RE.test(club)) throw new Error(`Invalid club slug "${club}".`);

  const problems = Studio.validateForPublish(studioSession);
  const errors = problems.filter(p => p.level === 'error');
  if (errors.length) {
    throw new Error('The session cannot be published:\n' + errors.map(e => ` - ${e.message}`).join('\n'));
  }
  const warnings = problems.filter(p => p.level === 'warn');

  const session = Studio.toRepositorySession(studioSession);

  const eventPath = path.join(root, 'events', session.event, 'event.json');
  if (!fs.existsSync(eventPath)) throw new Error(`Event "${session.event}" does not exist at events/${session.event}/event.json.`);
  const eventData = JSON.parse(fs.readFileSync(eventPath, 'utf8'));
  if (eventData.slug !== session.event) throw new Error('Event slug must match the event directory and event.json.');

  const jsonPath = path.join(root, 'events', session.event, 'sessions', `${session.slug}.json`);
  const htmlPath = path.join(root, 'sessions', club, `${session.slug}.html`);
  const exists = fs.existsSync(jsonPath) || fs.existsSync(htmlPath);
  if (exists && !update) {
    throw new Error(`Session "${session.slug}" already exists; pass --update to replace it.`);
  }
  if (!exists && update) {
    throw new Error(`Session "${session.slug}" does not exist yet; publish it without --update.`);
  }

  const catalogPath = path.join(root, 'data', 'sessions.json');
  const catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));
  const href = `sessions/${club}/${session.slug}.html`;
  const resolved = resolveClub(catalog, club, clubName, format);
  const entry = {
    title: `${session.title} : COSYlanguages`,
    href,
    level: session.level,
    lang: session.language,
    club: resolved.club,
    format: resolved.format
  };
  const at = catalog.findIndex(item => item.href === href);
  if (at === -1) catalog.push(entry); else catalog[at] = Object.assign({}, catalog[at], entry);

  fs.mkdirSync(path.dirname(jsonPath), { recursive: true });
  fs.mkdirSync(path.dirname(htmlPath), { recursive: true });
  fs.writeFileSync(jsonPath, JSON.stringify(session, null, 2) + '\n', 'utf8');
  fs.writeFileSync(htmlPath, renderPublicPage({ root, session, clubSlug: club, clubName: resolved.club }), 'utf8');
  fs.writeFileSync(catalogPath, JSON.stringify(catalog, null, 2) + '\n', 'utf8');

  if (validate) {
    execFileSync(process.execPath, [path.join(__dirname, 'validate-events.js')], { cwd: root, stdio: 'inherit' });
    execFileSync(process.execPath, [path.join(__dirname, 'build-public.js')], { cwd: root, stdio: 'inherit' });
  }
  return { session, warnings, files: [jsonPath, htmlPath, catalogPath].map(f => path.relative(root, f)), updated: exists };
}

function main() {
  const { input, club, clubName, format, update } = parseArgs(process.argv.slice(2));
  const root = path.join(__dirname, '..');
  const inputPath = path.resolve(process.cwd(), input);
  if (!fs.existsSync(inputPath)) throw new Error(`Session file not found: ${inputPath}`);
  const studioSession = JSON.parse(fs.readFileSync(inputPath, 'utf8'));
  const result = publishSession({ root, studioSession, club, clubName, format, update });
  result.warnings.forEach(w => console.warn(`warning: ${w.message}`));
  console.log(`${result.updated ? 'Updated' : 'Created'} session "${result.session.slug}":`);
  result.files.forEach(f => console.log(`  ${f}`));
  console.log('All of these files are public once committed. No Supabase upload was performed.');
}

if (require.main === module) {
  try { main(); } catch (error) { console.error(error.message); process.exitCode = 1; }
}

module.exports = { publishSession, parseArgs, resolveClub, renderPublicPage };
