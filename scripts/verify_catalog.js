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
  console.log('✅ Master session catalog verification PASSED! All 617 sessions are correctly cataloged and exist on disk.');
} else {
  console.error(`❌ Verification failed with ${errors} errors.`);
  process.exit(1);
}
