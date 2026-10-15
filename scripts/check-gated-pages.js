const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
const MAX_STRIPPED_SIZE_BYTES = 15 * 1024; // 15 KB max size excluding vocabulary

const PRIVATE_CONTENT_MARKERS = [
  'round-block',
  'round-item',
  'facilitator-notes',
  'recording-url',
  'teacher-note',
  'mistake-block',
  'discussion-section',
  'prompt-deck',
  'deck-section'
];

function getAllHtmlFiles(dir) {
  let results = [];
  if (!fs.existsSync(dir)) return results;
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      results = results.concat(getAllHtmlFiles(filePath));
    } else if (filePath.endsWith('.html')) {
      results.push(filePath);
    }
  });
  return results;
}

function stripVocabularyContent(html) {
  // Strip <section id="vocabulary">...</section> or .vocab-grid/.vocab-card elements
  let stripped = html.replace(/<section\s+id=["']vocabulary["'][\s\S]*?<\/section>/gi, '');
  stripped = stripped.replace(/<div\s+class=["'][^"']*vocab-grid[^"']*["'][\s\S]*?<\/div>/gi, '');
  stripped = stripped.replace(/<div\s+class=["'][^"']*vocab-card[^"']*["'][\s\S]*?<\/div>/gi, '');
  return stripped;
}

function checkGatedPages() {
  console.log('--- Checking Gated Pages and Private Content Rules ---');
  let errors = 0;

  // 1. Check Git Tracking for private/ and protected-export/ folders
  try {
    const gitTrackedPrivate = execSync('git ls-files private/', { cwd: ROOT, encoding: 'utf8' }).trim();
    if (gitTrackedPrivate) {
      console.error('[ERROR] Files inside private/ are being tracked by git:');
      console.error(gitTrackedPrivate);
      errors++;
    } else {
      console.log('[PASS] No files in private/ are tracked by git.');
    }

    const gitTrackedProtected = execSync('git ls-files protected-export/', { cwd: ROOT, encoding: 'utf8' }).trim();
    if (gitTrackedProtected) {
      console.error('[ERROR] Files inside protected-export/ are being tracked by git:');
      console.error(gitTrackedProtected);
      errors++;
    } else {
      console.log('[PASS] No files in protected-export/ are tracked by git.');
    }
  } catch (err) {
    // If not a git repository or git command fails, continue
  }

  // 2. Scan all HTML files across sessions/, events/, el/, fr/, it/, ru/
  const targetDirs = ['sessions', 'events', 'el', 'fr', 'it', 'ru'];
  let allHtml = [];
  targetDirs.forEach(dir => {
    allHtml = allHtml.concat(getAllHtmlFiles(path.join(ROOT, dir)));
  });

  let gatedPagesCount = 0;

  for (const filePath of allHtml) {
    const relPath = path.relative(ROOT, filePath);
    const content = fs.readFileSync(filePath, 'utf8');

    if (!content.includes('name="cosy-gated" content="true"')) {
      continue;
    }

    gatedPagesCount++;

    // Check size of stripped (non-vocabulary) content < 15 KB
    const strippedContent = stripVocabularyContent(content);
    const strippedSizeBytes = Buffer.byteLength(strippedContent, 'utf8');
    if (strippedSizeBytes >= MAX_STRIPPED_SIZE_BYTES) {
      console.error(`[ERROR] ${relPath} stripped size exceeds 15 KB limit (${(strippedSizeBytes / 1024).toFixed(2)} KB)`);
      errors++;
    }

    // Check meta noindex, nofollow
    if (!content.includes('<meta name="robots" content="noindex,nofollow"/>') &&
        !content.includes('<meta name="robots" content="noindex, nofollow"/>')) {
      console.error(`[ERROR] ${relPath} missing noindex,nofollow meta tag`);
      errors++;
    }

    // Check meta no-referrer
    if (!content.includes('<meta name="referrer" content="no-referrer"/>')) {
      console.error(`[ERROR] ${relPath} missing no-referrer meta tag`);
      errors++;
    }

    // Check for private content markers
    for (const marker of PRIVATE_CONTENT_MARKERS) {
      if (content.includes(`class="${marker}`) ||
          content.includes(`class='${marker}`) ||
          content.includes(`id="${marker}`) ||
          content.includes(`id='${marker}`)) {
        console.error(`[ERROR] ${relPath} contains private content marker: ${marker}`);
        errors++;
      }
    }
  }

  console.log(`Scanned ${allHtml.length} total HTML pages across ${targetDirs.join(', ')}. Found ${gatedPagesCount} gated pages.`);

  if (errors > 0) {
    console.error(`\n[FAIL] Found ${errors} gated page violation(s).`);
    process.exit(1);
  } else {
    console.log('[PASS] All gated page constraints satisfied successfully.');
  }
}

if (require.main === module) {
  checkGatedPages();
}

module.exports = { checkGatedPages, stripVocabularyContent };
