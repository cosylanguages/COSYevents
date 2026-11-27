#!/usr/bin/env node
/**
 * Fails if any page loads a font or script from a third-party CDN.
 *
 * Both are external runtime dependencies: they leak the visitor's IP to a
 * third party, break the page when that CDN is slow or blocked, and contradict
 * the repository rule that every page works on its own.
 *
 * Fonts live in shared/fonts/ and are declared in
 * shared/css/product-fonts.css. Third-party scripts are vendored into
 * shared/vendor/ with a pinned version and a recorded SHA-256; run
 * scripts/vendor_supabase.js after changing the dependency.
 *
 * The privacy pages used to disclose the Google Fonts request, so removing
 * that dependency also required updating that text. Keep both in step.
 */

const fs = require('fs');
const path = require('path');

const SKIP_DIRS = new Set(['node_modules', '.git', 'verification', 'reports']);
const FONT_CDN = /fonts\.(googleapis|gstatic)\.com/i;
const EXTERNAL_SCRIPT = /<script\b[^>]*\bsrc\s*=\s*["']https?:\/\//i;
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
    let bad = false;
    if (isMarkup) {
      bad = (/<link\b/i.test(line) && FONT_CDN.test(line)) || EXTERNAL_SCRIPT.test(line);
    } else {
      bad = EXTERNAL_FONT_RULE.test(line);
    }
    if (bad) offenders.push(`${rel}:${i + 1}`);
  });
}

if (offenders.length) {
  console.error(`Third-party CDN referenced in ${offenders.length} place(s):`);
  for (const o of offenders.slice(0, 25)) console.error(`  ${o}`);
  if (offenders.length > 25) console.error(`  ... and ${offenders.length - 25} more`);
  console.error('\nSelf-host it instead: fonts go in shared/fonts/ (declare them in shared/css/product-fonts.css),');
  console.error('scripts go in shared/vendor/ with a pinned version and a recorded SHA-256.');
  process.exit(1);
}

console.log('External asset check passed: all fonts and scripts are self-hosted.');
