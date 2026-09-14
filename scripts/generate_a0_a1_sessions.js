const fs = require('fs');
const path = require('path');

const sessionsData = [
  {
    num: 1,
    id: "introductions-first-impressions",
    title: "Introductions & First Impressions",
    clubFolder: "my-life-with-without",
    clubName: "My Life With & Without",
    clubTag: "My Life With & Without",
    backLink: "../../my-life-with-without.html",
    themeClass: "theme-life-introductions",
    gradient: "linear-gradient(135deg, #3B6D11, #1e3a08)",
    level: "Beginner (A0–A1)",
    levelShort: "A0–A1",
    topic: "First Impressions & Identity",
    date: "15 January 2027",
    desc: "A beginner-friendly adult discussion session on introducing yourself, expressing personal facts, and reflecting on first impressions.",
    vocab: [
      { word: "Name", def: "the word or words that a person is called.", ex: "My name is Sarah." },
      { word: "Country", def: "an area of land that has its own government.", ex: "I come from a beautiful country." },
      { word: "City", def: "a large and important town.", ex: "I live in a busy city." },
      { word: "Job", def: "the regular work that a person does for money.", ex: "Her job is very interesting." },
      { word: "Hobby", def: "an activity done for pleasure in free time.", ex: "Reading is my favorite hobby." },
      { word: "Language", def: "a system of communication used by a country or community.", ex: "English is a useful global language." },
      { word: "Family", def: "a group of people who are related to each other.", ex: "My family lives in Spain." },
      { word: "Age", def: "the number of years a person has lived.", ex: "He is 30 years of age." },
      { word: "Married", def: "having a husband or wife.", ex: "They have been married for five years." },
      { word: "Interesting", def: "attracting your attention or curiosity.", ex: "This book has an interesting story." }
    ],
    grammarFocus: "Present Simple of 'To Be' & Possessives",
    grammarExplanation: "We use 'to be' (am/is/are) to state identity, age, origin, and personal status (e.g. 'I am from...', 'It is interesting').",
    r1Questions: [
      { q: "What is your <strong>name</strong> and where do you live?", p: "★ Say three simple facts about yourself." },
      { q: "Which <strong>country</strong> would you like to visit this year?", p: "★ Do you like your home country?" },
      { q: "Is your <strong>city</strong> quiet or noisy?", p: "★ What do you love about your city?" },
      { q: "Do you enjoy your <strong>job</strong> or study field?", p: "★ Is your job busy today?" },
      { q: "What is a <strong>hobby</strong> you do every weekend?", p: "★ Do you prefer indoor or outdoor hobbies?" },
      { q: "Why is learning a new <strong>language</strong> important for you?", p: "★ How many languages can you speak?" },
      { q: "Do you have a big or small <strong>family</strong>?", p: "★ How often do you meet your family?" },
      { q: "At what <strong>age</strong> do people usually start working in your country?", p: "★ Is age important in your culture?" },
      { q: "Are most of your close friends <strong>married</strong> or single?", p: "★ Do you like big wedding parties?" },
      { q: "What is one <strong>interesting</strong> fact about your hometown?", p: "★ Do you meet interesting strangers often?" }
    ],
    lstTitle: "Collaborative Activity: First Impressions Card",
    lstDesc: "In pairs, exchange three key personal details (Country, Job, Hobby) and present your partner to the group using sentence frames: 'This is my partner... She/He is from... Her/His job is...'",
    r2Questions: [
      { q: "First impressions are always correct when meeting new people. : Do you agree or disagree?", p: "★ Do you trust your first impression of someone?" },
      { q: "It is easy to make new friends in a big city. : Do you agree or disagree?", p: "★ Is it easier to make friends online or in person?" },
      { q: "Learning a language gets harder with age. : Do you agree or disagree?", p: "★ Do you think adults learn faster than children?" },
      { q: "Your job defines who you are as a person. : Do you agree or disagree?", p: "★ Would you work if you had unlimited money?" },
      { q: "Moving to another country changes your personality. : Do you agree or disagree?", p: "★ Would you like to live abroad for a year?" }
    ],
    mistakes: [
      { wrong: "I have 30 years old.", right: "I am 30 years old.", note: "Use 'to be' (am/is/are) when stating age, not 'have'." },
      { wrong: "My name is John, I am come from Italy.", right: "My name is John, I come from Italy.", note: "Do not mix 'am' with base verb 'come'." },
      { wrong: "She job is interesting.", right: "Her job is interesting.", note: "Use possessive adjective 'her' before nouns." }
    ]
  },
  {
    num: 2,
    id: "work-and-career-choices",
    title: "Work & Career Choices",
    clubFolder: "my-life-with-without",
    clubName: "My Life With & Without",
    clubTag: "My Life With & Without",
    backLink: "../../my-life-with-without.html",
    themeClass: "theme-life-work",
    gradient: "linear-gradient(135deg, #3B6D11, #1e3a08)",
    level: "Beginner (A0–A1)",
    levelShort: "A0–A1",
    topic: "Work & Career Routines",
    date: "18 January 2027",
    desc: "A safe, structured discussion on work routines, job satisfaction, remote vs office work, and daily career choices.",
    vocab: [
      { word: "Job", def: "regular work done for pay.", ex: "I have a new job." },
      { word: "Boss", def: "the person who manages workers.", ex: "My boss is friendly." },
      { word: "Colleague", def: "a person you work with.", ex: "My colleague helps me." },
      { word: "Office", def: "a room or building where business work is done.", ex: "The office is near my house." },
      { word: "Salary", def: "fixed payment for work, usually paid monthly.", ex: "She gets a good salary." },
      { word: "Shift", def: "a scheduled period of work time.", ex: "He works the night shift." },
      { word: "Remote", def: "working from home or away from the central office.", ex: "I prefer remote work." },
      { word: "Part-time", def: "working fewer hours than a full schedule.", ex: "He has a part-time job." },
      { word: "Full-time", def: "working standard full hours (usually 35-40 hours).", ex: "She works full-time." },
      { word: "Career", def: "a profession or occupation chosen for life.", ex: "He wants a career in IT." }
    ],
    grammarFocus: "Present Simple for Routines (Work Focus)",
    grammarExplanation: "Use Present Simple to describe daily work tasks (e.g. 'I work in an office', 'She doesn't work on Sundays').",
    r1Questions: [
      { q: "What do you like about your current <strong>job</strong>?", p: "★ Do you prefer working with people or computers?" },
      { q: "Is your <strong>boss</strong> strict or relaxed?", p: "★ What makes a good manager?" },
      { q: "Do you eat lunch with your <strong>colleague</strong> every day?", p: "★ Do you talk about personal life with coworkers?" },
      { q: "How long does it take to travel to your <strong>office</strong>?", p: "★ Do you like big open-plan offices?" },
      { q: "Is a high <strong>salary</strong> the most important thing at work?", p: "★ What would you buy with a bonus?" },
      { q: "Do you ever work a night <strong>shift</strong>?", p: "★ Do you like working early in the morning?" },
      { q: "Why do many adults want to work <strong>remote</strong> today?", p: "★ Do you work better at home or at an office desk?" },
      { q: "Is a <strong>part-time</strong> schedule good for parents?", p: "★ Would you like to work 4 days a week?" },
      { q: "How many hours do you work in a <strong>full-time</strong> job?", p: "★ Do you work overtime often?" },
      { q: "What is your dream <strong>career</strong> for the future?", p: "★ At what age do people retire in your country?" }
    ],
    lstTitle: "Collaborative Activity: Workplace Comparison",
    lstDesc: "Compare Working from Home vs Working in an Office using the frame: 'Working from home is good because... but working in an office is better for...'",
    r2Questions: [
      { q: "Working from home is better than working in an office. : Do you agree or disagree?", p: "★ Do you feel lonely when working remotely?" },
      { q: "High salary is more important than a friendly boss. : Do you agree or disagree?", p: "★ Would you leave a job for 20% more pay?" },
      { q: "People change careers too often nowadays. : Do you agree or disagree?", p: "★ Is it easy to start a new career after 40?" }
    ],
    mistakes: [
      { wrong: "She don't like her job.", right: "She doesn't like her job.", note: "Use 'doesn't' for third person singular (he/she/it)." },
      { wrong: "I am work every day from 9 to 5.", right: "I work every day from 9 to 5.", note: "Present simple routines use base verb without 'am'." }
    ]
  },
  {
    num: 3,
    id: "time-management-daily-priorities",
    title: "Time Management & Daily Priorities",
    clubFolder: "my-life-with-without",
    clubName: "My Life With & Without",
    clubTag: "My Life With & Without",
    backLink: "../../my-life-with-without.html",
    themeClass: "theme-life-time",
    gradient: "linear-gradient(135deg, #3B6D11, #1e3a08)",
    level: "Beginner (A0–A1)",
    levelShort: "A0–A1",
    topic: "Time & Priorities",
    date: "22 January 2027",
    desc: "A practical session on managing daily schedules, asking and telling time, and discussing personal priorities.",
    vocab: [
      { word: "Morning", def: "the early part of the day ending at noon.", ex: "I drink tea in the morning." },
      { word: "Evening", def: "the period of time at the end of the day.", ex: "We rest in the evening." },
      { word: "Schedule", def: "a plan that gives times for events or tasks.", ex: "My schedule is very busy." },
      { word: "Deadline", def: "a time or date by which something must be finished.", ex: "The deadline is Friday." },
      { word: "Late", def: "after the expected or usual time.", ex: "He was late for class." },
      { word: "Early", def: "before the usual or expected time.", ex: "She wakes up early." },
      { word: "Busy", def: "having a lot of things to do.", ex: "Mondays are very busy." },
      { word: "Free time", def: "time when you do not have to work.", ex: "I walk in my free time." },
      { word: "Priority", def: "something that is more important than other things.", ex: "Health is my first priority." },
      { word: "Routine", def: "your normal fixed way of doing things.", ex: "My morning routine is simple." }
    ],
    grammarFocus: "Telling Time & Frequency Adverbs",
    grammarExplanation: "Express time using 'at + time' (e.g. at 8:00 AM) and adverbs of frequency (usually, always, sometimes, never).",
    r1Questions: [
      { q: "Are you more productive in the <strong>morning</strong> or at night?", p: "★ What time do you wake up on weekdays?" },
      { q: "How do you spend your <strong>evening</strong> after work?", p: "★ Do you watch TV or read books in the evening?" },
      { q: "Do you keep a written <strong>schedule</strong> on your phone?", p: "★ Do you like planning your week in advance?" },
      { q: "How do you feel when you have an urgent <strong>deadline</strong>?", p: "★ Do you finish tasks early or last minute?" },
      { q: "Is it bad to be 5 minutes <strong>late</strong> for a meeting?", p: "★ What do you do when a friend is late?" },
      { q: "Do you like waking up <strong>early</strong> on weekends?", p: "★ What is the best part of an early morning?" },
      { q: "When are you most <strong>busy</strong> during the week?", p: "★ What do you do to relax when you are busy?" },
      { q: "How many hours of <strong>free time</strong> do you have each day?", p: "★ Do you spend free time alone or with friends?" },
      { q: "What is your top <strong>priority</strong> for this month?", p: "★ Is family a higher priority than career?" },
      { q: "What habit would you like to add to your <strong>routine</strong>?", p: "★ Do you like spontaneous changes to your day?" }
    ],
    lstTitle: "Collaborative Activity: Ideal Daily Schedule",
    lstDesc: "Design an ideal 24-hour routine with a partner. Use frames like: 'At 7:00 AM I usually... At 1:00 PM we prefer to... In the evening I always...'",
    r2Questions: [
      { q: "Planning every hour of your day reduces stress. : Do you agree or disagree?", p: "★ Is spontaneous life better than scheduled life?" },
      { q: "Waking up early is a sign of personal success. : Do you agree or disagree?", p: "★ Can night owls be as successful as early birds?" }
    ],
    mistakes: [
      { wrong: "I wake up on 7 o'clock.", right: "I wake up at 7 o'clock.", note: "Use 'at' for specific clock times." },
      { wrong: "I usually am late.", right: "I am usually late.", note: "Adverbs of frequency come after 'to be' verbs." }
    ]
  },
  {
    num: 4,
    id: "family-roles-responsibilities",
    title: "Family Roles & Responsibilities",
    clubFolder: "my-life-with-without",
    clubName: "My Life With & Without",
    clubTag: "My Life With & Without",
    backLink: "../../my-life-with-without.html",
    themeClass: "theme-life-family",
    gradient: "linear-gradient(135deg, #3B6D11, #1e3a08)",
    level: "Beginner (A0–A1)",
    levelShort: "A0–A1",
    topic: "Family & Household Roles",
    date: "26 January 2027",
    desc: "A warm discussion on family dynamics, household responsibilities, caring for relatives, and traditions.",
    vocab: [
      { word: "Parent", def: "a father or mother.", ex: "My parents live near me." },
      { word: "Child", def: "a young human being below the age of full growth.", ex: "The child is playing." },
      { word: "Sibling", def: "a brother or sister.", ex: "I have two siblings." },
      { word: "Responsibility", def: "a duty to deal with or take care of something.", ex: "Cleaning is my responsibility." },
      { word: "Support", def: "to help someone emotionally or financially.", ex: "My family supports my goals." },
      { word: "Care", def: "the provision of what is necessary for health or welfare.", ex: "She takes care of her garden." },
      { word: "Tradition", def: "a custom passed down within a family or group.", ex: "Sunday dinner is a family tradition." },
      { word: "Generation", def: "all of the people born around the same time.", ex: "Younger generations use tech more." },
      { word: "Household", def: "a house and its occupants regarded as a unit.", ex: "There are three people in my household." },
      { word: "Respect", def: "a feeling of deep admiration for someone.", ex: "We show respect to older people." }
    ],
    grammarFocus: "Have got / Has got & Possessives",
    grammarExplanation: "Express family relationships and possessions using 'have got' (e.g. 'I've got two brothers', 'She's got three children').",
    r1Questions: [
      { q: "How often do you call or visit your <strong>parent</strong>?", p: "★ What is the best advice your parents gave you?" },
      { q: "How many <strong>child</strong>ren are there in your extended family?", p: "★ Do you like big family gatherings?" },
      { q: "Have you got any <strong>sibling</strong>s?", p: "★ Are you close with your brothers or sisters?" },
      { q: "Who has got the main household <strong>responsibility</strong> in your home?", p: "★ Do you like cooking or cleaning more?" },
      { q: "How does your family <strong>support</strong> each other in difficult times?", p: "★ Who do you talk to when you need advice?" },
      { q: "Should adult children <strong>care</strong> for elderly parents at home?", p: "★ What is the most important family duty?" },
      { q: "What is a special holiday <strong>tradition</strong> in your family?", p: "★ Do you celebrate holidays the same way every year?" },
      { q: "How is your <strong>generation</strong> different from your parents' generation?", p: "★ Is life easier or harder for young people today?" },
      { q: "Who does most chores in your <strong>household</strong>?", p: "★ Do children do chores in your home?" },
      { q: "How do you show <strong>respect</strong> to older relatives in your culture?", p: "★ What traditional values are important to you?" }
    ],
    lstTitle: "Collaborative Activity: Chore Sharing Chart",
    lstDesc: "With your group, divide 5 household chores (cooking, cleaning, shopping, budget, fixing things) fairly using: 'In our household, Person A does... because Person B prefers...'",
    r2Questions: [
      { q: "Children should care for parents when they grow old. : Do you agree or disagree?", p: "★ Is family duty the same in all cultures?" },
      { q: "Family traditions are more important than modern individual choices. : Do you agree or disagree?", p: "★ Do you keep all childhood traditions?" }
    ],
    mistakes: [
      { wrong: "I have got two brother.", right: "I've got two brothers.", note: "Plural nouns add '-s' after numbers." },
      { wrong: "She have got three children.", right: "She has got three children.", note: "Use 'has got' for he/she/it." }
    ]
  },
  {
    num: 5,
    id: "appearance-first-judgments",
    title: "Appearance & First Judgments",
    clubFolder: "debatable-relatable",
    clubName: "Debatable & Relatable",
    clubTag: "Debatable & Relatable",
    backLink: "../../debatable-relatable.html",
    themeClass: "theme-debate-appearance",
    gradient: "linear-gradient(135deg, #993C1D, #4d1e0f)",
    level: "Beginner (A0–A1)",
    levelShort: "A0–A1",
    topic: "Clothes & Dress Codes",
    date: "29 January 2027",
    desc: "A debate on style, dress codes, corporate uniforms, and how clothing influences initial judgments.",
    vocab: [
      { word: "Style", def: "a particular way of dressing or behaving.", ex: "I like casual style." },
      { word: "Fashion", def: "popular trends in clothing and appearance.", ex: "Fashion changes every year." },
      { word: "Uniform", def: "distinctive clothing worn by members of an organization.", ex: "Nurses wear a uniform." },
      { word: "Tattoo", def: "a permanent design made on the skin with ink.", ex: "He has a tattoo on his arm." },
      { word: "Piercing", def: "a small hole made in the body for jewelry.", ex: "She has an ear piercing." },
      { word: "Makeup", def: "cosmetics applied to the face.", ex: "She wears natural makeup." },
      { word: "Hairstyle", def: "the way in which a person's hair is cut or arranged.", ex: "I like his new hairstyle." },
      { word: "Professional", def: "suitable for a business or formal environment.", ex: "He looks very professional." },
      { word: "Casual", def: "relaxed and unformal in clothing.", ex: "I wear casual clothes on weekends." },
      { word: "Neat", def: "clean, tidy, and well-arranged.", ex: "His clothes are always neat." }
    ],
    grammarFocus: "Descriptive Adjectives & Look / Dress",
    grammarExplanation: "Describe appearance using 'look + adjective' (He looks neat) and 'dress + adverb/adjective' (She dresses casually).",
    r1Questions: [
      { q: "How would you describe your personal clothing <strong>style</strong>?", p: "★ Do you prefer comfort or fashion?" },
      { q: "Do you follow modern <strong>fashion</strong> trends or ignore them?", p: "★ Where do you buy your clothes?" },
      { q: "Did you wear a school <strong>uniform</strong> when you were young?", p: "★ Is a uniform good for school children?" },
      { q: "Do people with a <strong>tattoo</strong> face judgment at work?", p: "★ Do you have or want a tattoo?" },
      { q: "Are ear <strong>piercing</strong>s acceptable in all professional jobs?", p: "★ What jewelry do you wear daily?" },
      { q: "Do you think wearing <strong>makeup</strong> boosts confidence?", p: "★ How long do you take to get ready in the morning?" },
      { q: "How often do you change your <strong>hairstyle</strong>?", p: "★ Do you prefer short or long hair?" },
      { q: "What clothes make someone look <strong>professional</strong> in an interview?", p: "★ Do suits still matter today?" },
      { q: "When do you wear <strong>casual</strong> clothes during the week?", p: "★ What is your favorite comfy hoodie or shirt?" },
      { q: "Is it important to keep your clothes <strong>neat</strong> and ironed?", p: "★ Do you iron your clothes every morning?" }
    ],
    lstTitle: "Collaborative Activity: Office Dress Code Policy",
    lstDesc: "Create a simple 3-rule dress code for a modern tech company. Decide if jeans, tattoos, and casual shoes are allowed using: 'Employees can wear... but shouldn't wear...'",
    r2Questions: [
      { q: "People judge others by their clothes in the first 10 seconds. : Do you agree or disagree?", p: "★ Is first judgment fair?" },
      { q: "Companies should require formal uniforms for all office workers. : Do you agree or disagree?", p: "★ Should bosses decide employee dress?" }
    ],
    mistakes: [
      { wrong: "He look professional.", right: "He looks professional.", note: "Add '-s' for third person singular verb 'looks'." },
      { wrong: "She dress very casual.", right: "She dresses very casually.", note: "Use adverb 'casually' to modify verb 'dresses'." }
    ]
  }
];

console.log("Generating first 5 test sessions...");
