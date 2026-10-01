const fs = require('fs');
const path = require('path');

function getFiles(dir, fileList = []) {
  if (!fs.existsSync(dir)) return fileList;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const full = path.join(dir, file);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      getFiles(full, fileList);
    } else if (file.endsWith('.html')) {
      fileList.push(full.replace(/\\/g, '/'));
    }
  }
  return fileList;
}

function getExplicitSessionLevels(filePath) {
  const html = fs.readFileSync(filePath, 'utf8');
  const levelTexts = [];
  const dateMatch = html.match(/class=["']session-date["'][^>]*>([\s\S]*?)<\/p>/i);
  if (dateMatch) levelTexts.push(dateMatch[1]);
  for (const match of html.matchAll(/<h4[^>]*>\s*Level\s*<\/h4>\s*<p[^>]*>([\s\S]*?)<\/p>/gi)) {
    levelTexts.push(match[1]);
  }
  for (const match of html.matchAll(/LEVEL\s*:\s*<span[^>]*>([\s\S]*?)<\/span>/gi)) {
    levelTexts.push(match[1]);
  }

  const text = levelTexts.join(' ').replace(/<[^>]*>/g, ' ').replace(/&[^;]+;/g, ' ');
  return [...new Set([...text.matchAll(/\b(A0|A1|A2|B1|B2|C1|C2)\b/g)].map(level => level[1]))];
}

const allSessionFilesOnDisk = [
  ...getFiles('sessions'),
  ...getFiles('fr/sessions'),
  ...getFiles('ru/sessions')
];

console.log('Total session HTML files on disk:', allSessionFilesOnDisk.length);

const sessionsJson = JSON.parse(fs.readFileSync('data/sessions.json', 'utf8'));
console.log('Total catalog entries in data/sessions.json:', sessionsJson.length);

let errors = 0;
const catalogHrefs = new Set();

for (let i = 0; i < sessionsJson.length; i++) {
  const item = sessionsJson[i];
  if (!item.title || !item.href || !item.lang || !item.format) {
    console.error(`Item ${i} missing required fields:`, item);
    errors++;
  }
  if (!fs.existsSync(item.href)) {
    console.error(`Item ${i} href does not exist on disk:`, item.href);
    errors++;
  } else {
    const pageLevels = getExplicitSessionLevels(item.href);
    const catalogLevels = [...new Set((item.level || '').match(/\b(A0|A1|A2|B1|B2|C1|C2)\b/g) || [])];
    if (pageLevels.length > 0 && (
      pageLevels.length !== catalogLevels.length ||
      pageLevels.some(level => !catalogLevels.includes(level))
    )) {
      console.error(`Item ${i} level mismatch: catalog "${item.level || '(missing)'}", page "${pageLevels.join('-')}" (${item.href})`);
      errors++;
    }
  }
  catalogHrefs.add(item.href);
}

for (const f of allSessionFilesOnDisk) {
  if (!catalogHrefs.has(f)) {
    console.error(`Disk file not in catalog:`, f);
    errors++;
  }
}

if (errors === 0) {
  console.log(`✅ Master session catalog verification PASSED! All ${allSessionFilesOnDisk.length} sessions are correctly cataloged and exist on disk.`);
} else {
  console.error(`❌ Verification failed with ${errors} errors.`);
  process.exit(1);
}
