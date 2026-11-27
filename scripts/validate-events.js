const fs = require('fs');
const path = require('path');
const Ajv = require('ajv');

const ajv = new Ajv({ allErrors: true });

const eventSchemaPath = path.join(__dirname, '../schemas/event.schema.json');
const sessionSchemaPath = path.join(__dirname, '../schemas/session.schema.json');

const eventSchema = JSON.parse(fs.readFileSync(eventSchemaPath, 'utf8'));
const sessionSchema = JSON.parse(fs.readFileSync(sessionSchemaPath, 'utf8'));

const validateEvent = ajv.compile(eventSchema);
const validateSession = ajv.compile(sessionSchema);

const VALID_CEFR_LEVELS = new Set(['A1', 'A2', 'B1', 'B2', 'C1', 'C2']);

const eventsDir = path.join(__dirname, '../events');

let hasErrors = false;
const eventSlugs = new Set();
const sessionSlugs = new Set();
const eventsFound = [];
const sessionsFound = [];

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

// Locate event.json files under events/
const eventFiles = findFiles(eventsDir, /^event\.json$/);
// Locate session files under events/<event-slug>/sessions/*.json
const sessionFiles = findFiles(eventsDir, /\.json$/).filter(
  filePath => !filePath.endsWith('event.json') && filePath.includes(path.join('sessions', ''))
);

console.log(`Found ${eventFiles.length} event(s) and ${sessionFiles.length} session(s).`);

// 1. Validate Events
eventFiles.forEach(filePath => {
  try {
    const rawData = fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(rawData);

    const valid = validateEvent(data);
    if (!valid) {
      console.error(`Validation error in event file ${filePath}:`);
      console.error(validateEvent.errors);
      hasErrors = true;
    }

    // Check directory name matches slug
    const dirName = path.basename(path.dirname(filePath));
    if (data.slug && data.slug !== dirName) {
      console.error(`Event slug "${data.slug}" in ${filePath} does not match directory name "${dirName}".`);
      hasErrors = true;
    }

    // Check unique event slug
    if (data.slug) {
      if (eventSlugs.has(data.slug)) {
        console.error(`Duplicate event slug "${data.slug}" found in ${filePath}.`);
        hasErrors = true;
      } else {
        eventSlugs.add(data.slug);
      }
    }

    eventsFound.push(data);
  } catch (err) {
    console.error(`Failed to read/parse ${filePath}:`, err.message);
    hasErrors = true;
  }
});

// 2. Validate Sessions
sessionFiles.forEach(filePath => {
  try {
    const rawData = fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(rawData);

    const valid = validateSession(data);
    if (!valid) {
      console.error(`Validation error in session file ${filePath}:`);
      console.error(validateSession.errors);
      hasErrors = true;
    }

    // Check file name (without ext) matches slug
    const fileSlug = path.basename(filePath, '.json');
    if (data.slug && data.slug !== fileSlug) {
      console.error(`Session slug "${data.slug}" in ${filePath} does not match file name "${fileSlug}.json".`);
      hasErrors = true;
    }

    // Check unique session slug
    if (data.slug) {
      if (sessionSlugs.has(data.slug)) {
        console.error(`Duplicate session slug "${data.slug}" found in ${filePath}.`);
        hasErrors = true;
      } else {
        sessionSlugs.add(data.slug);
      }
    }

    // Check valid CEFR level
    if (data.level && !VALID_CEFR_LEVELS.has(data.level)) {
      console.error(`Invalid session level "${data.level}" in ${filePath}. Must be one of A1, A2, B1, B2, C1, C2.`);
      hasErrors = true;
    }

    // Check vocabulary levels
    if (Array.isArray(data.vocabulary)) {
      data.vocabulary.forEach((item, idx) => {
        if (item.level && !VALID_CEFR_LEVELS.has(item.level)) {
          console.error(`Invalid vocabulary item level "${item.level}" at index ${idx} in ${filePath}.`);
          hasErrors = true;
        }
      });
    }

    // Check that session references an existing event slug
    if (data.event && !eventSlugs.has(data.event)) {
      console.error(`Session ${filePath} references non-existent event slug "${data.event}".`);
      hasErrors = true;
    }

    sessionsFound.push(data);
  } catch (err) {
    console.error(`Failed to read/parse ${filePath}:`, err.message);
    hasErrors = true;
  }
});

if (hasErrors) {
  console.error('\nValidation FAILED.');
  process.exit(1);
} else {
  console.log('\nAll events and sessions passed schema and consistency validation successfully!');
}
