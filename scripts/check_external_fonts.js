#!/usr/bin/env node
/**
 * Fails if any page or stylesheet loads a font from a third-party CDN.
 *
 * Fonts must be self-hosted. A Google Fonts <link> is an external runtime
 * dependency: it leaks the visitor's IP to a third party, breaks the page when
 * that CDN is slow or blocked, and contradicts the repository rule that every
 * page works on its own. The fonts live in shared/fonts/ and are declared in
 * shared/css/product-fonts.css.
 *
 * The privacy pages used to disclose the Google Fonts request, so removing the
 * dependency also required updating that text. Keep both in step.
 */

const fs = require('fs');
const path = require('path');

const SKIP_DIRS = new Set(['node_modules', '.git', 'verification', 'reports']);
const FONT_CDN = /fonts\.(googleapis|gstatic)\.com/i;
const EXTERNAL_FONT_RULE = /@import\s+(?:url\()?['"]?https?:\/\/fonts\.(?:googleapis|gstatic)\.com/i;

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith('.') && entry.name !== '.github') continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (SKIP_DIRS.has(entry.name)) continue;
      walk(full, out);
    } else if (/\.(html|css)$/i.test(entry.name)) {
      out.push(full);
    }
  }
  return out;
}

const root = path.resolve(__dirname, '..');
const offenders = [];

for (const file of walk(root)) {
  const rel = path.relative(root, file);
  const lines = fs.readFileSync(file, 'utf8').split('\n');

  lines.forEach((line, i) => {
    const isMarkup = /\.html$/i.test(file);
    const loadsFont = isMarkup ? /<link\b/i.test(line) && FONT_CDN.test(line) : EXTERNAL_FONT_RULE.test(line);
    if (loadsFont) offenders.push(`${rel}:${i + 1}`);
  });
}

if (offenders.length) {
  console.error(`External font CDN referenced in ${offenders.length} place(s):`);
  for (const o of offenders.slice(0, 25)) console.error(`  ${o}`);
  if (offenders.length > 25) console.error(`  ... and ${offenders.length - 25} more`);
  console.error('\nSelf-host the font instead: add it to shared/fonts/ and declare it in shared/css/product-fonts.css.');
  process.exit(1);
}

console.log('External font check passed: all fonts are self-hosted.');
