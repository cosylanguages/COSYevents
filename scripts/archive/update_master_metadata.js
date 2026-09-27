const fs = require('fs');
const path = require('path');

const sessionsData = [
  { num: 1, id: "introductions-and-first-impressions", title: "Introductions & First Impressions", date: "15 January 2027", isoDate: "2027-01-15", topic: "First Impressions & Identity", vocab: ["name", "country", "city", "job", "hobby", "language", "family", "age", "married/single", "interesting"], grammar: "to be + adjectives (I am from… / It is interesting)" },
  { num: 2, id: "work-and-career-choices", title: "Work & Career Choices", date: "22 January 2027", isoDate: "2027-01-22", topic: "Work & Career Choices", vocab: ["job", "boss", "colleague", "office", "salary", "shift", "remote", "part-time", "full-time", "career"], grammar: "Present simple for routines (I work… / She doesn’t work…)" },
  { num: 3, id: "time-management-and-daily-priorities", title: "Time Management & Daily Priorities", date: "29 January 2027", isoDate: "2027-01-29", topic: "Time Management & Routines", vocab: ["morning", "evening", "schedule", "deadline", "late", "early", "busy", "free time", "priority", "routine"], grammar: "What time…? / I usually… at…" },
  { num: 4, id: "family-roles-and-responsibilities", title: "Family Roles & Responsibilities", date: "5 February 2027", isoDate: "2027-02-05", topic: "Family & Household Dynamics", vocab: ["parent", "child", "sibling", "responsibility", "support", "care", "tradition", "generation", "household", "respect"], grammar: "Have got / has got (I’ve got two brothers. She’s got three children.)" },
  { num: 5, id: "appearance-and-first-judgments", title: "Appearance & First Judgments", date: "12 February 2027", isoDate: "2027-02-12", topic: "Appearance & Fashion Standards", vocab: ["style", "fashion", "uniform", "tattoo", "piercing", "makeup", "hairstyle", "professional", "casual", "neat"], grammar: "Adjectives to describe people (He looks… / She dresses…)" },
  { num: 6, id: "morning-routines-and-productivity", title: "Morning Routines & Productivity", date: "19 February 2027", isoDate: "2027-02-19", topic: "Morning Habits & Energy", vocab: ["alarm", "coffee", "exercise", "shower", "breakfast", "commute", "news", "podcast", "stretch", "plan"], grammar: "Adverbs of frequency (always, usually, sometimes, never)" },
  { num: 7, id: "evening-wind-down-and-work-life-balance", title: "Evening Wind-Down & Work-Life Balance", date: "26 February 2027", isoDate: "2027-02-26", topic: "Relaxation & Work-Life Balance", vocab: ["relax", "unwind", "screen", "book", "walk", "music", "family time", "hobby", "sleep", "stress"], grammar: "Like / don’t like + -ing (I like reading. I don’t like watching TV.)" },
  { num: 8, id: "home-and-living-preferences", title: "Home & Living Preferences", date: "5 March 2027", isoDate: "2027-03-05", topic: "Housing & Neighborhoods", vocab: ["apartment", "neighborhood", "rent", "mortgage", "roommate", "landlord", "quiet", "noisy", "safe", "convenient"], grammar: "There is / There are + opinions (There is a park. It’s good because…)" },
  { num: 9, id: "minimalism-vs-comfort-at-home", title: "Minimalism vs. Comfort at Home", date: "12 March 2027", isoDate: "2027-03-12", topic: "Interior Design & Living Spaces", vocab: ["clutter", "organize", "decorate", "furniture", "storage", "clean", "tidy", "cozy", "simple", "spacious"], grammar: "Prepositions of place + reasons (The sofa is next to… because…)" },
  { num: 10, id: "food-culture-and-personal-taste", title: "Food Culture & Personal Taste", date: "19 March 2027", isoDate: "2027-03-19", topic: "Food Traditions & Diets", vocab: ["cuisine", "spicy", "healthy", "fast food", "home-cooked", "vegetarian", "diet", "snack", "portion", "ingredient"], grammar: "Like / love / hate + noun/gerund (I love spicy food. I hate cooking.)" },
  { num: 11, id: "restaurants-and-social-eating", title: "Restaurants & Social Eating", date: "26 March 2027", isoDate: "2027-03-26", topic: "Dining Out & Social Food", vocab: ["reservation", "tip", "service", "atmosphere", "menu", "vegetarian option", "bill", "share", "order", "recommend"], grammar: "I would like… / Could I…? + opinions (I would like… / The service is slow.)" },
  { num: 12, id: "money-habits-and-spending-priorities", title: "Money Habits & Spending Priorities", date: "2 April 2027", isoDate: "2027-04-02", topic: "Personal Finance & Spending", vocab: ["budget", "save", "spend", "debt", "bill", "discount", "luxury", "essential", "cash", "credit card"], grammar: "How much…? / It costs… + comparisons (It’s too expensive. It’s worth it.)" },
  { num: 13, id: "fashion-and-identity", title: "Fashion & Identity", date: "9 April 2027", isoDate: "2027-04-09", topic: "Fashion & Self-Expression", vocab: ["brand", "second-hand", "outfit", "trend", "comfortable", "stylish", "expensive", "cheap", "fit", "occasion"], grammar: "Comparatives (cheaper than, more comfortable than)" },
  { num: 14, id: "weather-and-lifestyle-choices", title: "Weather & Lifestyle Choices", date: "16 April 2027", isoDate: "2027-04-16", topic: "Climate & Mood", vocab: ["climate", "season", "humid", "dry", "heatwave", "freeze", "forecast", "outdoor", "indoor", "adapt"], grammar: "It is + adjective + for + activity (It’s too cold for walking.)" },
  { num: 15, id: "hobbies-and-personal-growth", title: "Hobbies & Personal Growth", date: "23 April 2027", isoDate: "2027-04-23", topic: "Interests & Self-Improvement", vocab: ["skill", "hobby", "craft", "instrument", "sport", "creative", "relax", "challenge", "improve", "goal"], grammar: "Like / enjoy + -ing + because (I enjoy painting because it’s relaxing.)" },
  { num: 16, id: "sports-health-and-competition", title: "Sports, Health & Competition", date: "30 April 2027", isoDate: "2027-04-30", topic: "Exercise & Competition", vocab: ["gym", "team", "match", "fitness", "injury", "coach", "win", "lose", "train", "compete"], grammar: "Play / go / do + opinion (I play football. It’s fun because…)" },
  { num: 17, id: "city-life-vs-small-town", title: "City Life vs. Small Town", date: "7 May 2027", isoDate: "2027-05-07", topic: "Urban vs. Rural Living", vocab: ["traffic", "pollution", "crowd", "facility", "community", "event", "convenience", "peace", "opportunity", "commute"], grammar: "Comparatives + reasons (The city is bigger but noisier.)" },
  { num: 18, id: "transport-choices-and-sustainability", title: "Transport Choices & Sustainability", date: "14 May 2027", isoDate: "2027-05-14", topic: "Commuting & Transit", vocab: ["public transport", "bike lane", "electric car", "traffic jam", "fare", "emission", "walkable", "parking", "rush hour", "eco-friendly"], grammar: "By + transport + preference (I go by bike. It’s healthier.)" },
  { num: 19, id: "job-satisfaction-and-motivation", title: "Job Satisfaction & Motivation", date: "21 May 2027", isoDate: "2027-05-21", topic: "Career Fulfillment & Motivation", vocab: ["passion", "burnout", "promotion", "recognition", "workload", "flexible", "meaningful", "routine", "stress", "balance"], grammar: "Find + noun + adjective (I find my job stressful.)" },
  { num: 20, id: "emotions-and-mental-wellbeing", title: "Emotions & Mental Wellbeing", date: "28 May 2027", isoDate: "2027-05-28", topic: "Emotions & Stress Management", vocab: ["stress", "anxiety", "calm", "overwhelmed", "motivated", "lonely", "supported", "confident", "mood", "cope"], grammar: "Feel + adjective + when (I feel stressed when…)" },
  { num: 21, id: "health-choices-and-prevention", title: "Health Choices & Prevention", date: "4 June 2027", isoDate: "2027-06-04", topic: "Healthcare & Wellness", vocab: ["check-up", "symptom", "prevention", "diet", "exercise", "sleep", "supplement", "habit", "doctor", "advice"], grammar: "Should / shouldn’t + advice (You should sleep more.)" },
  { num: 22, id: "time-perception-and-punctuality", title: "Time Perception & Punctuality", date: "11 June 2027", isoDate: "2027-06-11", topic: "Punctuality & Cultural Norms", vocab: ["punctual", "late", "deadline", "flexible", "schedule", "appointment", "wait", "rush", "culture", "respect"], grammar: "Be + adjective + about (I’m strict about time.)" },
  { num: 23, id: "shopping-ethics-and-consumer-choices", title: "Shopping Ethics & Consumer Choices", date: "18 June 2027", isoDate: "2027-06-18", topic: "Ethical Consumerism", vocab: ["ethical", "sustainable", "local", "global", "fair trade", "waste", "recycle", "donate", "impulse", "need"], grammar: "Try to + verb + because (I try to buy local because…)" },
  { num: 24, id: "healthcare-access-and-expectations", title: "Healthcare Access & Expectations", date: "25 June 2027", isoDate: "2027-06-25", topic: "Medical Services & Access", vocab: ["insurance", "clinic", "wait time", "emergency", "prescription", "public", "private", "affordable", "quality", "trust"], grammar: "Have to / don’t have to + opinion (I have to pay for medicine.)" },
  { num: 25, id: "travel-mindset-and-cultural-curiosity", title: "Travel Mindset & Cultural Curiosity", date: "2 July 2027", isoDate: "2027-07-02", topic: "Travel Styles & Exploration", vocab: ["destination", "local", "tourist", "culture", "language barrier", "budget", "solo", "group", "adventure", "safe"], grammar: "Want to / plan to + place (I want to visit Japan.)" },
  { num: 26, id: "social-plans-and-boundaries", title: "Social Plans & Boundaries", date: "9 July 2027", isoDate: "2027-07-09", topic: "Social Life & Boundaries", vocab: ["invite", "cancel", "RSVP", "boundary", "energy", "introvert", "extrovert", "commitment", "flexible", "prioritize"], grammar: "Do you want to…? / I’d rather…" },
  { num: 27, id: "navigation-and-independence", title: "Navigation & Independence", date: "16 July 2027", isoDate: "2027-07-16", topic: "Maps, Tech & Independence", vocab: ["map", "GPS", "ask", "lost", "direction", "landmark", "explore", "confident", "anxious", "independent"], grammar: "Can / can’t + ability (I can read maps. I can’t ask for help.)" },
  { num: 28, id: "learning-styles-and-education-memories", title: "Learning Styles & Education Memories", date: "23 July 2027", isoDate: "2027-07-23", topic: "Learning & Education Systems", vocab: ["teacher", "student", "exam", "homework", "online", "classroom", "memory", "struggle", "success", "method"], grammar: "Used to + verb (I used to hate math.)" },
  { num: 29, id: "tech-dependence-and-digital-habits", title: "Session 29: Tech Dependence & Digital Habits", date: "30 July 2027", isoDate: "2027-07-30", topic: "Digital Habits & Screen Time", vocab: ["screen time", "notification", "app", "offline", "addictive", "productive", "distract", "focus", "privacy", "update"], grammar: "Spend + time + -ing (I spend too much time scrolling.)" },
  { num: 30, id: "life-reflections-and-future-hopes", title: "Session 30: Life Reflections & Future Hopes", date: "6 August 2027", isoDate: "2027-08-06", topic: "Reflections & Future Ambitions", vocab: ["dream", "goal", "regret", "achievement", "lesson", "change", "hope", "fear", "priority", "legacy"], grammar: "Would like to + verb (I’d like to travel more.)" }
];

// 1. Update data/sessions.json
const sessionsJsonPath = path.join(__dirname, '..', 'data', 'sessions.json');
let sessionsJson = JSON.parse(fs.readFileSync(sessionsJsonPath, 'utf8'));

// Filter out old basic-speaking-club sessions if any exist
sessionsJson = sessionsJson.filter(s => s.club !== 'Basic Speaking Club' && s.href?.indexOf('basic-speaking-club') === -1);

// Add new 30 sessions with schema matching existing data/sessions.json
sessionsData.forEach(s => {
  sessionsJson.push({
    title: `${s.title} : COSYlanguages`,
    href: `sessions/basic-speaking-club/session-${s.num}-${s.id}.html`,
    level: "A0-A1",
    lang: "English",
    club: "Basic Speaking Club",
    format: "Speaking Club"
  });
});

fs.writeFileSync(sessionsJsonPath, JSON.stringify(sessionsJson, null, 2), 'utf8');
console.log('data/sessions.json updated with 30 basic-speaking-club sessions.');

// 2. Update data/events/speaking-clubs.json
const scJsonPath = path.join(__dirname, '..', 'data', 'events', 'speaking-clubs.json');
let scJson = JSON.parse(fs.readFileSync(scJsonPath, 'utf8'));

// Update basic-speaking-club club record
const bscClub = scJson.clubs.find(c => c.id === 'basic-speaking-club');
if (bscClub) {
  bscClub.sessions = sessionsData.map(s => ({
    id: `bsc-${s.num}`,
    title: s.title,
    date: s.date,
    topic: s.topic,
    url: `sessions/basic-speaking-club/session-${s.num}-${s.id}.html`
  }));

  bscClub.promptDecks = sessionsData.map(s => ({
    id: `deck-bsc-${s.num}`,
    title: s.title,
    grammarFocus: s.grammar,
    vocabulary: s.vocab
  }));
}

fs.writeFileSync(scJsonPath, JSON.stringify(scJson, null, 2), 'utf8');
console.log('data/events/speaking-clubs.json updated.');

// 3. Update shared/calendar-data/events.json
const calJsonPath = path.join(__dirname, '..', 'shared', 'calendar-data', 'events.json');
let calArray = JSON.parse(fs.readFileSync(calJsonPath, 'utf8'));

const evtIndex = calArray.findIndex(e => e.id === 'evt-2025-020');
if (evtIndex !== -1) {
  calArray[evtIndex].title = "A0–A1 Basic Speaking Club Launch";
  calArray[evtIndex].date = "2027-01-15";
}

fs.writeFileSync(calJsonPath, JSON.stringify(calArray, null, 2), 'utf8');
console.log('shared/calendar-data/events.json updated.');
