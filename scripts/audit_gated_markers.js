const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const SESSIONS_DIR = path.join(ROOT, 'sessions');

const GATED_MARKERS = [
  'round-block',
  'round-item',
  'mistake-block',
  'facilitator-notes',
  'recording-url',
  'teacher-note',
  'perspective_mirror',
  'warm_up',
  'round_1',
  'round_2',
  'lets_speak_together',
  'discussion-section',
  'prompt-deck'
];

function scanFiles(dir) {
  let files = [];
  if (!fs.existsSync(dir)) return files;
  const list = fs.readdirSync(dir);
  for (const item of list) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      files = files.concat(scanFiles(fullPath));
    } else if (item.endsWith('.html') || item.endsWith('.md')) {
      files.push(fullPath);
    }
  }
  return files;
}

function auditClubs() {
  const allFiles = scanFiles(SESSIONS_DIR);

  const clubStats = {};

  for (const file of allFiles) {
    const rel = path.relative(SESSIONS_DIR, file);
    const clubName = rel.split(path.sep)[0] || 'root';

    if (!clubStats[clubName]) {
      clubStats[clubName] = { htmlTotal: 0, htmlGated: 0, mdTotal: 0, mdGated: 0 };
    }

    const content = fs.readFileSync(file, 'utf8');
    const isHtml = file.endsWith('.html');
    const isMd = file.endsWith('.md');

    if (isHtml) clubStats[clubName].htmlTotal++;
    if (isMd) clubStats[clubName].mdTotal++;

    let hasGatedMarker = false;
    for (const marker of GATED_MARKERS) {
      if (content.includes(marker)) {
        hasGatedMarker = true;
        break;
      }
    }

    if (hasGatedMarker) {
      if (isHtml) clubStats[clubName].htmlGated++;
      if (isMd) clubStats[clubName].mdGated++;
    }
  }

  console.log('=== GATED MARKERS AUDIT REPORT PER CLUB ===');
  console.log('Club Name                          | HTML Gated / Total | MD Gated / Total');
  console.log('-----------------------------------|--------------------|-----------------');

  let totalHtml = 0;
  let totalHtmlGated = 0;
  let totalMd = 0;
  let totalMdGated = 0;

  for (const [club, stats] of Object.entries(clubStats).sort()) {
    const clubPadded = club.padEnd(35, ' ');
    const htmlStr = `${stats.htmlGated} / ${stats.htmlTotal}`.padEnd(18, ' ');
    const mdStr = `${stats.mdGated} / ${stats.mdTotal}`;
    console.log(`${clubPadded}| ${htmlStr}| ${mdStr}`);

    totalHtml += stats.htmlTotal;
    totalHtmlGated += stats.htmlGated;
    totalMd += stats.mdTotal;
    totalMdGated += stats.mdMdGated || stats.mdGated;
  }

  console.log('-----------------------------------|--------------------|-----------------');
  console.log(`TOTAL                              | ${totalHtmlGated} / ${totalHtml}        | ${totalMdGated} / ${totalMd}`);
}

if (require.main === module) {
  auditClubs();
}

module.exports = { auditClubs };
