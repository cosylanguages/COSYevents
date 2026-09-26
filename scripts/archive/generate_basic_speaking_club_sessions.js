const fs = require('fs');
const path = require('path');

const sessionsDir = path.join(__dirname, '..', 'sessions', 'basic-speaking-club');
if (!fs.existsSync(sessionsDir)) {
  fs.mkdirSync(sessionsDir, { recursive: true });
}

const sessionsData = [
  {
    num: 1,
    id: "introductions-and-first-impressions",
    title: "Session 1: Introductions & First Impressions",
    date: "15 January 2027",
    isoDate: "2027-01-15",
    topic: "First Impressions & Identity",
    vocab: ["name", "country", "city", "job", "hobby", "language", "family", "age", "married/single", "interesting"],
    grammar: "to be + adjectives (I am from… / It is interesting)",
    q1: "What’s one interesting fact about your country?",
    q2: "Do you think first impressions are important? Why?",
    q3: "What’s the best way to meet new people in your city?",
    debate1: "First impressions are always correct.",
    debate2: "It is easy to make new adult friends in big cities."
  },
  {
    num: 2,
    id: "work-and-career-choices",
    title: "Session 2: Work & Career Choices",
    date: "22 January 2027",
    isoDate: "2027-01-22",
    topic: "Work & Career Choices",
    vocab: ["job", "boss", "colleague", "office", "salary", "shift", "remote", "part-time", "full-time", "career"],
    grammar: "Present simple for routines (I work… / She doesn’t work…)",
    q1: "What do you like about your job?",
    q2: "Do you prefer working from home or in an office? Why?",
    q3: "Is a high salary more important than job satisfaction?",
    debate1: "Working remotely is better than working in an office.",
    debate2: "Salary is more important than liking your job."
  },
  {
    num: 3,
    id: "time-management-and-daily-priorities",
    title: "Session 3: Time Management & Daily Priorities",
    date: "29 January 2027",
    isoDate: "2027-01-29",
    topic: "Time Management & Routines",
    vocab: ["morning", "evening", "schedule", "deadline", "late", "early", "busy", "free time", "priority", "routine"],
    grammar: "What time…? / I usually… at…",
    q1: "Are you a morning person or night person? Why?",
    q2: "What’s one habit you want to change in your routine?",
    q3: "Is it better to plan your day or be spontaneous?",
    debate1: "Waking up at 5 AM is necessary for success.",
    debate2: "Planning every hour creates more stress than freedom."
  },
  {
    num: 4,
    id: "family-roles-and-responsibilities",
    title: "Session 4: Family Roles & Responsibilities",
    date: "5 February 2027",
    isoDate: "2027-02-05",
    topic: "Family & Household Dynamics",
    vocab: ["parent", "child", "sibling", "responsibility", "support", "care", "tradition", "generation", "household", "respect"],
    grammar: "Have got / has got (I’ve got two brothers. She’s got three children.)",
    q1: "Who does most of the housework in your family?",
    q2: "Should children care for their parents when they’re old? Why?",
    q3: "Are family traditions important in your culture?",
    debate1: "Family traditions should never change.",
    debate2: "Housework should be split 50/50 in every modern family."
  },
  {
    num: 5,
    id: "appearance-and-first-judgments",
    title: "Session 5: Appearance & First Judgments",
    date: "12 February 2027",
    isoDate: "2027-02-12",
    topic: "Appearance & Fashion Standards",
    vocab: ["style", "fashion", "uniform", "tattoo", "piercing", "makeup", "hairstyle", "professional", "casual", "neat"],
    grammar: "Adjectives to describe people (He looks… / She dresses…)",
    q1: "Do you judge people by their clothes? Why/why not?",
    q2: "Should companies require uniforms?",
    q3: "Is it fair to have dress codes at work?",
    debate1: "Clothes show a person's real character.",
    debate2: "Workplaces should ban all formal dress codes."
  },
  {
    num: 6,
    id: "morning-routines-and-productivity",
    title: "Session 6: Morning Routines & Productivity",
    date: "19 February 2027",
    isoDate: "2027-02-19",
    topic: "Morning Habits & Energy",
    vocab: ["alarm", "coffee", "exercise", "shower", "breakfast", "commute", "news", "podcast", "stretch", "plan"],
    grammar: "Adverbs of frequency (always, usually, sometimes, never)",
    q1: "What’s your non-negotiable morning habit?",
    q2: "Is waking up early a sign of success?",
    q3: "Do you check your phone first thing in the morning? Is that good?",
    debate1: "Checking smartphones in bed ruins morning focus.",
    debate2: "Coffee is essential for good morning productivity."
  },
  {
    num: 7,
    id: "evening-wind-down-and-work-life-balance",
    title: "Session 7: Evening Wind-Down & Work-Life Balance",
    date: "26 February 2027",
    isoDate: "2027-02-26",
    topic: "Relaxation & Work-Life Balance",
    vocab: ["relax", "unwind", "screen", "book", "walk", "music", "family time", "hobby", "sleep", "stress"],
    grammar: "Like / don’t like + -ing (I like reading. I don’t like watching TV.)",
    q1: "How do you relax after work?",
    q2: "Is it hard to “switch off” from work? Why?",
    q3: "Do you think people work too much nowadays?",
    debate1: "Work emails should be blocked after 6 PM.",
    debate2: "Watching TV before sleep helps reduce stress."
  },
  {
    num: 8,
    id: "home-and-living-preferences",
    title: "Session 8: Home & Living Preferences",
    date: "5 March 2027",
    isoDate: "2027-03-05",
    topic: "Housing & Neighborhoods",
    vocab: ["apartment", "neighborhood", "rent", "mortgage", "roommate", "landlord", "quiet", "noisy", "safe", "convenient"],
    grammar: "There is / There are + opinions (There is a park. It’s good because…)",
    q1: "Do you prefer living in the city or countryside? Why?",
    q2: "Is it better to rent or buy a home?",
    q3: "What makes a neighborhood “good” for you?",
    debate1: "Buying a home is always smarter than renting.",
    debate2: "Living in a quiet village is better than a bustling city."
  },
  {
    num: 9,
    id: "minimalism-vs-comfort-at-home",
    title: "Session 9: Minimalism vs. Comfort at Home",
    date: "12 March 2027",
    isoDate: "2027-03-12",
    topic: "Interior Design & Living Spaces",
    vocab: ["clutter", "organize", "decorate", "furniture", "storage", "clean", "tidy", "cozy", "simple", "spacious"],
    grammar: "Prepositions of place + reasons (The sofa is next to… because…)",
    q1: "Do you prefer a minimalist or cozy home? Why?",
    q2: "Is it important to decorate your home?",
    q3: "Can a tidy home reduce stress?",
    debate1: "Minimalism makes homes cold and unwelcoming.",
    debate2: "A cluttered home reflects a cluttered mind."
  },
  {
    num: 10,
    id: "food-culture-and-personal-taste",
    title: "Session 10: Food Culture & Personal Taste",
    date: "19 March 2027",
    isoDate: "2027-03-19",
    topic: "Food Traditions & Diets",
    vocab: ["cuisine", "spicy", "healthy", "fast food", "home-cooked", "vegetarian", "diet", "snack", "portion", "ingredient"],
    grammar: "Like / love / hate + noun/gerund (I love spicy food. I hate cooking.)",
    q1: "What’s a food people in your country love but foreigners find strange?",
    q2: "Is fast food a problem in your city?",
    q3: "Do you think cooking is a life skill everyone should have?",
    debate1: "Home-cooked meals are always better than restaurant meals.",
    debate2: "Fast food should be taxed higher to encourage healthy eating."
  },
  {
    num: 11,
    id: "restaurants-and-social-eating",
    title: "Session 11: Restaurants & Social Eating",
    date: "26 March 2027",
    isoDate: "2027-03-26",
    topic: "Dining Out & Social Food",
    vocab: ["reservation", "tip", "service", "atmosphere", "menu", "vegetarian option", "bill", "share", "order", "recommend"],
    grammar: "I would like… / Could I…? + opinions (I would like… / The service is slow.)",
    q1: "Do you prefer cooking at home or eating out? Why?",
    q2: "Is tipping necessary? Why/why not?",
    q3: "What makes a restaurant “good” for you?",
    debate1: "Tipping should be mandatory in all restaurants.",
    debate2: "Eating out is a waste of money."
  },
  {
    num: 12,
    id: "money-habits-and-spending-priorities",
    title: "Session 12: Money Habits & Spending Priorities",
    date: "2 April 2027",
    isoDate: "2027-04-02",
    topic: "Personal Finance & Spending",
    vocab: ["budget", "save", "spend", "debt", "bill", "discount", "luxury", "essential", "cash", "credit card"],
    grammar: "How much…? / It costs… + comparisons (It’s too expensive. It’s worth it.)",
    q1: "Are you a saver or a spender? Why?",
    q2: "Is it better to spend on experiences or things?",
    q3: "Do young people today have harder financial lives than their parents?",
    debate1: "Cash is better than credit cards.",
    debate2: "Spending money on travel is better than saving for a house."
  },
  {
    num: 13,
    id: "fashion-and-identity",
    title: "Session 13: Fashion & Identity",
    date: "9 April 2027",
    isoDate: "2027-04-09",
    topic: "Fashion & Self-Expression",
    vocab: ["brand", "second-hand", "outfit", "trend", "comfortable", "stylish", "expensive", "cheap", "fit", "occasion"],
    grammar: "Comparatives (cheaper than, more comfortable than)",
    q1: "Do clothes express who you are? How?",
    q2: "Is it okay to buy cheap clothes if they look good?",
    q3: "Are big brands worth the price?",
    debate1: "Designer brands are a waste of money.",
    debate2: "Fast fashion should be banned to protect the environment."
  },
  {
    num: 14,
    id: "weather-and-lifestyle-choices",
    title: "Session 14: Weather & Lifestyle Choices",
    date: "16 April 2027",
    isoDate: "2027-04-16",
    topic: "Climate & Mood",
    vocab: ["climate", "season", "humid", "dry", "heatwave", "freeze", "forecast", "outdoor", "indoor", "adapt"],
    grammar: "It is + adjective + for + activity (It’s too cold for walking.)",
    q1: "Do you prefer hot or cold climates? Why?",
    q2: "Does weather affect your mood? How?",
    q3: "Would you move to another country for better weather?",
    debate1: "Cold weather is better because you can dress warmly.",
    debate2: "Sunny weather makes people happier and more productive."
  },
  {
    num: 15,
    id: "hobbies-and-personal-growth",
    title: "Session 15: Hobbies & Personal Growth",
    date: "23 April 2027",
    isoDate: "2027-04-23",
    topic: "Interests & Self-Improvement",
    vocab: ["skill", "hobby", "craft", "instrument", "sport", "creative", "relax", "challenge", "improve", "goal"],
    grammar: "Like / enjoy + -ing + because (I enjoy painting because it’s relaxing.)",
    q1: "What hobby would you like to start? Why?",
    q2: "Are hobbies important for mental health?",
    q3: "Is it ever “too late” to learn something new?",
    debate1: "Everyone needs at least one creative hobby.",
    debate2: "Adults don't have enough time for real hobbies."
  },
  {
    num: 16,
    id: "sports-health-and-competition",
    title: "Session 16: Sports, Health & Competition",
    date: "30 April 2027",
    isoDate: "2027-04-30",
    topic: "Exercise & Competition",
    vocab: ["gym", "team", "match", "fitness", "injury", "coach", "win", "lose", "train", "compete"],
    grammar: "Play / go / do + opinion (I play football. It’s fun because…)",
    q1: "Is competition good or bad for motivation?",
    q2: "Should companies pay for employees’ gym memberships?",
    q3: "Do you prefer team sports or individual exercise? Why?",
    debate1: "Companies should mandate 30 minutes of exercise during work.",
    debate2: "Winning is more important than participating."
  },
  {
    num: 17,
    id: "city-life-vs-small-town",
    title: "Session 17: City Life vs. Small Town",
    date: "7 May 2027",
    isoDate: "2027-05-07",
    topic: "Urban vs. Rural Living",
    vocab: ["traffic", "pollution", "crowd", "facility", "community", "event", "convenience", "peace", "opportunity", "commute"],
    grammar: "Comparatives + reasons (The city is bigger but noisier.)",
    q1: "Do you prefer city or small-town life? Why?",
    q2: "Is city life too stressful nowadays?",
    q3: "What’s one thing your city/town needs more of?",
    debate1: "Big cities are harmful to long-term health.",
    debate2: "Small towns offer a higher quality of life than big capitals."
  },
  {
    num: 18,
    id: "transport-choices-and-sustainability",
    title: "Session 18: Transport Choices & Sustainability",
    date: "14 May 2027",
    isoDate: "2027-05-14",
    topic: "Commuting & Transit",
    vocab: ["public transport", "bike lane", "electric car", "traffic jam", "fare", "emission", "walkable", "parking", "rush hour", "eco-friendly"],
    grammar: "By + transport + preference (I go by bike. It’s healthier.)",
    q1: "Should cities ban cars from the center?",
    q2: "Do you prefer driving or public transport? Why?",
    q3: "Is your city easy to get around without a car?",
    debate1: "City centers should ban private cars completely.",
    debate2: "Public transport should be free for all residents."
  },
  {
    num: 19,
    id: "job-satisfaction-and-motivation",
    title: "Session 19: Job Satisfaction & Motivation",
    date: "21 May 2027",
    isoDate: "2027-05-21",
    topic: "Career Fulfillment & Motivation",
    vocab: ["passion", "burnout", "promotion", "recognition", "workload", "flexible", "meaningful", "routine", "stress", "balance"],
    grammar: "Find + noun + adjective (I find my job stressful.)",
    q1: "Is it better to love your job or have a high salary?",
    q2: "What makes a job “meaningful”?",
    q3: "Do you think people change jobs too often now?",
    debate1: "Passion is more important than job stability.",
    debate2: "Working hard always leads to career success."
  },
  {
    num: 20,
    id: "emotions-and-mental-wellbeing",
    title: "Session 20: Emotions & Mental Wellbeing",
    date: "28 May 2027",
    isoDate: "2027-05-28",
    topic: "Emotions & Stress Management",
    vocab: ["stress", "anxiety", "calm", "overwhelmed", "motivated", "lonely", "supported", "confident", "mood", "cope"],
    grammar: "Feel + adjective + when (I feel stressed when…)",
    q1: "What helps you when you feel stressed?",
    q2: "Is it okay to talk about mental health in your culture?",
    q3: "Do people talk too much or too little about feelings?",
    debate1: "Talking about stress reduces its effect.",
    debate2: "Modern life is significantly more stressful than in the past."
  },
  {
    num: 21,
    id: "health-choices-and-prevention",
    title: "Session 21: Health Choices & Prevention",
    date: "4 June 2027",
    isoDate: "2027-06-04",
    topic: "Healthcare & Wellness",
    vocab: ["check-up", "symptom", "prevention", "diet", "exercise", "sleep", "supplement", "habit", "doctor", "advice"],
    grammar: "Should / shouldn’t + advice (You should sleep more.)",
    q1: "Do you go to the doctor only when sick or for check-ups?",
    q2: "Is prevention better than cure? Why?",
    q3: "Are people in your country too dependent on medicine?",
    debate1: "Annual health check-ups should be compulsory.",
    debate2: "Lifestyle choices matter more than medical care."
  },
  {
    num: 22,
    id: "time-perception-and-punctuality",
    title: "Session 22: Time Perception & Punctuality",
    date: "11 June 2027",
    isoDate: "2027-06-11",
    topic: "Punctuality & Cultural Norms",
    vocab: ["punctual", "late", "deadline", "flexible", "schedule", "appointment", "wait", "rush", "culture", "respect"],
    grammar: "Be + adjective + about (I’m strict about time.)",
    q1: "Is being late disrespectful in your culture?",
    q2: "Are some countries more relaxed about time? Is that good?",
    q3: "Do smartphones make us better or worse with time?",
    debate1: "Being 5 minutes late is always unacceptable.",
    debate2: "Flexible schedules create happier employees."
  },
  {
    num: 23,
    id: "shopping-ethics-and-consumer-choices",
    title: "Session 23: Shopping Ethics & Consumer Choices",
    date: "18 June 2027",
    isoDate: "2027-06-18",
    topic: "Ethical Consumerism",
    vocab: ["ethical", "sustainable", "local", "global", "fair trade", "waste", "recycle", "donate", "impulse", "need"],
    grammar: "Try to + verb + because (I try to buy local because…)",
    q1: "Do you care where your clothes/food come from?",
    q2: "Is it realistic to be an “ethical consumer”?",
    q3: "Should governments tax fast fashion?",
    debate1: "Consumers are responsible for environmental damage.",
    debate2: "Buying local products is always better than buying imported ones."
  },
  {
    num: 24,
    id: "healthcare-access-and-expectations",
    title: "Session 24: Healthcare Access & Expectations",
    date: "25 June 2027",
    isoDate: "2027-06-25",
    topic: "Medical Services & Access",
    vocab: ["insurance", "clinic", "wait time", "emergency", "prescription", "public", "private", "affordable", "quality", "trust"],
    grammar: "Have to / don’t have to + opinion (I have to pay for medicine.)",
    q1: "Is healthcare in your country affordable?",
    q2: "Should healthcare be free for everyone?",
    q3: "Do you trust doctors in your country? Why/why not?",
    debate1: "Healthcare should be 100% free for all citizens.",
    debate2: "Private clinics provide better quality care than public ones."
  },
  {
    num: 25,
    id: "travel-mindset-and-cultural-curiosity",
    title: "Session 25: Travel Mindset & Cultural Curiosity",
    date: "2 July 2027",
    isoDate: "2027-07-02",
    topic: "Travel Styles & Exploration",
    vocab: ["destination", "local", "tourist", "culture", "language barrier", "budget", "solo", "group", "adventure", "safe"],
    grammar: "Want to / plan to + place (I want to visit Japan.)",
    q1: "Do you prefer being a tourist or living like a local?",
    q2: "Is solo travel better than group travel? Why?",
    q3: "What’s one country you’ll never visit? Why?",
    debate1: "Traveling alone is better than traveling with friends.",
    debate2: "Tourism does more harm than good to historic cities."
  },
  {
    num: 26,
    id: "social-plans-and-boundaries",
    title: "Session 26: Social Plans & Boundaries",
    date: "9 July 2027",
    isoDate: "2027-07-09",
    topic: "Social Life & Boundaries",
    vocab: ["invite", "cancel", "RSVP", "boundary", "energy", "introvert", "extrovert", "commitment", "flexible", "prioritize"],
    grammar: "Do you want to…? / I’d rather…",
    q1: "Is it okay to cancel plans last minute? When?",
    q2: "Do you say “no” easily to social events? Why/why not?",
    q3: "Are people too busy nowadays for real friendship?",
    debate1: "Canceling plans last minute is never acceptable.",
    debate2: "Introverts enjoy social events just as much as extroverts."
  },
  {
    num: 27,
    id: "navigation-and-independence",
    title: "Session 27: Navigation & Independence",
    date: "16 July 2027",
    isoDate: "2027-07-16",
    topic: "Maps, Tech & Independence",
    vocab: ["map", "GPS", "ask", "lost", "direction", "landmark", "explore", "confident", "anxious", "independent"],
    grammar: "Can / can’t + ability (I can read maps. I can’t ask for help.)",
    q1: "Do you use GPS or ask people for directions?",
    q2: "Is getting lost a bad experience or an adventure?",
    q3: "Are people less independent because of smartphones?",
    debate1: "Smartphones have made people worse at basic survival skills.",
    debate2: "Getting lost in a new city is the best way to explore."
  },
  {
    num: 28,
    id: "learning-styles-and-education-memories",
    title: "Session 28: Learning Styles & Education Memories",
    date: "23 July 2027",
    isoDate: "2027-07-23",
    topic: "Learning & Education Systems",
    vocab: ["teacher", "student", "exam", "homework", "online", "classroom", "memory", "struggle", "success", "method"],
    grammar: "Used to + verb (I used to hate math.)",
    q1: "What’s your best memory from school?",
    q2: "Do you prefer online or in-person learning? Why?",
    q3: "Is the education system in your country too strict or too relaxed?",
    debate1: "Online learning is just as effective as classroom learning.",
    debate2: "Traditional exams do not measure real intelligence."
  },
  {
    num: 29,
    id: "tech-dependence-and-digital-habits",
    title: "Session 29: Tech Dependence & Digital Habits",
    date: "30 July 2027",
    isoDate: "2027-07-30",
    topic: "Digital Habits & Screen Time",
    vocab: ["screen time", "notification", "app", "offline", "addictive", "productive", "distract", "focus", "privacy", "update"],
    grammar: "Spend + time + -ing (I spend too much time scrolling.)",
    q1: "Are you addicted to your phone? In what way?",
    q2: "Is technology making us less social?",
    q3: "Should companies limit employees’ screen time?",
    debate1: "Smartphones are harmful to adult social connection.",
    debate2: "Social media does more good than harm."
  },
  {
    num: 30,
    id: "life-reflections-and-future-hopes",
    title: "Session 30: Life Reflections & Future Hopes",
    date: "6 August 2027",
    isoDate: "2027-08-06",
    topic: "Reflections & Future Ambitions",
    vocab: ["dream", "goal", "regret", "achievement", "lesson", "change", "hope", "fear", "priority", "legacy"],
    grammar: "Would like to + verb (I’d like to travel more.)",
    q1: "What’s one thing you’re proud of?",
    q2: "Do you have any regrets? What did you learn?",
    q3: "What’s one goal for the next year?",
    debate1: "Setting 5-year goals is better than living day-by-day.",
    debate2: "Regrets are valuable learning opportunities."
  }
];

function generateHTML(session) {
  const vocabPills = session.vocab.map(v => `<span class="vocab-pill">${v}</span>`).join('\n          ');
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${session.title} — Basic Speaking Club (A0–A1)</title>
  <link rel="stylesheet" href="../../styles/main.css">
  <link rel="stylesheet" href="../../styles/session.css">
  <style>
    .vocab-grid {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      margin: 15px 0;
    }
    .vocab-pill {
      background-color: var(--color-background-soft, #f0f4f1);
      color: var(--color-primary-dark, #1c3b2b);
      padding: 6px 14px;
      border-radius: 20px;
      font-weight: 600;
      font-size: 0.95rem;
      border: 1px solid var(--color-border, #e0e8e3);
    }
    .frame-box {
      background-color: #f8faf9;
      border-left: 4px solid #2d6a4f;
      padding: 15px;
      margin: 15px 0;
      border-radius: 0 8px 8px 0;
    }
    .question-card {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 16px;
      margin-bottom: 12px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.02);
    }
  </style>
</head>
<body class="session-page">
  <header class="site-header">
    <div class="header-container">
      <a href="../../index.html" class="logo">
        <span class="logo-icon">🌱</span>
        <span class="logo-text">COSY Events</span>
      </a>
      <nav class="main-nav">
        <a href="../../speaking-clubs.html">Speaking Clubs</a>
        <a href="../../basic-speaking-club.html">Basic Speaking Club</a>
        <a href="../../browse.html">Catalog</a>
      </nav>
    </div>
  </header>

  <main class="session-main">
    <article class="session-container">
      <div class="session-header">
        <div class="badge-row">
          <span class="badge level-badge">Beginner (A0–A1)</span>
          <span class="badge club-badge">Basic Speaking Club</span>
        </div>
        <h1>${session.title}</h1>
        <p class="session-date">📅 ${session.date}</p>
        <p class="session-lead">A welcoming, structured speaking environment for adult beginners focusing on everyday preferences and practical language.</p>
      </div>

      <div class="session-grid">
        <section class="session-section">
          <h2>1. Warm-Up & Vocabulary Activation (15 min)</h2>
          <p>Get comfortable with today's essential high-utility adult vocabulary:</p>
          <div class="vocab-grid">
            ${vocabPills}
          </div>
          <div class="frame-box">
            <strong>Target Grammar Focus:</strong> <code>${session.grammar}</code>
          </div>
        </section>

        <section class="session-section">
          <h2>2. Round 1: Guided Discussion Questions (20 min)</h2>
          <p>Use simple frames ("I think...", "I prefer...", "In my opinion...") to answer these questions with your partner:</p>
          <div class="question-card">
            <p><strong>1.</strong> ${session.q1}</p>
          </div>
          <div class="question-card">
            <p><strong>2.</strong> ${session.q2}</p>
          </div>
          <div class="question-card">
            <p><strong>3.</strong> ${session.q3}</p>
          </div>
        </section>

        <section class="session-section">
          <h2>3. Let's Speak Together: Pair Activity (15 min)</h2>
          <p>Take turns asking your partner questions and building your speaking confidence:</p>
          <ul>
            <li><strong>Student A:</strong> Asks Question 1 & 2. Uses follow-up: <em>"Why do you think so?"</em></li>
            <li><strong>Student B:</strong> Responds using sentence frame: <em>"I prefer [...] because [...]"</em></li>
            <li>Switch roles for Question 3.</li>
          </ul>
        </section>

        <section class="session-section">
          <h2>4. Round 2: Friendly Debate / Stance (10 min)</h2>
          <p>Express your opinion on these adult discussion statements:</p>
          <ul>
            <li>🗣️ <em>"${session.debate1}"</em> — Agree or Disagree?</li>
            <li>🗣️ <em>"${session.debate2}"</em> — Agree or Disagree?</li>
          </ul>
        </section>

        <section class="session-section">
          <h2>5. Facilitator's Correction Note</h2>
          <p>Remember: Fluency over perfection! Focus on communicating clear ideas and asking basic follow-up questions.</p>
        </section>
      </div>

      <div class="session-footer">
        <a href="../../basic-speaking-club.html" class="btn btn-secondary">← Back to Basic Speaking Club</a>
      </div>
    </article>
  </main>

  <footer class="site-footer">
    <div class="footer-container">
      <p>&copy; 2027 COSYlanguages Ecosystem. Designed for supportive language practice.</p>
    </div>
  </footer>
</body>
</html>
`;
}

sessionsData.forEach(session => {
  const filePath = path.join(sessionsDir, `session-${session.num}-${session.id}.html`);
  fs.writeFileSync(filePath, generateHTML(session), 'utf8');
  console.log(`Generated: ${filePath}`);
});

console.log('All 30 sessions generated successfully.');
