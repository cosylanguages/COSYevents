const fs = require('fs');
const path = require('path');

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
const forbiddenNames = [/james\s+york/i, /damir\s+moskov/i];
const violations = [];

files.forEach(f => {
  const content = fs.readFileSync(f, 'utf8');
  forbiddenNames.forEach(regex => {
    if (regex.test(content)) {
      violations.push({ file: f, name: regex.toString() });
    }
  });
});

if (violations.length > 0) {
  console.error(`❌ Check names failed! Found forbidden name(s) in ${violations.length} file(s):`);
  violations.forEach(v => {
    console.error(`  - ${v.file}: matched ${v.name}`);
  });
  process.exit(1);
} else {
  console.log('✅ Check names passed! No forbidden names found.');
}
