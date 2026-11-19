/**
 * scripts/check_redirects.js
 *
 * Guards the client-side redirect stubs that keep legacy URLs alive on GitHub
 * Pages (which cannot serve real 301s). Two guarantees:
 *
 * 1. Every stub's refresh target resolves to a page that actually exists.
 * 2. The set of stubs matches `data/redirect-stubs.json`, so removing one is a
 *    deliberate, reviewable baseline change instead of an accidental dead link.
 *
 * Usage:
 *   node scripts/check_redirects.js            # verify
 *   node scripts/check_redirects.js --update   # rewrite the baseline
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const BASELINE_PATH = path.join(ROOT, 'data', 'redirect-stubs.json');
const SKIP_DIRS = new Set(['.git', 'node_modules', 'verification', '.github']);
const EXTERNAL_HOSTS = new Set(['cosylanguages.github.io']);

function walkHtml(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (SKIP_DIRS.has(entry.name)) continue;
      walkHtml(path.join(dir, entry.name), out);
    } else if (entry.isFile() && entry.name.endsWith('.html')) {
      out.push(path.join(dir, entry.name));
    }
  }
  return out;
}

function extractMetaRefresh(html) {
  const metaTags = html.match(/<meta\b[^>]*>/gi) || [];
  for (const tag of metaTags) {
    if (!/http-equiv\s*=\s*["']refresh["']/i.test(tag)) continue;
    const content = /content\s*=\s*["']([^"']*)["']/i.exec(tag);
    if (!content) continue;
    const url = /url\s*=\s*(.+)$/i.exec(content[1].trim());
    if (!url) continue;
    return url[1].trim().replace(/^["']|["']$/g, '');
  }
  return null;
}

function extractCanonical(html) {
  const linkTags = html.match(/<link\b[^>]*>/gi) || [];
  for (const tag of linkTags) {
    if (!/rel\s*=\s*["']canonical["']/i.test(tag)) continue;
    const href = /href\s*=\s*["']([^"']*)["']/i.exec(tag);
    if (href) return href[1].trim();
  }
  return null;
}

function resolvesToPage(targetPath) {
  if (!fs.existsSync(targetPath)) return false;
  const stat = fs.statSync(targetPath);
  if (stat.isFile()) return true;
  if (stat.isDirectory()) return fs.existsSync(path.join(targetPath, 'index.html'));
  return false;
}

function collectStubs() {
  const stubs = [];
  const problems = [];

  for (const filePath of walkHtml(ROOT)) {
    const html = fs.readFileSync(filePath, 'utf8');
    const target = extractMetaRefresh(html);
    if (!target) continue;

    const relPath = path.relative(ROOT, filePath).split(path.sep).join('/');
    const canonical = extractCanonical(html);

    if (/^https?:\/\//i.test(target)) {
      let host;
      try {
        host = new URL(target).host;
      } catch (e) {
        problems.push(`${relPath}: unparseable redirect target "${target}"`);
        continue;
      }
      if (!EXTERNAL_HOSTS.has(host)) {
        problems.push(`${relPath}: redirects to unvetted external host "${host}"`);
      }
      stubs.push({ path: relPath, target, kind: 'external' });
      continue;
    }

    const base = target.startsWith('/')
      ? path.join(ROOT, target)
      : path.resolve(path.dirname(filePath), target.split('?')[0].split('#')[0]);

    if (!resolvesToPage(base)) {
      problems.push(`${relPath}: redirect target "${target}" does not resolve to a page`);
    }

    if (canonical && canonical !== target) {
      problems.push(`${relPath}: canonical "${canonical}" disagrees with redirect "${target}"`);
    }

    stubs.push({ path: relPath, target, kind: 'internal' });
  }

  stubs.sort((a, b) => a.path.localeCompare(b.path));
  return { stubs, problems };
}

function loadBaseline() {
  if (!fs.existsSync(BASELINE_PATH)) return null;
  return JSON.parse(fs.readFileSync(BASELINE_PATH, 'utf8'));
}

function serialize(stubs) {
  return JSON.stringify(
    {
      note:
        'Redirect stubs keep legacy URLs working on GitHub Pages, which cannot serve 301s. ' +
        'Run `npm run check-redirects -- --update` after intentionally adding or removing one.',
      count: stubs.length,
      stubs
    },
    null,
    2
  ) + '\n';
}

function main() {
  const update = process.argv.includes('--update');
  const { stubs, problems } = collectStubs();

  if (update) {
    fs.writeFileSync(BASELINE_PATH, serialize(stubs));
    console.log(`✅ Recorded ${stubs.length} redirect stubs in data/redirect-stubs.json`);
    if (problems.length) {
      console.log('\n⚠️  Unresolved targets (fix these before relying on the baseline):');
      problems.forEach((p) => console.log(`   - ${p}`));
    }
    process.exit(problems.length ? 1 : 0);
  }

  const baseline = loadBaseline();
  if (!baseline) {
    console.error('❌ Missing data/redirect-stubs.json. Run: npm run check-redirects -- --update');
    process.exit(1);
  }

  const current = new Map(stubs.map((s) => [s.path, s.target]));
  const recorded = new Map(baseline.stubs.map((s) => [s.path, s.target]));
  const drift = [];

  for (const [p, target] of current) {
    if (!recorded.has(p)) drift.push(`added:   ${p} -> ${target}`);
    else if (recorded.get(p) !== target) {
      drift.push(`changed: ${p} -> ${target} (was ${recorded.get(p)})`);
    }
  }
  for (const [p] of recorded) {
    if (!current.has(p)) drift.push(`removed: ${p}`);
  }

  if (problems.length) {
    console.error('❌ Redirect stub problems:');
    problems.forEach((p) => console.error(`   - ${p}`));
  }
  if (drift.length) {
    console.error('❌ Redirect stub inventory changed since the baseline was recorded:');
    drift.forEach((d) => console.error(`   - ${d}`));
    console.error('\n   If intentional, run: npm run check-redirects -- --update');
  }
  if (problems.length || drift.length) process.exit(1);

  console.log(`✅ ${stubs.length} redirect stubs verified; every target resolves.`);
}

main();
