const fs = require('fs');
const path = require('path');

const file = 'data/events/speaking-clubs.json';
const data = JSON.parse(fs.readFileSync(file, 'utf8'));

const basicClub = {
  id: "basic-speaking-club",
  title: "Basic Speaking Club (A0–A1)",
  description: "Safe, structured, beginner-friendly adult discussion sessions covering high-utility vocabulary, daily routines, work choices, food, money, and personal choices.",
  level_range: "A0–A1",
  prompts: [
    {
      level: "A0",
      category: "Introductions & First Impressions",
      text: "What is your name, country, and favorite hobby?"
    },
    {
      level: "A1",
      category: "Work & Career Choices",
      text: "Do you prefer working remotely from home or in an office?"
    },
    {
      level: "A1",
      category: "Time Management & Priorities",
      text: "What is your non-negotiable morning routine habit?"
    }
  ],
  pinnedBatches: [
    {
      title: "🌱 A0–A1 Adult Foundations Series",
      description: "Master essential beginner sentence frames, high-utility vocabulary, and adult discussion confidence.",
      levels: ["A0", "A1"],
      sessions: [
        {
          title: "Session 1: Introductions & First Impressions (A0–A1)",
          href: "../sessions/basic-speaking-club/session-1-introductions-and-first-impressions.html"
        },
        {
          title: "Session 2: Work & Career Choices (A0–A1)",
          href: "../sessions/basic-speaking-club/session-2-work-and-career-choices.html"
        },
        {
          title: "Session 3: Time Management & Priorities (A0–A1)",
          href: "../sessions/basic-speaking-club/session-3-time-management-and-daily-priorities.html"
        }
      ]
    }
  ],
  sessions: []
};

// Add all 30 session hrefs
const sessionFiles = fs.readdirSync('sessions/basic-speaking-club').filter(f => f.endsWith('.html'));

// Sort session files by session number
sessionFiles.sort((a, b) => {
  const numA = parseInt(a.match(/session-(\d+)-/)?.[1] || 0);
  const numB = parseInt(b.match(/session-(\d+)-/)?.[1] || 0);
  return numA - numB;
});

for (const f of sessionFiles) {
  const num = f.match(/session-(\d+)-/)?.[1];
  const namePart = f.replace(/session-\d+-/, '').replace('.html', '').split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  basicClub.sessions.push({
    title: `Session ${num}: ${namePart}`,
    href: `../sessions/basic-speaking-club/${f}`,
    level: "A0–A1"
  });
}

// Add basicClub to data.clubs if not already present
if (!data.clubs.find(c => c.id === basicClub.id)) {
  data.clubs.unshift(basicClub);
}

fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf8');
console.log('Successfully updated data/events/speaking-clubs.json with basic-speaking-club!');
