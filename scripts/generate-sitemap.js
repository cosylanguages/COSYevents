const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const BASE = 'https://cosylanguages.github.io/COSYevents/';

// Pages that must never appear in the sitemap: error pages, auth/private
// surfaces, authoring templates, and client-side redirect stubs.
const EXCLUDED_FILES = new Set([
  '404.html',
  'login.html',
  'account.html',
  'studio.html',
  'live-classroom.html'
]);

const SESSION_DIRS = ['sessions', 'fr/sessions', 'ru/sessions'];
const HUB_INDEXES = [
  'index.html',
  'fr/index.html',
  'ru/index.html',
  'it/index.html',
  'el/index.html',
  'events/index.html',
  'speaking-clubs/index.html',
  'cinema-nights/index.html',
  'teacher-led-sessions/index.html',
  'special-events/index.html'
];

function toPosix(p) {
  return p.split(path.sep).join('/');
}

function listHtml(dir) {
  const abs = path.join(ROOT, dir);
  if (!fs.existsSync(abs)) return [];
  const results = [];
  for (const name of fs.readdirSync(abs)) {
    const rel = `${dir}/${name}`;
    const full = path.join(ROOT, rel);
    if (fs.statSync(full).isDirectory()) {
      results.push(...listHtml(rel));
    } else if (name.endsWith('.html')) {
      results.push(rel);
    }
  }
  return results;
}

function isRedirectStub(relPath) {
  const html = fs.readFileSync(path.join(ROOT, relPath), 'utf8');
  return /http-equiv=["']refresh["']/i.test(html);
}

function isNoindex(relPath) {
  const html = fs.readFileSync(path.join(ROOT, relPath), 'utf8');
  return /<meta\s+name=["']robots["'][^>]*noindex/i.test(html);
}

function collectPages() {
  const pages = new Set();

  for (const name of fs.readdirSync(ROOT)) {
    if (!name.endsWith('.html')) continue;
    if (EXCLUDED_FILES.has(name)) continue;
    pages.add(name);
  }

  for (const hub of HUB_INDEXES) {
    if (fs.existsSync(path.join(ROOT, hub))) pages.add(hub);
  }

  for (const dir of SESSION_DIRS) {
    for (const file of listHtml(dir)) pages.add(file);
  }

  return [...pages]
    .filter((rel) => !rel.startsWith('templates/'))
    .filter((rel) => !isRedirectStub(rel))
    .filter((rel) => !isNoindex(rel))
    .sort();
}

function locFor(relPath) {
  if (relPath === 'index.html') return BASE;
  if (relPath.endsWith('/index.html')) {
    return `${BASE}${relPath.slice(0, -'index.html'.length)}`;
  }
  return `${BASE}${toPosix(relPath)}`;
}

function buildSitemap() {
  const today = new Date().toISOString().slice(0, 10);
  const urls = collectPages().map((rel) => ({ loc: locFor(rel), lastmod: today }));
  const xml = '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    urls.map((u) => `  <url><loc>${u.loc}</loc><lastmod>${u.lastmod}</lastmod></url>`).join('\n') +
    '\n</urlset>\n';
  return { xml, count: urls.length };
}

function main() {
  const check = process.argv.includes('--check');
  const { xml, count } = buildSitemap();
  const target = path.join(ROOT, 'sitemap.xml');

  if (check) {
    const existing = fs.existsSync(target) ? fs.readFileSync(target, 'utf8') : '';
    if (existing !== xml) {
      console.error('❌ sitemap.xml is out of date. Run: npm run build-sitemap');
      process.exit(1);
    }
    console.log(`✅ sitemap.xml is up to date (${count} URLs).`);
    return;
  }

  fs.writeFileSync(target, xml);
  console.log(`✅ sitemap.xml written (${count} URLs).`);
}

if (require.main === module) main();

module.exports = { buildSitemap, collectPages, locFor };
