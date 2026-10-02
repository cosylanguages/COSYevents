#!/usr/bin/env node

/**
 * Structure Check Script
 * Scans every .html file under sessions/, fr/sessions/, ru/sessions/
 * Ensures each file has:
 * - Exactly one <h1> element
 * - A 'session-hero' header (<header ... session-hero ...> or element with session-hero class)
 * - A 'content-container' main (<main ... content-container ...> or element with content-container class)
 * Exits with 1 if any file fails, otherwise 0.
 */

const fs = require('fs');
const path = require('path');

const targetDirs = ['sessions', 'fr/sessions', 'ru/sessions'];
const failures = [];
let totalScanned = 0;

function scanDirectory(dirPath) {
  if (!fs.existsSync(dirPath)) return;

  const entries = fs.readdirSync(dirPath, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      scanDirectory(fullPath);
    } else if (entry.isFile() && entry.name.endsWith('.html')) {
      totalScanned++;
      checkFileStructure(fullPath);
    }
  }
}

function checkFileStructure(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');

  // Count <h1> tags
  const h1Matches = content.match(/<h1[\s>]/gi) || [];
  const h1Count = h1Matches.length;

  // Check session-hero header
  const hasHero = /session-hero/i.test(content);

  // Check content-container main
  const hasContainer = /content-container/i.test(content);

  const errors = [];
  if (h1Count !== 1) {
    errors.push(`Expected exactly 1 <h1>, found ${h1Count}`);
  }
  if (!hasHero) {
    errors.push(`Missing 'session-hero' header`);
  }
  if (!hasContainer) {
    errors.push(`Missing 'content-container' main`);
  }

  if (errors.length > 0) {
    failures.push({
      filePath,
      errors
    });
  }
}

console.log('Running session page structure check...');
targetDirs.forEach(dir => scanDirectory(path.join(__dirname, '..', dir)));

console.log(`Scanned ${totalScanned} session pages.`);

if (failures.length > 0) {
  console.error(`\n❌ Structure check failed for ${failures.length} page(s):\n`);
  failures.forEach(f => {
    console.error(`- ${f.filePath}:`);
    f.errors.forEach(e => console.error(`    * ${e}`));
  });
  process.exit(1);
} else {
  console.log('✅ All session pages passed structure check with 0 failures.');
  process.exit(0);
}
