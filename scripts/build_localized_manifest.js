const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
const LANGUAGES = ['fr', 'it', 'ru', 'el'];
const MANIFEST_PATH = path.join(ROOT_DIR, 'shared', 'i18n', 'localized-pages.json');
const ALIASES_PATH = path.join(ROOT_DIR, 'shared', 'i18n', 'aliases.json');

function scanHtmlFiles(dir, langPrefix) {
  let results = [];
  if (!fs.existsSync(dir)) return results;

  const list = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of list) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (['.git', 'node_modules', 'verification'].includes(entry.name)) continue;
      results = results.concat(scanHtmlFiles(fullPath, langPrefix));
    } else if (entry.isFile() && entry.name.endsWith('.html')) {
      const relPath = path.relative(ROOT_DIR, fullPath).replace(/\\/g, '/');
      results.push(relPath);
    }
  }
  return results;
}

function buildManifestData() {
  let pages = [];
  for (const lang of LANGUAGES) {
    const langDir = path.join(ROOT_DIR, lang);
    const langPages = scanHtmlFiles(langDir, lang);
    pages = pages.concat(langPages);
  }
  pages.sort();
  return {
    languages: LANGUAGES,
    pages: pages
  };
}

function checkAliasesExistOnDisk() {
  if (!fs.existsSync(ALIASES_PATH)) {
    console.error(`Error: Aliases file not found at ${ALIASES_PATH}`);
    return false;
  }
  let aliases;
  try {
    aliases = JSON.parse(fs.readFileSync(ALIASES_PATH, 'utf8'));
  } catch (err) {
    console.error(`Error parsing ${ALIASES_PATH}:`, err.message);
    return false;
  }

  let valid = true;
  if (aliases && Array.isArray(aliases.groups)) {
    for (const group of aliases.groups) {
      for (const [langKey, pagePath] of Object.entries(group)) {
        if (typeof pagePath === 'string') {
          const absPath = path.join(ROOT_DIR, pagePath);
          if (!fs.existsSync(absPath)) {
            console.error(`Error: Path "${pagePath}" in aliases.json does not exist on disk.`);
            valid = false;
          }
        }
      }
    }
  }
  return valid;
}

function main() {
  const isCheckMode = process.argv.includes('--check');
  const manifestData = buildManifestData();
  const manifestJson = JSON.stringify(manifestData, null, 2) + '\n';

  if (isCheckMode) {
    let success = true;

    if (!checkAliasesExistOnDisk()) {
      success = false;
    }

    if (!fs.existsSync(MANIFEST_PATH)) {
      console.error(`Error: Manifest file does not exist at ${MANIFEST_PATH}`);
      success = false;
    } else {
      const existingContent = fs.readFileSync(MANIFEST_PATH, 'utf8');
      if (existingContent !== manifestJson) {
        console.error(`Error: ${MANIFEST_PATH} is out of date. Run "npm run build-i18n" to update it.`);
        success = false;
      }
    }

    if (!success) {
      process.exit(1);
    } else {
      console.log('Manifest and aliases check passed successfully.');
      process.exit(0);
    }
  } else {
    // Write mode
    const i18nDir = path.dirname(MANIFEST_PATH);
    if (!fs.existsSync(i18nDir)) {
      fs.mkdirSync(i18nDir, { recursive: true });
    }
    fs.writeFileSync(MANIFEST_PATH, manifestJson, 'utf8');
    console.log(`Successfully generated ${MANIFEST_PATH} with ${manifestData.pages.length} localized pages.`);
  }
}

if (require.main === module) {
  main();
}

module.exports = { buildManifestData, scanHtmlFiles };
