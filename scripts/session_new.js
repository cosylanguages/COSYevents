#!/usr/bin/env node
/**
 * Create a complete repository-hosted session from a session export JSON.
 *
 * Usage:
 *   npm run session:new -- <session-export.json> --event <event-slug> [--club <club-slug>] [--lang <language>]
 *
 * The resulting JSON and HTML are public repository content. This script never
 * uploads session material to Supabase or another database.
 */
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');

const ROOT = path.join(__dirname, '..');
const CEFR = /A0|A1|A2|B1|B2|C1|C2/i;

function parseArgs(args) {
  let input = null;
  let event = null;
  let club = 'mind-matters';
  let lang = 'English';

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--event' && args[i + 1]) event = args[++i];
    else if (args[i] === '--club' && args[i + 1]) club = args[++i];
    else if (args[i] === '--lang' && args[i + 1]) lang = args[++i];
    else if (!input && !args[i].startsWith('--')) input = args[i];
  }

  if (!input || !event) {
    throw new Error('Usage: npm run session:new -- <session-export.json> --event <event-slug> [--club <club-slug>] [--lang <language>]');
  }
  for (const [label, value] of [['event', event], ['club', club]]) {
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value)) {
      throw new Error(`Invalid ${label} slug "${value}". Use lowercase letters, numbers, and hyphens.`);
    }
  }
  return { input, event, club, lang };
}

function safeHttpsUrl(value) {
  if (typeof value !== 'string' || !value.trim()) return null;
  try {
    const url = new URL(value);
    return url.protocol === 'https:' ? url.href : null;
  } catch {
    return null;
  }
}

function mapActivities(content) {
  if (Array.isArray(content.activities)) {
    return content.activities.map((item, index) => ({
      type: String(item.type || 'activity'),
      title: String(item.title || `Activity ${index + 1}`),
      instructions: String(item.instructions || ''),
      content: String(item.content || '')
    }));
  }

  const rounds = Array.isArray(content.rounds) ? content.rounds : [];
  const activities = rounds.map((round, index) => {
    const items = Array.isArray(round.items) ? round.items : (Array.isArray(round.prompts) ? round.prompts : []);
    const lines = items.map(item => {
      if (typeof item === 'string') return item;
      return String(item.main || item.prompt || item.content || '');
    }).filter(Boolean);
    return {
      type: 'discussion',
      title: String(round.title || `Round ${index + 1}`),
      instructions: String(round.instructions || round.instruction || ''),
      content: lines.join('\n')
    };
  });

  if (activities.length) return activities;

  if (Array.isArray(content.discussion) && content.discussion.length) {
    const grouped = new Map();
    for (const item of content.discussion) {
      const title = String(item.round || 'Discussion');
      if (!grouped.has(title)) grouped.set(title, []);
      grouped.get(title).push(String(item.prompt || item.main || item.content || ''));
    }
    return [...grouped.entries()].map(([title, prompts]) => ({
      type: 'discussion', title, instructions: '', content: prompts.filter(Boolean).join('\n')
    }));
  }
  return [];
}

function buildSession(payload, eventSlug, fallbackLang) {
  const publicData = payload.public || payload.catalog || {};
  const content = payload.content || {};
  const rawId = String(payload.session_id || payload.slug || publicData.slug || '');
  const slugCandidate = String(publicData.slug || rawId.replace(/^session-/, '').replace(/^([a-z0-9-]+)-/, ''));
  const slug = slugCandidate.toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/^-+|-+$/g, '').replace(/-+/g, '-');
  if (!slug || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    throw new Error('Could not derive a valid session slug from session_id/public.slug.');
  }

  const levelMatch = String(publicData.level || publicData.cefr || 'B1').match(CEFR);
  const level = levelMatch ? levelMatch[0].toUpperCase() : null;
  if (!level) throw new Error('A valid CEFR level (A1–C2) is required in public.level.');

  const vocabularyInput = Array.isArray(content.vocabulary) ? content.vocabulary : (Array.isArray(payload.vocabulary) ? payload.vocabulary : []);
  const vocabulary = vocabularyInput.map(item => {
    const word = String(item.word || item.term || '').trim();
    if (!word) return null;
    const vocabLevelMatch = String(item.level || level).match(CEFR);
    return {
      word,
      definition: String(item.definition || ''),
      translation: String(item.translation || ''),
      example: String(item.example || ''),
      level: vocabLevelMatch ? vocabLevelMatch[0].toUpperCase() : level
    };
  }).filter(Boolean);

  const rawSources = Array.isArray(content.sources) ? content.sources : (Array.isArray(payload.sources) ? payload.sources : []);
  const sources = rawSources.map(source => {
    const url = safeHttpsUrl(source.source_url || source.url);
    if (!url) return null;
    return { source_title: String(source.source_title || source.title || url), source_url: url };
  }).filter(Boolean);

  const recordingUrl = safeHttpsUrl(payload.recording_url || content.recording_url);
  const fullNotes = content.full_notes || payload.teacher_notes || payload.full_notes;

  return {
    slug,
    event: eventSlug,
    title: String(publicData.title || payload.title || slug),
    theme: String(publicData.theme || publicData.format || publicData.category || 'Speaking Club'),
    language: String(publicData.language || fallbackLang),
    level,
    date: /^\d{4}-\d{2}-\d{2}$/.test(String(publicData.date || '')) ? String(publicData.date) : new Date().toISOString().slice(0, 10),
    host: String(publicData.host || payload.host || 'COSY Facilitator'),
    summary: String(publicData.summary || publicData.description || payload.summary || ''),
    activities: mapActivities(content),
    vocabulary,
    ...(typeof fullNotes === 'string' && fullNotes.trim() ? { full_notes: fullNotes } : {}),
    ...(recordingUrl ? { recording_url: recordingUrl } : {}),
    ...(sources.length ? { sources } : {})
  };
}

function renderSessionPage(session, clubSlug, eventSlug) {
  const jsonPath = `../../events/${eventSlug}/sessions/${session.slug}.json`;
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${session.slug} — COSYevents</title>
  <meta name="description" content="Complete repository-hosted session materials.">
  <link rel="stylesheet" href="../../shared/css/sessions.css">
</head>
<body>
  <main class="content-container">
    <div id="session-content" aria-live="polite">Loading session…</div>
  </main>
  <script src="../../shared/js/session-renderer.js"></script>
  <script src="../../shared/js/cosyevents-session.js"></script>
  <script>
    (function () {
      var sessionUrl = '${jsonPath}';
      fetch(sessionUrl).then(function (response) {
        if (!response.ok) throw new Error('HTTP ' + response.status);
        return response.json();
      }).then(function (session) {
        var rounds = (session.activities || []).map(function (activity) {
          return {
            title: activity.title,
            instruction: activity.instructions,
            items: String(activity.content || '').split(/\\n+/).filter(Boolean).map(function (prompt) { return { main: prompt }; })
          };
        });
        var model = {
          catalog: { title: session.title, level: session.level, language: session.language, summary: session.summary, format: session.theme },
          content: { vocabulary: session.vocabulary || [], rounds: rounds, full_notes: session.full_notes },
          sources: session.sources || [],
          recording_url: session.recording_url
        };
        window.CosySessionRenderer.render(model, document.getElementById('session-content'));
        document.dispatchEvent(new CustomEvent('cosy:session-rendered'));
      }).catch(function () {
        document.getElementById('session-content').textContent = 'Unable to load this session. Please check the repository files.';
      });
    })();
  </script>
</body>
</html>
`;
}

async function main() {
  const { input, event, club, lang } = parseArgs(process.argv.slice(2));
  const inputPath = path.resolve(ROOT, input);
  if (!fs.existsSync(inputPath)) throw new Error(`Session export not found: ${inputPath}`);

  const eventPath = path.join(ROOT, 'events', event, 'event.json');
  if (!fs.existsSync(eventPath)) throw new Error(`Event ${event} does not exist at events/${event}/event.json.`);

  const payload = JSON.parse(fs.readFileSync(inputPath, 'utf8'));
  const session = buildSession(payload, event, lang);
  const eventData = JSON.parse(fs.readFileSync(eventPath, 'utf8'));
  if (eventData.slug !== event) throw new Error('Event slug must match the event directory and event.json.');

  const sessionDir = path.join(ROOT, 'events', event, 'sessions');
  const pageDir = path.join(ROOT, 'sessions', club);
  fs.mkdirSync(sessionDir, { recursive: true });
  fs.mkdirSync(pageDir, { recursive: true });

  const jsonPath = path.join(sessionDir, `${session.slug}.json`);
  const htmlPath = path.join(pageDir, `${session.slug}.html`);
  if (fs.existsSync(jsonPath) || fs.existsSync(htmlPath)) {
    throw new Error(`Session already exists (${session.slug}); refusing to overwrite repository content.`);
  }

  fs.writeFileSync(jsonPath, JSON.stringify(session, null, 2) + '\n', 'utf8');
  fs.writeFileSync(htmlPath, renderSessionPage(session, club, event), 'utf8');

  const catalogPath = path.join(ROOT, 'data/sessions.json');
  const catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));
  const href = `sessions/${club}/${session.slug}.html`;
  if (catalog.some(item => item.href === href)) throw new Error(`Catalog already contains ${href}.`);
  catalog.push({
    title: `${session.title} : COSYlanguages`,
    href,
    level: session.level,
    lang,
    club,
    format: session.theme
  });
  fs.writeFileSync(catalogPath, JSON.stringify(catalog, null, 2) + '\n', 'utf8');

  execFileSync(process.execPath, [path.join(__dirname, 'validate-events.js')], { cwd: ROOT, stdio: 'inherit' });
  execFileSync(process.execPath, [path.join(__dirname, 'build-public.js')], { cwd: ROOT, stdio: 'inherit' });
  console.log(`Created full repository-hosted session: ${path.relative(ROOT, jsonPath)}`);
  console.log(`Created static session page: ${path.relative(ROOT, htmlPath)}`);
  console.log('All created files are public when committed. No Supabase upload was performed.');
}

if (require.main === module) {
  main().catch(error => {
    console.error(error.message);
    process.exitCode = 1;
  });
}

module.exports = { buildSession, mapActivities, renderSessionPage };
