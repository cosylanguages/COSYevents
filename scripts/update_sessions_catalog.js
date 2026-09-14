const fs = require('fs');

// Update data/sessions.json
const sessionsFile = 'data/sessions.json';
const sessionsData = JSON.parse(fs.readFileSync(sessionsFile, 'utf8'));

const basicSessionFiles = fs.readdirSync('sessions/basic-speaking-club').filter(f => f.endsWith('.html'));

// Sort session files by session number
basicSessionFiles.sort((a, b) => {
  const numA = parseInt(a.match(/session-(\d+)-/)?.[1] || 0);
  const numB = parseInt(b.match(/session-(\d+)-/)?.[1] || 0);
  return numA - numB;
});

for (const f of basicSessionFiles) {
  const href = `sessions/basic-speaking-club/${f}`;
  if (!sessionsData.find(s => s.href === href)) {
    const num = f.match(/session-(\d+)-/)?.[1];
    const nameWords = f.replace(/session-\d+-/, '').replace('.html', '').split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1));
    const title = `Session ${num}: ${nameWords.join(' ')} : COSYlanguages`;
    sessionsData.push({
      title: title,
      href: href,
      level: num === '1' ? 'A0' : 'A1',
      lang: 'English',
      club: 'Basic Speaking Club',
      format: 'Speaking Club'
    });
  }
}

fs.writeFileSync(sessionsFile, JSON.stringify(sessionsData, null, 2), 'utf8');
console.log(`Updated data/sessions.json! Total items now: ${sessionsData.length}`);

// Update shared/calendar-data/events.json
const calendarFile = 'shared/calendar-data/events.json';
const calendarData = JSON.parse(fs.readFileSync(calendarFile, 'utf8'));

if (!calendarData.find(e => e.id === 'evt-2025-020')) {
  calendarData.push({
    id: "evt-2025-020",
    title: "A0–A1 Basic Speaking Club Launch",
    type: "speaking-club",
    language: "English",
    level: "A1",
    date: "2025-10-15",
    time: "18:00",
    timezone: "CET",
    host: "COSY Teacher Team",
    host_bio: "Experienced ESL beginner coaches specializing in safe adult conversation delivery.",
    description: "Launch session for the A0–A1 Basic Adult Speaking Club curriculum covering introductions, career choices, daily schedules, and guided adult conversation.",
    registration_link: "https://wa.me/330766784195",
    materials: "https://cosylanguages.github.io/COSYevents/basic-speaking-club.html",
    conversionStatus: "planned",
    convertedLessonUrl: null
  });
  fs.writeFileSync(calendarFile, JSON.stringify(calendarData, null, 2), 'utf8');
  console.log('Updated shared/calendar-data/events.json with evt-2025-020!');
}
