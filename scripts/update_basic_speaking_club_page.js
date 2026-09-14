const fs = require('fs');
const path = require('path');

const sessionsData = [
  { num: 1, id: "introductions-and-first-impressions", title: "Introductions & First Impressions", level: "a0 a1", levelLabel: "A0–A1", desc: "Express name, country, city, job, and hobbies with 'to be' and simple adjectives." },
  { num: 2, id: "work-and-career-choices", title: "Work & Career Choices", level: "a0 a1", levelLabel: "A0–A1", desc: "Talk about office schedules, colleagues, salary, and remote vs office choices." },
  { num: 3, id: "time-management-and-daily-priorities", title: "Time Management & Priorities", level: "a0 a1", levelLabel: "A0–A1", desc: "Discuss morning routines, busy schedules, deadlines, and free time priorities." },
  { num: 4, id: "family-roles-and-responsibilities", title: "Family Roles & Responsibilities", level: "a0 a1", levelLabel: "A0–A1", desc: "Discuss family members, household responsibilities, support, and traditions." },
  { num: 5, id: "appearance-and-first-judgments", title: "Appearance & First Judgments", level: "a0 a1", levelLabel: "A0–A1", desc: "Explore personal style, workplace dress codes, uniforms, and fashion judgments." },
  { num: 6, id: "morning-routines-and-productivity", title: "Morning Routines & Productivity", level: "a0 a1", levelLabel: "A0–A1", desc: "Master frequency adverbs (always, usually, never) describing morning habits." },
  { num: 7, id: "evening-wind-down-and-work-life-balance", title: "Evening Wind-Down & Balance", level: "a0 a1", levelLabel: "A0–A1", desc: "Share evening relaxation routines, switching off from work, and handling stress." },
  { num: 8, id: "home-and-living-preferences", title: "Home & Living Preferences", level: "a0 a1", levelLabel: "A0–A1", desc: "Compare city vs countryside living, renting vs buying, and good neighborhoods." },
  { num: 9, id: "minimalism-vs-comfort-at-home", title: "Minimalism vs. Comfort at Home", level: "a0 a1", levelLabel: "A0–A1", desc: "Discuss cozy vs simple interiors, home organization, storage, and clutter." },
  { num: 10, id: "food-culture-and-personal-taste", title: "Food Culture & Personal Taste", level: "a0 a1", levelLabel: "A0–A1", desc: "Express food likes/dislikes, spicy dishes, fast food, and home cooking traditions." },
  { num: 11, id: "restaurants-and-social-eating", title: "Restaurants & Social Eating", level: "a0 a1", levelLabel: "A0–A1", desc: "Practice dining out phrases, reservations, tipping ethics, and menu recommendations." },
  { num: 12, id: "money-habits-and-spending-priorities", title: "Money Habits & Spending", level: "a0 a1", levelLabel: "A0–A1", desc: "Discuss saving vs spending, budgets, essential vs luxury items, and prices." },
  { num: 13, id: "fashion-and-identity", title: "Fashion & Identity", level: "a0 a1", levelLabel: "A0–A1", desc: "Talk about self-expression through clothes, big brands, second-hand, and comfort." },
  { num: 14, id: "weather-and-lifestyle-choices", title: "Weather & Lifestyle Choices", level: "a0 a1", levelLabel: "A0–A1", desc: "Discuss hot vs cold climates, weather impacts on mood, and outdoor activities." },
  { num: 15, id: "hobbies-and-personal-growth", title: "Hobbies & Personal Growth", level: "a0 a1", levelLabel: "A0–A1", desc: "Share creative hobbies, skills to learn, relaxation, and self-improvement goals." },
  { num: 16, id: "sports-health-and-competition", title: "Sports, Health & Competition", level: "a0 a1", levelLabel: "A0–A1", desc: "Discuss fitness routines, team vs individual sports, competition, and motivation." },
  { num: 17, id: "city-life-vs-small-town", title: "City Life vs. Small Town", level: "a0 a1", levelLabel: "A0–A1", desc: "Compare urban excitement with small-town peace, traffic, facilities, and stress." },
  { num: 18, id: "transport-choices-and-sustainability", title: "Transport Choices & Sustainability", level: "a0 a1", levelLabel: "A0–A1", desc: "Talk about public transit, driving, bike lanes, electric cars, and pedestrian zones." },
  { num: 19, id: "job-satisfaction-and-motivation", title: "Job Satisfaction & Motivation", level: "a0 a1", levelLabel: "A0–A1", desc: "Discuss meaningful work, avoiding burnout, passion vs salary, and flexible hours." },
  { num: 20, id: "emotions-and-mental-wellbeing", title: "Emotions & Mental Wellbeing", level: "a0 a1", levelLabel: "A0–A1", desc: "Express feelings, stress coping methods, confidence, and open conversations." },
  { num: 21, id: "health-choices-and-prevention", title: "Health Choices & Prevention", level: "a0 a1", levelLabel: "A0–A1", desc: "Give wellness advice using 'should/shouldn't', medical check-ups, and habits." },
  { num: 22, id: "time-perception-and-punctuality", title: "Time Perception & Punctuality", level: "a0 a1", levelLabel: "A0–A1", desc: "Explore cultural time norms, punctuality, deadlines, and schedule flexibility." },
  { num: 23, id: "shopping-ethics-and-consumer-choices", title: "Shopping Ethics & Consumer Choices", level: "a0 a1", levelLabel: "A0–A1", desc: "Discuss sustainable shopping, buying local, impulse buys, and waste reduction." },
  { num: 24, id: "healthcare-access-and-expectations", title: "Healthcare Access & Expectations", level: "a0 a1", levelLabel: "A0–A1", desc: "Express opinions on medical care access, insurance, clinics, and doctor trust." },
  { num: 25, id: "travel-mindset-and-cultural-curiosity", title: "Travel Mindset & Cultural Curiosity", level: "a0 a1", levelLabel: "A0–A1", desc: "Compare tourist vs local experiences, solo travel, budget trips, and destination hopes." },
  { num: 26, id: "social-plans-and-boundaries", title: "Social Plans & Boundaries", level: "a0 a1", levelLabel: "A0–A1", desc: "Practice making/canceling plans politely, setting social boundaries, and energy." },
  { num: 27, id: "navigation-and-independence", title: "Navigation & Independence", level: "a0 a1", levelLabel: "A0–A1", desc: "Discuss asking for directions, using GPS maps, getting lost, and independence." },
  { num: 28, id: "learning-styles-and-education-memories", title: "Learning Styles & Education", level: "a0 a1", levelLabel: "A0–A1", desc: "Share school memories with 'used to', online vs classroom learning, and methods." },
  { num: 29, id: "tech-dependence-and-digital-habits", title: "Tech Dependence & Digital Habits", level: "a0 a1", levelLabel: "A0–A1", desc: "Examine screen time, digital distractions, notifications, and smartphone habits." },
  { num: 30, id: "life-reflections-and-future-hopes", title: "Life Reflections & Future Hopes", level: "a0 a1", levelLabel: "A0–A1", desc: "Express proud achievements, future ambitions, and goals using 'would like to'." }
];

const cardsHTML = sessionsData.map(s => `
<div class="basic-card history-session" data-level="${s.level}">
<div>
<div style="display:flex; gap:0.5rem; margin-bottom:0.5rem;"><span class="club-tag" style="background:#E1F5EE; color:#0F6E56; font-weight:700; font-size:0.75rem; padding:2px 8px; border-radius:4px;">Session ${s.num} • ${s.levelLabel}</span></div>
<h4 style="margin:0 0 0.5rem; font-family:'Playfair Display', serif; font-size:1.1rem; color:var(--ink);">${s.title}</h4>
<p style="font-size:0.85rem; color:var(--muted); margin-bottom:1rem; line-height:1.5;">${s.desc}</p>
</div>
<div style="display:flex; justify-content:space-between; align-items:center;">
<a href="sessions/basic-speaking-club/session-${s.num}-${s.id}.html" style="background:#0F6E56; color:#fff; text-decoration:none; padding:0.4rem 0.8rem; border-radius:6px; font-size:0.8rem; font-weight:600;">Open Session Deck ➔</a>
</div>
</div>`).join('\n');

const fullHTML = `<!DOCTYPE html>

<html lang="en">
<head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>Basic Speaking Club (A0–A1) 🌱 : COSYlanguages</title>
<link href="shared/images/logo.png" rel="icon"/>
<link href="https://fonts.googleapis.com" rel="preconnect"/>
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,500;0,700;1,500&amp;family=DM+Sans:wght@300;400;500&amp;family=Nunito:ital,wght@0,400;0,600;0,700;0,800;0,900;1,700&amp;display=swap" rel="stylesheet"/>
<link rel="stylesheet" href="shared/css/sessions.css">
<style>
  .hero h1, .section-header h2 { font-family: 'Playfair Display', serif; }
  .club-hero { background: linear-gradient(135deg, #0F6E56, #07382c); color: white; padding: 4rem 2rem; text-align: center; }
  .club-hero h1 { font-size: clamp(2rem, 5vw, 3rem); margin-bottom: 1rem; }
  .club-hero p { max-width: 600px; margin: 0 auto; opacity: 0.9; }
  .filter-btn {
    padding: 0.5rem 1rem;
    border-radius: 20px;
    border: 1px solid var(--border);
    background: var(--cream, #FAF7F2);
    cursor: pointer;
    font-size: 0.85rem;
    font-weight: 600;
    transition: all 0.2s ease;
  }
  .filter-btn:hover { background: var(--border); }
  .filter-btn.active { background: #0F6E56; color: white; border-color: #0F6E56; }
  .basic-session-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 1.25rem;
    margin-top: 1.5rem;
  }
  .basic-card {
    background: #FFF;
    border: 1px solid var(--border);
    border-radius: 16px;
    padding: 1.25rem;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    transition: transform 0.2s, box-shadow 0.2s;
  }
  .basic-card:hover { transform: translateY(-3px); box-shadow: var(--shadow-md, 0 10px 20px rgba(0,0,0,0.08)); }
</style>
</head>
<body>
<nav id="cosy-nav"></nav>
<header class="club-hero">
<div style="font-size: 3rem; margin-bottom: 0.5rem;">🌱</div>
<h1>Basic Speaking Club (A0–A1)</h1>
<p>Safe, structured, beginner-friendly discussion sessions designed for adults. Build immediate conversational confidence through clear sentence frames, essential high-utility vocabulary, and guided peer interaction.</p>
</header>
<section class="container" style="padding: 2rem 1.5rem 5rem;">
<a class="back-link" href="speaking-clubs.html" style="margin-bottom: 2rem; display: inline-flex; align-items: center; gap: 0.5rem; text-decoration: none; color: var(--muted); font-size: 0.9rem;">← All Speaking Clubs</a>
<div class="club-content-grid" style="display: grid; grid-template-columns: 1fr 320px; gap: 2rem;">
<div class="club-main">

<div class="section-header" style="margin-bottom: 1.5rem;">
<h2 style="font-size: 1.5rem;">📅 Live Session Info</h2>
</div>
<div class="session-info"><table>
<tr><td>Format</td><td>Basic Adult Speaking Club (A0–A1)</td></tr>
<tr><td>Description</td><td>Interactive 60-minute adult speaking sessions focused on safe topics, essential grammar formulas, and guided discussion.</td></tr>
<tr><td>Schedule</td><td>Weekly live sessions in CET timezone</td></tr>
<tr><td>Duration</td><td>60 min</td></tr>
<tr><td>Languages</td><td>🇬🇧 English</td></tr>
</table></div>
<div style="display:flex;gap:10px;align-items:center;margin-top:1rem;">
<a class="join-btn" href="https://wa.me/330766784195?text=Hi!%20I%27d%20like%20to%20join%20the%20A0-A1%20Basic%20Speaking%20Club." style="background:#0F6E56; color:white; padding:0.6rem 1.2rem; border-radius:8px; text-decoration:none; font-weight:700;">💬 Register interest</a>
</div>

<!-- HISTORY / SESSIONS CATALOG -->
<div class="history-block" id="basic-hist" style="margin-top: 3rem;">
<div class="section-header" style="margin-bottom: 1rem;">
<h2 style="font-size: 1.5rem;">📚 Complete 30-Session Curriculum Catalog</h2>
<p style="font-size: 0.9rem; color: var(--muted); margin-top: 0.25rem;">Browse all ready-to-teach adult A0–A1 session decks below.</p>
</div>

<div class="club-filters-level" style="justify-content: flex-start; margin-bottom: 1.5rem; display: flex; gap: 0.5rem; flex-wrap: wrap;">
<button class="filter-btn active" data-level="all">All Sessions</button>
<button class="filter-btn" data-level="a0">A0 Starter</button>
<button class="filter-btn" data-level="a1">A1 Elementary</button>
</div>

<div class="basic-session-grid">
${cardsHTML}
</div>
</div>

</div>

<div class="club-sidebar">
<div class="sidebar-promo" style="background: var(--cream); padding: 1.5rem; border-radius: 16px; border: 1px solid var(--border);">
<h3 style="font-size: 1rem; margin-bottom: .5rem; color: #0F6E56;">A0–A1 Teaching Formula</h3>
<p style="font-size: .85rem; color: var(--muted); line-height: 1.5;">Every session follows a safe 60-minute framework: Warm-up → Vocabulary → Sentence Frames → Guided Discussion → Collaborative Activity → Reflection.</p>
</div>
</div>
</div>
</section>

<footer>
<div class="footer-inner">
<div class="footer-brand">
<div class="fb-logo">
<img alt="COSYlanguages logo" src="shared/images/logo.png"/>
<span class="fb-name">COSYlanguages</span>
</div>
<p>Your friendly corner to master new languages and connect with the world. 🌍</p>
</div>
<div class="footer-links-col">
<h5>Courses</h5>
<a href="https://cosylanguages.github.io/COSYlanguages/apps/premium-courses/general/">General Course 📖</a>
<a href="https://cosylanguages.github.io/COSYlanguages/apps/premium-courses/spoken/">Spoken Course 🗣️</a>
</div>
<div class="footer-links-col">
<h5>Explore</h5>
<a href="https://cosylanguages.github.io/COSYlanguages/#languages">Languages 🌍</a>
<a href="practice/index.html">Free Practice 💡</a>
<a href="speaking-clubs.html">Events 🎉</a>
</div>
<div class="footer-links-col">
<h5>Contact</h5>
<a href="https://wa.me/330766784195">WhatsApp 📱</a>
<a href="https://t.me/cosylanguagesproject">Telegram ✈️</a>
</div>
</div>
<div class="footer-bottom">© 2026 COSYlanguages : All rights reserved</div>
</footer>
<script src="shared/js/cosyevents-session.js"></script>
</body>
</html>`;

fs.writeFileSync(path.join(__dirname, '..', 'basic-speaking-club.html'), fullHTML, 'utf8');
console.log('basic-speaking-club.html updated with all 30 session cards.');
