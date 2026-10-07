const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('Running build-public script to regenerate public output...');
execSync('node scripts/build-public.js', { stdio: 'inherit' });

const eventsDir = path.join(__dirname, '../events');
const publicJsonPath = path.join(__dirname, '../public-events.json');

if (!fs.existsSync(publicJsonPath)) {
  console.error('FAIL: public-events.json does not exist!');
  process.exit(1);
}

const publicJsonContent = fs.readFileSync(publicJsonPath, 'utf8');

function findFiles(dir, fileNamePattern) {
  let results = [];
  if (!fs.existsSync(dir)) return results;
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      results = results.concat(findFiles(filePath, fileNamePattern));
    } else if (fileNamePattern.test(file)) {
      results.push(filePath);
    }
  });
  return results;
}

const sessionFiles = findFiles(eventsDir, /\.json$/).filter(
  filePath => !filePath.endsWith('event.json') && filePath.includes(path.join('sessions', ''))
);

let leakedTerms = [];

sessionFiles.forEach(sessionFile => {
  const sessionData = JSON.parse(fs.readFileSync(sessionFile, 'utf8'));

  // Collect sensitive strings from activities
  if (Array.isArray(sessionData.activities)) {
    sessionData.activities.forEach((act, i) => {
      if (act.instructions) {
        leakedTerms.push({ source: sessionFile, field: `activity[${i}].instructions`, text: act.instructions });
      }
      if (act.content) {
        leakedTerms.push({ source: sessionFile, field: `activity[${i}].content`, text: act.content });
      }
    });
  }

  // Collect sensitive strings from vocabulary
  if (Array.isArray(sessionData.vocabulary)) {
    sessionData.vocabulary.forEach((vocab, i) => {
      if (vocab.word) {
        leakedTerms.push({ source: sessionFile, field: `vocabulary[${i}].word`, text: vocab.word });
      }
      if (vocab.translation) {
        leakedTerms.push({ source: sessionFile, field: `vocabulary[${i}].translation`, text: vocab.translation });
      }
      if (vocab.example) {
        leakedTerms.push({ source: sessionFile, field: `vocabulary[${i}].example`, text: vocab.example });
      }
    });
  }
});

console.log(`Checking ${leakedTerms.length} sensitive text entries from session files against public output...`);

let testFailed = false;

leakedTerms.forEach(item => {
  // Check if text appears in public-events.json
  if (item.text && item.text.trim().length > 0) {
    if (publicJsonContent.includes(item.text)) {
      console.error(`LEAK DETECTED! Text "${item.text}" from ${item.source} (${item.field}) was found in public-events.json!`);
      testFailed = true;
    }
  }
});

if (testFailed) {
  console.error('\nLeak Test FAILED: Gated content was exposed in public output!');
  process.exit(1);
} else {
  console.log('\nLeak Test PASSED: No session activities or vocabulary detected in public-events.json.');
}
