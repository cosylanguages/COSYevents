#!/usr/bin/env node

/**
 * Contrast check for the COSY brand colours.
 *
 * Parses the real token files (vendored canonical + product layer), resolves
 * var() chains, and asserts WCAG ratios for the pairs the design relies on.
 * Values are read from CSS so this cannot drift from what ships.
 *
 * Light mode only: the canonical file overrides some tokens inside dark-mode
 * blocks, and this takes the first declaration of each token.
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const SOURCES = [
  'shared/vendor/cosylanguages/shared/css/tokens.css',
  'shared/css/product-tokens.css',
];

const RAMP = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900].map(
  (step) => `--cosy-signal-${step}`
);

// fg/bg: token names, or literal hex. `min` asserts "at least", `max` asserts
// "below" — used to keep brand fills out of text duty.
const PAIRS = [
  { fg: '--cosy-color-ink', bg: '--cosy-color-cream', min: 4.5, label: 'body text on cream' },
  { fg: '--cosy-color-ink', bg: '--cosy-color-surface', min: 4.5, label: 'body text on white' },
  { fg: '--product-accent', bg: '--cosy-color-cream', min: 4.5, label: 'terracotta accent text on cream' },
  { fg: '--product-accent', bg: '--cosy-color-surface', min: 4.5, label: 'terracotta accent text on white' },

  { fg: '--product-signal-text', bg: '--cosy-color-cream', min: 4.5, label: 'teal text on cream' },
  { fg: '--product-signal-text', bg: '--cosy-color-surface', min: 4.5, label: 'teal text on white' },
  { fg: '--cosy-signal-800', bg: '--cosy-color-cream', min: 4.5, label: 'teal 800 text on cream' },
  { fg: '--cosy-signal-900', bg: '--cosy-color-cream', min: 4.5, label: 'teal 900 text on cream' },

  { fg: '--cosy-color-ink', bg: '--cosy-signal-50', min: 4.5, label: 'body text on teal 50' },
  { fg: '--cosy-color-ink', bg: '--cosy-signal-100', min: 4.5, label: 'body text on teal 100' },
  { fg: '--cosy-color-ink', bg: '--cosy-signal-200', min: 4.5, label: 'body text on teal 200' },
  { fg: '--cosy-color-ink', bg: '--product-signal-tint', min: 4.5, label: 'body text on signal tint' },

  { fg: '--cosy-signal-600', bg: '--cosy-color-surface', min: 3.0, label: 'teal 600 icon/border on white' },
  { fg: '--cosy-signal-700', bg: '--cosy-color-cream', min: 4.5, label: 'teal 700 text on cream' },

  { fg: '--cosy-signal-500', bg: '--cosy-color-surface', max: 3.0, label: 'teal 500 on white stays decorative' },
  { fg: '--cosy-signal-500', bg: '--cosy-color-cream', max: 3.0, label: 'teal 500 on cream stays decorative' },
  { fg: '#FFFFFF', bg: '--cosy-signal-500', max: 4.5, label: 'white text on brand fill stays unusable' },
];

function loadTokens() {
  const tokens = new Map();
  for (const rel of SOURCES) {
    const css = fs
      .readFileSync(path.join(ROOT, rel), 'utf8')
      .replace(/\/\*[\s\S]*?\*\//g, '');
    for (const match of css.matchAll(/(--[a-zA-Z0-9-]+)\s*:\s*([^;]+);/g)) {
      const name = match[1];
      if (!tokens.has(name)) tokens.set(name, match[2].trim());
    }
  }
  return tokens;
}

function toHex(value) {
  if (!value) return null;
  const hex = value.match(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/);
  if (hex) {
    let digits = hex[1];
    if (digits.length === 3) digits = digits.split('').map((c) => c + c).join('');
    return '#' + digits.toUpperCase();
  }
  const rgb = value.match(/^rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)/i);
  if (rgb) {
    const channel = (n) => Math.round(Number(n)).toString(16).padStart(2, '0');
    return ('#' + channel(rgb[1]) + channel(rgb[2]) + channel(rgb[3])).toUpperCase();
  }
  return null;
}

function resolve(tokens, ref, depth = 0) {
  if (ref.startsWith('#')) return toHex(ref);
  if (depth > 12) return null;
  const raw = tokens.get(ref);
  if (!raw) return null;
  const alias = raw.match(/^var\(\s*(--[a-zA-Z0-9-]+)\s*(?:,\s*([^)]+))?\)$/);
  if (alias) {
    return resolve(tokens, alias[1], depth + 1) || (alias[2] ? toHex(alias[2].trim()) : null);
  }
  return toHex(raw);
}

function luminance(hex) {
  const channels = [1, 3, 5]
    .map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map((v) => (v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)));
  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
}

function ratio(a, b) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

const tokens = loadTokens();
const failures = [];
let checked = 0;

console.log('Contrast check — light mode\n');
console.log(
  '  ' +
    'foreground'.padEnd(24) +
    'background'.padEnd(26) +
    'ratio'.padStart(6) +
    '   needs   result'
);

for (const pair of PAIRS) {
  const fg = resolve(tokens, pair.fg);
  const bg = resolve(tokens, pair.bg);
  if (!fg || !bg) {
    console.log(`  SKIP  ${pair.label} (unresolvable: ${!fg ? pair.fg : pair.bg})`);
    continue;
  }
  const value = ratio(fg, bg);
  const ok = pair.min !== undefined ? value >= pair.min : value < pair.max;
  const need = pair.min !== undefined ? `>=${pair.min}` : `<${pair.max}`;
  checked++;
  console.log(
    '  ' +
      pair.fg.padEnd(24) +
      pair.bg.padEnd(26) +
      value.toFixed(2).padStart(6) +
      '   ' +
      need.padEnd(6) +
      '  ' +
      (ok ? 'PASS' : 'FAIL')
  );
  if (!ok) failures.push(`${pair.label}: ${value.toFixed(2)} needs ${need}`);
}

console.log('\nBrand signal ramp (ink text / white text on each step)\n');
console.log('  step   value     on cream   on white   ink on step   white on step');
const ink = resolve(tokens, '--cosy-color-ink');
const cream = resolve(tokens, '--cosy-color-cream');
const white = '#FFFFFF';
for (const name of RAMP) {
  const hex = resolve(tokens, name);
  if (!hex) {
    console.log(`  ${name.replace('--cosy-signal-', '').padEnd(6)} unresolved`);
    continue;
  }
  console.log(
    '  ' +
      name.replace('--cosy-signal-', '').padEnd(6) +
      hex.padEnd(9) +
      ratio(hex, cream).toFixed(2).padStart(9) +
      ratio(hex, white).toFixed(2).padStart(11) +
      ratio(ink, hex).toFixed(2).padStart(13) +
      ratio(white, hex).toFixed(2).padStart(15)
  );
}

if (failures.length) {
  console.error(`\n${failures.length} contrast failure(s):`);
  failures.forEach((f) => console.error('  ' + f));
  process.exit(1);
}

console.log(`\nAll ${checked} contrast pairs pass.`);
