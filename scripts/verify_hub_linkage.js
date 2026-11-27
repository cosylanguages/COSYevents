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

const frSessionFiles = getFiles('fr/sessions');
const ruSessionFiles = getFiles('ru/sessions');

const frPageContent = fs.readFileSync('fr/speaking-clubs.html', 'utf8') + '\n' + fs.readFileSync('fr/mind-matters.html', 'utf8');
const ruPageContent = fs.readFileSync('ru/speaking-clubs.html', 'utf8') + '\n' + fs.readFileSync('ru/mind-matters.html', 'utf8');

let missingFr = [];
for (const f of frSessionFiles) {
  if (!frPageContent.includes(path.basename(f))) {
    missingFr.push(f);
  }
}

let missingRu = [];
for (const f of ruSessionFiles) {
  if (!ruPageContent.includes(path.basename(f))) {
    missingRu.push(f);
  }
}

console.log(`French sessions on disk: ${frSessionFiles.length}, Unlinked on French pages: ${missingFr.length}`);
console.log(`Russian sessions on disk: ${ruSessionFiles.length}, Unlinked on Russian pages: ${missingRu.length}`);

if (missingFr.length === 0 && missingRu.length === 0) {
  console.log('✅ Localized hub linkage verification PASSED! 100% of French and Russian sessions are displayed and linked on language hubs.');
} else {
  console.error('❌ Missing linkage:', { missingFr, missingRu });
  process.exit(1);
}
