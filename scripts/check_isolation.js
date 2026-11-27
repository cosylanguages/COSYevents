#!/usr/bin/env node

/**
 * Isolation check.
 *
 * Enforces the promise that a page only depends on its own product folder plus
 * `shared/`. Anything else is coupling that makes "delete a folder, nothing
 * breaks" untrue.
 *
 *   node scripts/check_isolation.js            # check against the ratchet baseline
 *   node scripts/check_isolation.js --update   # rewrite baseline + markdown report
 *
 * Two violation classes are tracked:
 *
 *   cross-repo    an asset is loaded from another COSY repository at runtime
 *   cross-folder  a page loads a local asset that lives in a different
 *                 top-level product folder (shared/ excluded)
 *
 * The baseline grandfathers today's debt. CI fails only when a page adds a new
 * dependency, so the count can go down but never up.
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const BASELINE_PATH = path.join(ROOT, 'reports', 'isolation-baseline.json');
const REPORT_PATH = path.join(ROOT, 'reports', 'isolation-report.md');

const SKIP_DIRS = new Set(['.git', 'node_modules', 'verification', 'reports']);
const JS_SKIP_DIRS = new Set([...SKIP_DIRS, 'scripts', 'supabase']);
const ECOSYSTEM_HOSTS = new Set(['cosylanguages.github.io']);
// Site-level files that must stay at the repository root: the PWA manifest's
// scope and start_url resolve relative to the manifest's own location.
const SITE_FILES = new Set(['manifest.json', 'robots.txt', 'sitemap.xml']);
const SELF_REPO = 'COSYevents';

const ASSET_ATTRS = {
  link: ['href'],
  script: ['src'],
  img: ['src', 'data-src', 'srcset'],
  source: ['src', 'srcset'],
  video: ['src', 'poster'],
  audio: ['src'],
  iframe: ['src'],
  embed: ['src'],
  track: ['src'],
  object: ['data'],
};

const LINK_ASSET_RELS = new Set([
  'stylesheet', 'preload', 'icon', 'apple-touch-icon', 'manifest', 'modulepreload',
]);

function walkHtml(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith('.') && entry.name !== '.nojekyll') continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (SKIP_DIRS.has(entry.name)) continue;
      walkHtml(full, out);
    } else if (entry.isFile() && entry.name.endsWith('.html')) {
      out.push(full);
    }
  }
  return out;
}

function walkFiles(dir, ext, skip, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith('.') && entry.name !== '.nojekyll') continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (skip.has(entry.name)) continue;
      walkFiles(full, ext, skip, out);
    } else if (entry.isFile() && entry.name.endsWith(ext)) {
      out.push(full);
    }
  }
  return out;
}

function parseAttrs(attrStr) {
  const attrs = {};
  const re = /([a-zA-Z0-9:_-]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/g;
  let m;
  while ((m = re.exec(attrStr)) !== null) {
    attrs[m[1].toLowerCase()] = m[2] !== undefined ? m[2] : (m[3] !== undefined ? m[3] : m[4]);
  }
  return attrs;
}

/** Returns every asset URL referenced by a page. */
function extractAssetRefs(html) {
  const refs = new Set();
  const tagRe = /<([a-zA-Z][a-zA-Z0-9-]*)\b([^>]*)>/g;
  let tag;
  while ((tag = tagRe.exec(html)) !== null) {
    const name = tag[1].toLowerCase();
    const wanted = ASSET_ATTRS[name];
    if (!wanted) continue;
    const attrs = parseAttrs(tag[2]);
    if (name === 'link') {
      const rels = (attrs.rel || '').toLowerCase().split(/\s+/).filter(Boolean);
      if (!rels.some((r) => LINK_ASSET_RELS.has(r))) continue;
    }
    for (const attr of wanted) {
      const value = attrs[attr];
      if (!value) continue;
      if (attr === 'srcset') {
        value.split(',').forEach((part) => {
          const url = part.trim().split(/\s+/)[0];
          if (url) refs.add(url);
        });
      } else {
        refs.add(value.trim());
      }
    }
  }
  return refs;
}

function isIgnorable(url) {
  return !url || url.startsWith('#') || /^(data|mailto|tel|javascript|blob):/i.test(url);
}

function topFolder(relPath) {
  const parts = relPath.split(path.sep).join('/').split('/');
  return parts.length <= 1 ? '.' : parts[0];
}

function repoFromRemote(url) {
  let host;
  let pathname;
  try {
    const u = new URL(url.startsWith('//') ? `https:${url}` : url);
    host = u.hostname;
    pathname = u.pathname;
  } catch {
    return null;
  }
  if (!ECOSYSTEM_HOSTS.has(host)) return null;
  const repo = pathname.split('/').filter(Boolean)[0];
  return repo || null;
}

function analyse() {
  const pages = walkHtml(ROOT);
  const crossRepo = {}; // page -> Set(repo)
  const edges = new Map(); // "pageFolder -> assetFolder" -> Set(page)
  const selfAbsolute = new Set();
  const missingLocal = new Map();
  let crossRepoRefCount = 0;

  for (const absPage of pages) {
    const pageRel = path.relative(ROOT, absPage).split(path.sep).join('/');
    const pageDir = path.dirname(absPage);
    const pageFolder = topFolder(pageRel);

    for (const url of extractAssetRefs(fs.readFileSync(absPage, 'utf8'))) {
      if (isIgnorable(url)) continue;

      if (/^(https?:)?\/\//i.test(url)) {
        const repo = repoFromRemote(url);
        if (!repo) continue;
        if (repo === SELF_REPO) {
          selfAbsolute.add(pageRel);
          continue;
        }
        crossRepoRefCount++;
        if (!crossRepo[pageRel]) crossRepo[pageRel] = new Set();
        crossRepo[pageRel].add(repo);
        continue;
      }

      const localRel = (url.startsWith('/')
        ? path.join(ROOT, url)
        : path.resolve(pageDir, url.split('?')[0].split('#')[0]));

      const rel = path.relative(ROOT, localRel);
      if (rel.startsWith('..')) continue;
      if (!rel.includes('/') && SITE_FILES.has(rel)) continue;

      const assetFolder = topFolder(rel);
      if (assetFolder === 'shared' || assetFolder === pageFolder) continue;

      const key = `${pageFolder} -> ${assetFolder}`;
      if (!edges.has(key)) edges.set(key, new Set());
      edges.get(key).add(pageRel);

      if (!fs.existsSync(localRel)) {
        if (!missingLocal.has(key)) missingLocal.set(key, new Set());
        missingLocal.get(key).add(pageRel);
      }
    }
  }

  // Assets pulled in by JavaScript at runtime are invisible to the HTML scan.
  const jsCrossRepo = {};
  const remoteAssetRe = /https:\/\/cosylanguages\.github\.io\/([A-Za-z0-9_-]+)\/[^\s'"`)]+\.(?:js|mjs|json|css|woff2?|png|jpe?g|svg|mp3)/g;
  // Catches URLs assembled from a base variable, e.g. BASE + 'COSYtools/x.json'.
  const repoPathRe = /\b(COSY[A-Za-z]+)\/[^\s'"`)]+\.(?:js|mjs|json|css|woff2?|png|jpe?g|svg|mp3)/g;
  for (const absJs of walkFiles(ROOT, '.js', JS_SKIP_DIRS)) {
    const rel = path.relative(ROOT, absJs).split(path.sep).join('/');
    const src = fs
      .readFileSync(absJs, 'utf8')
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/(^|[^:])\/\/[^\n]*/g, '$1');
    let m;
    for (const re of [remoteAssetRe, repoPathRe]) {
      re.lastIndex = 0;
      while ((m = re.exec(src)) !== null) {
        if (m[1] === SELF_REPO) continue;
        if (!jsCrossRepo[rel]) jsCrossRepo[rel] = new Set();
        jsCrossRepo[rel].add(m[1]);
      }
    }
  }

  return {
    pageCount: pages.length,
    crossRepoRefCount,
    crossRepo,
    jsCrossRepo,
    edges,
    selfAbsolute,
    missingLocal,
  };
}

function normalise(result) {
  const crossRepo = {};
  for (const page of Object.keys(result.crossRepo).sort()) {
    crossRepo[page] = [...result.crossRepo[page]].sort();
  }
  const jsCrossRepo = {};
  for (const file of Object.keys(result.jsCrossRepo).sort()) {
    jsCrossRepo[file] = [...result.jsCrossRepo[file]].sort();
  }
  const edges = [...result.edges.keys()].sort();
  return {
    version: 1,
    summary: {
      pages: result.pageCount,
      crossRepoPages: Object.keys(crossRepo).length,
      crossRepoRefs: result.crossRepoRefCount,
      jsCrossRepoFiles: Object.keys(jsCrossRepo).length,
      crossFolderEdges: edges.length,
      selfAbsolutePages: result.selfAbsolute.size,
    },
    allowedCrossRepo: [...new Set(Object.values(crossRepo).flat())].sort(),
    crossRepo,
    jsCrossRepo,
    edges,
  };
}

function check(current) {
  if (!fs.existsSync(BASELINE_PATH)) {
    console.error('No baseline found. Run: node scripts/check_isolation.js --update');
    process.exit(1);
  }
  const base = JSON.parse(fs.readFileSync(BASELINE_PATH, 'utf8'));

  const allowed = new Set(base.allowedCrossRepo || []);
  const newRepoRefs = [];
  for (const [page, repos] of Object.entries(current.crossRepo)) {
    for (const repo of repos) {
      if (!allowed.has(repo)) newRepoRefs.push(`${page} -> ${repo}`);
    }
  }

  const newJsRepoRefs = [];
  for (const [file, repos] of Object.entries(current.jsCrossRepo)) {
    const known = new Set((base.jsCrossRepo || {})[file] || []);
    for (const repo of repos) {
      if (!known.has(repo)) newJsRepoRefs.push(`${file} -> ${repo}`);
    }
  }

  const currentEdges = [...current.edges.keys()];
  const knownEdges = new Set(base.edges);
  const newEdges = currentEdges.filter((e) => !knownEdges.has(e));

  const s = {
    pages: current.pageCount,
    crossRepoRefs: current.crossRepoRefCount,
    crossRepoPages: Object.keys(current.crossRepo).length,
    crossFolderEdges: currentEdges.length,
    jsCrossRepoFiles: Object.keys(current.jsCrossRepo).length,
    selfAbsolutePages: current.selfAbsolute.size,
  };
  console.log('Isolation check');
  console.log(`  pages scanned        ${s.pages}`);
  console.log(`  cross-repo refs      ${s.crossRepoRefs} on ${s.crossRepoPages} pages (baselined)`);
  console.log(`  cross-folder edges   ${s.crossFolderEdges} (baselined)`);
  console.log(`  cross-repo in JS     ${s.jsCrossRepoFiles} file(s) (baselined)`);
  console.log(`  self-absolute pages  ${s.selfAbsolutePages}`);

  if (newRepoRefs.length === 0 && newJsRepoRefs.length === 0 && newEdges.length === 0) {
    console.log('\nNo new coupling introduced.');
    return;
  }

  if (newRepoRefs.length) {
    console.log(`\nNEW cross-repo asset references (${newRepoRefs.length}):`);
    newRepoRefs.forEach((r) => console.log(`  ${r}`));
  }
  if (newJsRepoRefs.length) {
    console.log(`\nNEW cross-repo assets loaded from JS (${newJsRepoRefs.length}):`);
    newJsRepoRefs.forEach((r) => console.log(`  ${r}`));
  }
  if (newEdges.length) {
    console.log(`\nNEW cross-folder edges (${newEdges.length}):`);
    newEdges.forEach((e) => {
      console.log(`  ${e}`);
      for (const page of current.edges.get(e)) console.log(`      ${page}`);
    });
  }
  console.log('\nA page must depend only on its own folder and shared/.');
  console.log('If the new dependency is intentional, re-run with --update and say why in the PR.');
  process.exit(1);
}

function update(result) {
  const data = normalise(result);
  data.generatedAt = new Date().toISOString();

  fs.mkdirSync(path.dirname(BASELINE_PATH), { recursive: true });
  fs.writeFileSync(BASELINE_PATH, JSON.stringify(data, null, 2) + '\n');

  const rows = [...result.edges.entries()]
    .map(([key, pages]) => ({ key, count: pages.size }))
    .sort((a, b) => b.count - a.count);

  const lines = [
    '# Isolation report',
    '',
    `Generated ${data.generatedAt} by \`scripts/check_isolation.js\`.`,
    '',
    '## Summary',
    '',
    '| Metric | Value |',
    '| --- | --- |',
    `| HTML pages scanned | ${data.summary.pages} |`,
    `| Pages loading assets from another COSY repo | ${data.summary.crossRepoPages} |`,
    `| Cross-repo asset references | ${data.summary.crossRepoRefs} |`,
    `| JS files loading assets from another COSY repo | ${data.summary.jsCrossRepoFiles} |`,
    `| Cross-folder dependency edges | ${data.summary.crossFolderEdges} |`,
    `| Pages using self-absolute COSYevents URLs | ${data.summary.selfAbsolutePages} |`,
    '',
    '## Cross-repo dependencies',
    '',
  ];

  const byRepo = new Map();
  for (const [page, repos] of Object.entries(data.crossRepo)) {
    for (const repo of repos) {
      if (!byRepo.has(repo)) byRepo.set(repo, new Set());
      byRepo.get(repo).add(page);
    }
  }
  if (byRepo.size === 0) {
    lines.push('None.');
  } else {
    lines.push('| Repo | Pages |', '| --- | --- |');
    [...byRepo.entries()]
      .sort((a, b) => b[1].size - a[1].size)
      .forEach(([repo, pages]) => lines.push(`| \`${repo}\` | ${pages.size} |`));
  }

  lines.push('', '## Cross-repo assets loaded from JavaScript', '');
  if (Object.keys(data.jsCrossRepo).length === 0) {
    lines.push('None.');
  } else {
    lines.push('| File | Repos |', '| --- | --- |');
    for (const [file, repos] of Object.entries(data.jsCrossRepo)) {
      lines.push(`| \`${file}\` | ${repos.map((r) => '\`' + r + '\`').join(', ')} |`);
    }
  }

  lines.push('', '## Cross-folder edges', '', '| Edge | Pages |', '| --- | --- |');
  if (rows.length === 0) {
    lines.push('| none | 0 |');
  } else {
    rows.forEach((r) => lines.push(`| \`${r.key}\` | ${r.count} |`));
  }

  if (result.missingLocal.size) {
    lines.push('', '## Missing local assets on cross-folder edges', '', '| Edge | Missing refs |', '| --- | --- |');
    [...result.missingLocal.entries()]
      .sort((a, b) => b[1].size - a[1].size)
      .forEach(([key, pages]) => lines.push(`| \`${key}\` | ${pages.size} |`));
  }

  lines.push(
    '',
    '## What this measures',
    '',
    'A page is isolated when every asset it loads comes from its own top-level',
    'folder or from `shared/`. The baseline above is grandfathered: CI fails only',
    'when a page adds a dependency that is not already listed here.',
    '',
  );

  fs.writeFileSync(REPORT_PATH, lines.join('\n'));

  console.log('Isolation baseline updated.');
  console.log(`  pages            ${data.summary.pages}`);
  console.log(`  cross-repo refs  ${data.summary.crossRepoRefs} on ${data.summary.crossRepoPages} pages`);
  console.log(`  cross-folder     ${data.summary.crossFolderEdges} edges`);
  console.log(`  written          ${path.relative(ROOT, BASELINE_PATH)}, ${path.relative(ROOT, REPORT_PATH)}`);
}

const result = analyse();
if (process.argv.includes('--update')) update(result);
else check(result);
