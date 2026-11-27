#!/usr/bin/env node

/**
 * Vendors the COSYlanguages shared assets COSYevents depends on.
 *
 * The copy is byte-identical to upstream and pinned by sha256 in
 * shared/vendor/cosylanguages/MANIFEST.json. Pages must reference the local
 * copy, never the upstream URL: a change, rename or outage in COSYlanguages
 * must not be able to alter how COSYevents looks.
 *
 *   node scripts/vendor_cosylanguages.js           # fetch upstream, rewrite the local copy
 *   node scripts/vendor_cosylanguages.js --check   # verify the local copy still matches the manifest
 *
 * --check never touches the network, so it is safe to run in CI.
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ROOT = path.resolve(__dirname, '..');
const VENDOR_DIR = path.join(ROOT, 'shared', 'vendor', 'cosylanguages');
const MANIFEST_PATH = path.join(VENDOR_DIR, 'MANIFEST.json');
const UPSTREAM = 'https://cosylanguages.github.io/COSYlanguages/';

const FONTS = [
  'fraunces-latin-soft-normal',
  'fraunces-latin-ext-soft-normal',
  'literata-latin-wght-normal',
  'literata-cyrillic-wght-normal',
  'literata-greek-wght-normal',
  'commissioner-latin-wght-normal',
  'commissioner-latin-ext-wght-normal',
  'commissioner-cyrillic-wght-normal',
  'commissioner-cyrillic-ext-wght-normal',
  'commissioner-greek-wght-normal',
].map((name) => `fonts/${name}.woff2`);

const FILES = [
  'shared/css/tokens.css',
  'css/fonts.css',
  'css/ecosystem-strip.css',
  'css/daily-directory.css',
  'js/ecosystem-strip.js',
  'js/daily-directory.js',
  ...FONTS,
];

const sha256 = (buf) => crypto.createHash('sha256').update(buf).digest('hex');

function readManifest() {
  if (!fs.existsSync(MANIFEST_PATH)) return null;
  return JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));
}

async function vendor() {
  const manifest = { source: UPSTREAM, fetchedAt: new Date().toISOString(), files: {} };
  let changed = 0;

  for (const rel of FILES) {
    const url = UPSTREAM + rel;
    const res = await fetch(url);
    if (!res.ok) {
      console.error(`FAILED ${res.status} ${url}`);
      process.exit(1);
    }
    const body = Buffer.from(await res.arrayBuffer());
    const dest = path.join(VENDOR_DIR, rel);
    fs.mkdirSync(path.dirname(dest), { recursive: true });

    const before = fs.existsSync(dest) ? fs.readFileSync(dest) : null;
    if (!before || !before.equals(body)) changed++;
    fs.writeFileSync(dest, body);

    manifest.files[rel] = { sha256: sha256(body), bytes: body.length };
    console.log(`${before && before.equals(body) ? 'same' : 'new '}  ${rel}  ${body.length} bytes`);
  }

  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2) + '\n');
  console.log(`\nVendored ${FILES.length} files to shared/vendor/cosylanguages/ (${changed} changed)`);
  console.log('Run `npm run check-isolation` to confirm no page still points upstream.');
}

function check() {
  const manifest = readManifest();
  if (!manifest) {
    console.error('No manifest. Run: node scripts/vendor_cosylanguages.js');
    process.exit(1);
  }

  const problems = [];
  for (const [rel, meta] of Object.entries(manifest.files)) {
    const dest = path.join(VENDOR_DIR, rel);
    if (!fs.existsSync(dest)) {
      problems.push(`missing  ${rel}`);
      continue;
    }
    const actual = sha256(fs.readFileSync(dest));
    if (actual !== meta.sha256) problems.push(`modified ${rel}`);
  }

  if (problems.length) {
    console.error('Vendored copy does not match MANIFEST.json:');
    problems.forEach((p) => console.error(`  ${p}`));
    console.error('\nDo not edit vendored files. Re-run the vendoring script instead.');
    process.exit(1);
  }

  console.log(`Vendored COSYlanguages assets intact (${Object.keys(manifest.files).length} files, ${manifest.fetchedAt}).`);
}

if (process.argv.includes('--check')) check();
else vendor().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
