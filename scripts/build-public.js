const fs = require('fs');
const path = require('path');

const eventsDir = path.join(__dirname, '../events');
const outputFile = path.join(__dirname, '../public-events.json');

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

const eventFiles = findFiles(eventsDir, /^event\.json$/);
const sessionFiles = findFiles(eventsDir, /\.json$/).filter(
  filePath => !filePath.endsWith('event.json') && filePath.includes(path.join('sessions', ''))
);

const eventsMap = new Map();

eventFiles.forEach(filePath => {
  const eventData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  eventsMap.set(eventData.slug, {
    slug: eventData.slug,
    title: eventData.title,
    description: eventData.description,
    languages: eventData.languages,
    status: eventData.status,
    sessions: []
  });
});

sessionFiles.forEach(filePath => {
  const sessionData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  const event = eventsMap.get(sessionData.event);

  if (event) {
    // STRICTLY include ONLY title, theme, date, and language
    event.sessions.push({
      title: sessionData.title,
      theme: sessionData.theme,
      date: sessionData.date,
      language: sessionData.language
    });
  }
});

const publicData = Array.from(eventsMap.values());

fs.writeFileSync(outputFile, JSON.stringify(publicData, null, 2), 'utf8');
console.log(`Successfully generated public JSON at ${outputFile} containing ${publicData.length} event(s).`);
