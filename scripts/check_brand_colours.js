#!/usr/bin/env node
/**
 * Fails if the legacy sage ground colour reappears in shipped CSS, JS or markup.
 *
 * The site is built on the brand teal, and the sage family was remapped to it
 * in shared/css/product-tokens.css. That remap only works while the sage hexes
 * stay out of the source: a component that hard-codes #416b49 ignores the
 * tokens entirely, which is how half the site stayed green during the rebrand.
 *
 * .json/.webmanifest are scanned too, so the PWA manifest cannot keep an old
 * theme colour after the palette moves.
 *
 * shared/vendor/ is excluded on purpose. It is a sha-pinned copy of the
 * canonical design system and still defines sage; check-vendor guards it, and
 * overriding it happens in the product layer, never in place.
 *
 * Semantic greens are not sage and stay allowed: #0f6b35 and #25d366 mark
 * WhatsApp, #15803d and friends mark success states.
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SKIP_DIRS = new Set(['node_modules', '.git', 'shared/vendor', 'scripts', '.agent_tmp']);

// Byte-identical copy of COSYstudio's CMS editor, asserted by
// shared/js/cms-editor.lock.json. Recolouring it means changing it upstream and
// re-copying, so its sage hex is not ours to fix here.
const SKIP_FILES = new Set(['shared/js/cms-editor.js']);
const EXTENSIONS = new Set(['.html', '.css', '.js', '.json', '.webmanifest']);

// Legacy sage step -> the teal step that replaced it.
const LEGACY = {
  '#416b49': '#087a80',
  '#375742': '#0b4749',
  '#233827': '#062b2d',
  '#6b9474': '#0ca2b0',
  '#e8f0e9': '#d6f7f5',
  '#f0f5f1': '#effcfb',
  '#2f4f36': '#0b4749',
  '#2e4a33': '#0a5f63',
  '#3c5a42': '#0a5f63',
  '#47694e': '#087a80',
  '#5a7a5f': '#3fd6ce',
  '#8a9e8b': '#8fb3b1',
  '#222c23': '#0b2e2e',
  '#1f2720': '#0a2a2b',
  '#c8d8c9': '#c9e9e7',
  '#a8b8a9': '#8fb3b1',
};

const PATTERN = new RegExp(`(${Object.keys(LEGACY).join('|')})\\b`, 'gi');

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const rel = path.relative(ROOT, path.join(dir, entry.name)).split(path.sep).join('/');
    if (entry.isDirectory()) {
      if (SKIP_DIRS.has(entry.name) || SKIP_DIRS.has(rel)) continue;
      walk(path.join(dir, entry.name), out);
    } else if (EXTENSIONS.has(path.extname(entry.name)) && !SKIP_FILES.has(rel)) {
      out.push(path.join(dir, entry.name));
    }
  }
  return out;
}

const offenders = [];
for (const file of walk(ROOT)) {
  const lines = fs.readFileSync(file, 'utf8').split('\n');
  lines.forEach((line, i) => {
    const matches = line.match(PATTERN);
    if (!matches) return;
    const hex = matches[0].toLowerCase();
    offenders.push({
      where: `${path.relative(ROOT, file).split(path.sep).join('/')}:${i + 1}`,
      hex,
      fix: LEGACY[hex],
    });
  });
}

if (offenders.length) {
  console.error(`Legacy sage colour in ${offenders.length} place(s):`);
  for (const o of offenders) console.error(`  ${o.where}  ${o.hex} -> ${o.fix}`);
  console.error('\nUse the token instead of the hex: var(--cosy-primary), var(--cosy-color-sage),');
  console.error('var(--cosy-color-sage-dark) and so on. The remap in shared/css/product-tokens.css');
  console.error('only reaches code that asks for the token.');
  process.exit(1);
}

console.log('Brand colour check passed: no legacy sage hexes outside shared/vendor.');
