const fs = require('fs');
const path = require('path');

const allowedFilePath = path.join(__dirname, 'allowed-cosylanguages-paths.txt');
if (!fs.existsSync(allowedFilePath)) {
  console.error(`Error: Allowed list file not found at ${allowedFilePath}`);
  process.exit(1);
}

const allowedLines = fs.readFileSync(allowedFilePath, 'utf8')
  .split('\n')
  .map(l => l.trim())
  .filter(l => l && !l.startsWith('#'));

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    if (file === 'node_modules' || file === '.git') return;
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(filePath));
    } else {
      results.push(filePath);
    }
  });
  return results;
}

const files = walk('.');
let violations = [];

files.forEach(f => {
  if (f === path.join('scripts', 'allowed-cosylanguages-paths.txt')) return;
  const content = fs.readFileSync(f, 'utf8');
  const matches = content.match(/https:\/\/cosylanguages\.github\.io\/COSYlanguages[^\s"'<>)]*/g);
  if (matches) {
    matches.forEach(m => {
      // Check if match starts with or equals any allowed line
      const isAllowed = allowedLines.some(allowed => {
        if (allowed.endsWith('/')) {
          return m === allowed || m.startsWith(allowed);
        }
        return m === allowed;
      });

      if (!isAllowed) {
        violations.push({ file: f, url: m });
      }
    });
  }
});

if (violations.length > 0) {
  console.error(`❌ Check failed! Found ${violations.length} disallowed COSYlanguages link(s):`);
  violations.forEach(v => {
    console.error(`  - ${v.file}: ${v.url}`);
  });
  process.exit(1);
} else {
  console.log('✅ All COSYlanguages links are valid according to allowed list!');
}
