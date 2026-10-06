/**
 * Helper script for `npm run session:new -- <private.json> --club <club> --lang <lang>`
 * 1. Validates and publishes private JSON to Supabase via publish_to_supabase.js
 * 2. Generates the public teaser shell page using build-sessions.js --gated
 * 3. Adds catalog entry to data/sessions.json
 */

const fs = require('fs');
const path = require('path');
const { publishSession } = require('./publish_to_supabase');
const { generateGatedSessionHtml, parseMarkdownFile } = require('./build-sessions');

const ROOT = path.join(__dirname, '..');

function parseArgs(args) {
  let privateJson = null;
  let club = 'mind-matters';
  let lang = 'English';

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--club' && args[i + 1]) {
      club = args[++i];
    } else if (args[i] === '--lang' && args[i + 1]) {
      lang = args[++i];
    } else if (!privateJson && !args[i].startsWith('--')) {
      privateJson = args[i];
    }
  }

  if (!privateJson) {
    throw new Error('Usage: npm run session:new -- <private.json> --club <club> --lang <lang>');
  }

  return { privateJson, club, lang };
}

async function main() {
  const { privateJson, club, lang } = parseArgs(process.argv.slice(2));

  const jsonPath = path.resolve(ROOT, privateJson);
  if (!fs.existsSync(jsonPath)) {
    throw new Error(`Private JSON file not found: ${jsonPath}`);
  }

  const payload = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  const sid = payload.session_id;
  const slug = sid.replace(/^session-/, '').replace(new RegExp(`^${club}-`), '');

  // 1. Publish to Supabase
  console.log(`[1/3] Publishing session ${sid} to Supabase...`);
  await publishSession(jsonPath);

  // 2. Generate Public Teaser Shell Page
  console.log(`[2/3] Generating public gated teaser shell page...`);
  const targetDir = path.join(ROOT, `sessions/${club}`);
  if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });

  const htmlPath = path.join(targetDir, `${slug}.html`);
  const pubData = payload.public || {};

  const markdownMock = {
    title: pubData.title || slug,
    date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
    club_tag: pubData.format || club,
    level: pubData.level || 'B1-B2',
    description: pubData.summary || ''
  };

  const htmlContent = generateGatedSessionHtml(markdownMock, club, sid);
  fs.writeFileSync(htmlPath, htmlContent, 'utf8');
  console.log(`Saved public gated shell page to: sessions/${club}/${slug}.html`);

  // 3. Update data/sessions.json
  console.log(`[3/3] Updating data/sessions.json catalog...`);
  const catalogPath = path.join(ROOT, 'data/sessions.json');
  let catalog = [];
  if (fs.existsSync(catalogPath)) {
    catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));
  }

  const relHref = `sessions/${club}/${slug}.html`;
  const existingIdx = catalog.findIndex(item => item.href === relHref);

  const catalogEntry = {
    title: `${pubData.title || slug} : COSYlanguages`,
    href: relHref,
    level: pubData.level || 'B1-B2',
    lang: lang,
    club: pubData.format || club,
    format: pubData.format || 'Speaking Club'
  };

  if (existingIdx >= 0) {
    catalog[existingIdx] = { ...catalog[existingIdx], ...catalogEntry };
  } else {
    catalog.push(catalogEntry);
  }

  fs.writeFileSync(catalogPath, JSON.stringify(catalog, null, 2) + '\n', 'utf8');
  console.log(`Catalog updated successfully.`);

  console.log(`\n🎉 Session ${sid} successfully processed and published!`);
}

if (require.main === module) {
  main().catch(err => {
    console.error(`Error: ${err.message}`);
    process.exit(1);
  });
}
