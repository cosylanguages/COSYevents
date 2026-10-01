const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
const CONFIG_PATH = path.join(ROOT_DIR, 'shared', 'config', 'contact.json');

function loadConfig() {
  if (!fs.existsSync(CONFIG_PATH)) {
    console.error(`Error: Config file not found at ${CONFIG_PATH}`);
    process.exit(1);
  }
  return JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
}

function getCandidateFiles(dir) {
  let results = [];
  const list = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of list) {
    const fullPath = path.join(dir, entry.name);
    const relPath = path.relative(ROOT_DIR, fullPath).replace(/\\/g, '/');

    if (entry.isDirectory()) {
      if (['.git', 'node_modules', 'verification'].includes(entry.name)) {
        continue;
      }
      results = results.concat(getCandidateFiles(fullPath));
    } else if (entry.isFile()) {
      if (relPath === 'shared/config/contact.json') continue;
      if (relPath.endsWith('.html') || relPath.endsWith('.js') || relPath.endsWith('.json')) {
        results.push(fullPath);
      }
    }
  }
  return results;
}

function processFile(filePath, config, isCheckMode) {
  const content = fs.readFileSync(filePath, 'utf8');
  let newContent = content;

  // 1. WhatsApp regex: wa.me/<digits> -> wa.me/<config.whatsapp>
  const waRegex = /wa\.me\/[0-9]+/g;
  newContent = newContent.replace(waRegex, `wa.me/${config.whatsapp}`);

  // 2. Telegram regex: t.me/cosylanguagesproject(?![a-zA-Z0-9_]) -> t.me/<config.telegram>
  const tgRegex = /t\.me\/cosylanguages(?![a-zA-Z0-9_])/g;
  newContent = newContent.replace(tgRegex, `t.me/${config.telegram}`);

  const changed = (content !== newContent);

  if (changed && !isCheckMode) {
    fs.writeFileSync(filePath, newContent, 'utf8');
  }

  return { filePath, changed, original: content, updated: newContent };
}

function main() {
  const isCheckMode = process.argv.includes('--check');
  const config = loadConfig();
  const files = getCandidateFiles(ROOT_DIR);

  let totalChanged = 0;
  const changedFiles = [];
  const untouchedTgLinks = [];

  for (const file of files) {
    const relPath = path.relative(ROOT_DIR, file).replace(/\\/g, '/');
    const content = fs.readFileSync(file, 'utf8');

    // Find any other t.me links for audit listing
    const tgOtherRegex = /t\.me\/[a-zA-Z0-9_/?#%=-]+/g;
    let match;
    while ((match = tgOtherRegex.exec(content)) !== null) {
      const link = match[0];
      if (!link.startsWith('t.me/' + config.telegram) && !link.startsWith('t.me/cosylanguagesproject')) {
        untouchedTgLinks.push({ file: relPath, link });
      }
    }

    const res = processFile(file, config, isCheckMode);
    if (res.changed) {
      totalChanged++;
      changedFiles.push(relPath);
      if (isCheckMode) {
        console.log(`[CHECK FAILED] Outdated contact links in: ${relPath}`);
      }
    }
  }

  if (isCheckMode) {
    if (totalChanged > 0) {
      console.error(`\nCheck failed: ${totalChanged} file(s) contain outdated contact links.`);
      process.exit(1);
    } else {
      console.log('All contact links match contact.json perfectly!');
      process.exit(0);
    }
  } else {
    console.log(`Successfully updated contact links in ${totalChanged} file(s).`);
    if (untouchedTgLinks.length > 0) {
      console.log('\nUntouched non-contact t.me links found:');
      untouchedTgLinks.forEach(item => console.log(`- ${item.file}: ${item.link}`));
    }
  }
}

if (require.main === module) {
  main();
}

module.exports = { processFile, getCandidateFiles };
