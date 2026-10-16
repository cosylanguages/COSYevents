const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
const MAX_FILE_SIZE_BYTES = 15 * 1024; // 15 KB

const PRIVATE_CONTENT_MARKERS = [
  'vocab-card',
  'round-block',
  'round-item',
  'facilitator-notes',
  'recording-url',
  'teacher-note',
  'mistake-block'
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

function checkGatedPages() {
  console.log('--- Checking Gated Pages and Private Content Rules ---');
  let errors = 0;

  // 1. Check Git Tracking for private/ folder
  try {
    const gitTracked = execSync('git ls-files private/', { cwd: ROOT, encoding: 'utf8' }).trim();
    if (gitTracked) {
      console.error('[ERROR] Files inside private/ are being tracked by git:');
      console.error(gitTracked);
      errors++;
    } else {
      console.log('[PASS] No files in private/ are tracked by git.');
    }
  } catch (err) {
    // If not a git repository or git command fails, continue
  }

  // 2. Scan all HTML files for cosy-gated meta tag
  const sessionsDir = path.join(ROOT, 'sessions');
  const allHtml = getAllHtmlFiles(sessionsDir);
  let gatedPagesCount = 0;

  for (const filePath of allHtml) {
    const relPath = path.relative(ROOT, filePath);
    const content = fs.readFileSync(filePath, 'utf8');

    if (!content.includes('name="cosy-gated" content="true"')) {
      continue;
    }

    gatedPagesCount++;

    // Check size < 15 KB
    const stat = fs.statSync(filePath);
    if (stat.size >= MAX_FILE_SIZE_BYTES) {
      console.error(`[ERROR] ${relPath} exceeds 15 KB size limit (${(stat.size / 1024).toFixed(2)} KB)`);
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
      if (content.includes(`class="${marker}`) || content.includes(`id="${marker}`)) {
        console.error(`[ERROR] ${relPath} contains private content marker: ${marker}`);
        errors++;
      }
    }
  }

  console.log(`Scanned ${allHtml.length} total HTML pages. Found ${gatedPagesCount} gated pages.`);

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

module.exports = { checkGatedPages };
