#!/usr/bin/env node
'use strict';
/**
 * Stamps data-cms-id on every editable text block of the public event pages (see scripts/lib/cms_stamp.js)
 * and makes sure hub pages load the founder editor.
 *
 *   node scripts/stamp_cms_ids.js          write changes
 *   node scripts/stamp_cms_ids.js --check  exit 1 if any page is missing stamps (used in CI)
 */
const fs = require('fs');
const path = require('path');
const { stampHtml } = require('./lib/cms_stamp');

const ROOT = path.join(__dirname, '..');
const SKIP_DIRS = new Set(['node_modules', '.git', 'tests', 'test-results', 'playwright-report', 'templates', 'admin', 'supabase', 'scripts', 'docs']);
const SKIP_FILES = new Set(['404.html', 'account.html', 'login.html', 'live-classroom.html', 'studio.html', 'privacy.html', 'fr/privacy.html']);

function isEditablePage(rel, html) {
  if (SKIP_FILES.has(rel)) return false;
  if (/<meta[^>]+http-equiv=["']refresh["']/i.test(html)) return false; // redirect stub
  return true;
}

function* htmlFiles(dir, base) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.isDirectory()) { if (!SKIP_DIRS.has(e.name)) yield* htmlFiles(path.join(dir, e.name), path.join(base, e.name)); }
    else if (e.name.endsWith('.html')) yield path.join(base, e.name);
  }
}

// Pages without cosyevents-session.js (hubs, localized homes) need to load the editor themselves.
function ensureLoader(rel, html) {
  if (/cosyevents-session\.js|cms-boot\.js/.test(html)) return html;
  const depth = rel.split(path.sep).length - 1;
  const prefix = depth === 0 ? '' : '../'.repeat(depth);
  const tag = `<script src="${prefix}shared/js/cms-boot.js" defer></script>\n`;
  return html.includes('</body>') ? html.replace('</body>', tag + '</body>') : html + '\n' + tag;
}

function process_(rel, html) {
  const stamped = stampHtml(html);
  return { html: ensureLoader(rel, stamped.html), added: stamped.added };
}

if (require.main === module) {
  const check = process.argv.includes('--check');
  let pages = 0, changed = 0, added = 0;
  const stale = [];
  for (const rel of htmlFiles(ROOT, '')) {
    const html = fs.readFileSync(path.join(ROOT, rel), 'utf8');
    if (!isEditablePage(rel, html)) continue;
    pages++;
    const out = process_(rel, html);
    if (out.html !== html) {
      changed++; added += out.added;
      if (check) stale.push(rel); else fs.writeFileSync(path.join(ROOT, rel), out.html, 'utf8');
    }
  }
  if (check) {
    if (stale.length) {
      console.error(`${stale.length} page(s) are missing CMS stamps or the editor loader. Run: node scripts/stamp_cms_ids.js\n` + stale.slice(0, 15).join('\n'));
      process.exit(1);
    }
    console.log(`CMS stamps OK on ${pages} pages.`);
  } else {
    console.log(`Stamped ${added} elements on ${changed} of ${pages} pages.`);
  }
}

module.exports = { isEditablePage, ensureLoader, process: process_ };
