# COSYlanguages A0–A1 Speaking Club Teacher Manual

## Part 1. Teaching Philosophy, Classroom Management & Lesson Delivery System

This is the teacher-facing layer of the entire A0–A1 speaking ecosystem.

The goal is not simply to "teach vocabulary". The teacher's mission is:
> Create a safe environment where beginners produce meaningful language every lesson.

At A0–A1, learners should gradually move from:
1. Recognising words
2. Producing short phrases
3. Answering questions
4. Asking questions
5. Maintaining simple conversations

This matches CEFR A1 expectations: learners should be able to interact simply, ask and answer basic questions about familiar topics, introduce themselves, talk about people they know, where they live and things they have.

---

### COSYlanguages Beginner Teacher Identity

A COSY teacher is NOT:
- ❌ A grammar lecturer
- ❌ A vocabulary translator
- ❌ A mistake hunter

A COSY teacher IS:
- ✅ A conversation architect
- ✅ A confidence builder
- ✅ A language coach
- ✅ A facilitator of communication

---

### Part 1. The Golden Rules of A0–A1 Teaching

#### Rule 1. Speaking Time > Teacher Time
- **Teacher:** 30%
- **Students:** 70%

The beginner classroom should be full of questions, answers, repetition, interaction, and personalisation — not explanations.

#### Rule 2. Teach Language Through Meaning
- **Avoid:** "Today we study Present Simple."
- **Instead:**
  - Teacher: "What do you do every morning?"
  - Student: "I wake up. I drink coffee. I work."
  - Teacher: "Great! We use this structure to talk about routines."

#### Rule 3. Every Word Needs a Life
Never teach isolated words. Vocabulary must immediately become communication.
- **Kitchen:** "This is my kitchen." / "I cook in my kitchen." / "My kitchen is big."

#### Rule 4. Beginners Need Recycling
Words must cycle through:
`First contact` → `Recognition` → `Production` → `Personalisation`

#### Rule 5. Errors Are Normal
- Student: "I have 25 years."
- Teacher: "Great! You are 25 years old."
- Student: "Ah, I am 25 years old."

---

### Part 2. The Six-Card Session Structure

Every session page in the club follows the same six cards. The order never changes,
so the group always knows what happens next and all their attention stays on the words.

**Where the content lives.** The topic content for all 30 sessions is in
`data/basic-speaking-club-sessions.json`. The pages in `sessions/basic-speaking-club/`
and their Markdown twins are generated from it:

```
npm run build-basic-speaking-club     # regenerate pages and markdown
npm run check-basic-speaking-club     # fail if a page is out of date
```

Edit the data file, not the HTML. A new session is a new object in the array — the six
cards, the timings and the helper sheet come from the template.

| Card | Time | What happens | What students produce |
|---|---|---|---|
| 1. Intro + 10 core words | 10 min | Ten words with pictures or real objects; show, repeat, then pairs test each other | Single words, pointing, repetition |
| 2. Discussion + opinion chunks | 10 min | One question, one model answer, then think → partner → room | One opinion sentence |
| 3. Which will you choose? | 10 min | Three this-or-that choices; hands up first, then say the line | "I prefer X" plus a reason if ready |
| 4. Real-life mini-action | 15 min | Role-play in pairs: order, ask, or solve a small everyday problem | A four to six line exchange |
| 5. Looking ahead | 8 min | Simple future frames about tonight, the weekend, next week | One plan sentence |
| 6. Outro & takeaway | 5 min | One word you liked + one tiny goal, then board work | Two short sentences |

Cards 1–6 total 58 minutes, which leaves two minutes of slack. Card 4 is the only
card that gets more time when the group is slow. For a 90-minute club, run the six
cards first and add a second round of Card 4 with new partners.

**How to run Card 4:** demo with one strong student (2 min) → pairs (5 min) →
swap roles (5 min) → one pair performs for the room (3 min). Without the demo, A0
pairs freeze on the first line.

### Part 2b. The Chunk Ladder

Do not pick one difficulty level for the room. Put all three rungs on the table card
and let people climb when they are ready. Never ask which rung someone is on.

| Function | A0 (survival) | A0+ (sentence) | A1 (reason) |
|---|---|---|---|
| Opinion | Good. Bad. I like it. | I think it is good. For me, it is noisy. | I think it is good because it is quiet. |
| Preference | This. That. I like this. | I prefer coffee. I like tea more. | I prefer tea because coffee is too hot for me. |
| Future | Tomorrow — home. | Tomorrow I work at home. | Next week I will work at home. |

Two rules keep the ladder honest:

1. **One frame per card is compulsory.** The A0 rung is the minimum, never the fallback.
2. **The A1 rung is offered, not taught.** Say it once, write it on the board, leave it there.

### Part 2c. Delivery Routines

- **Rehearse, then perform.** Cards 2, 3 and 5 go: think alone (30 seconds) → say it to your partner → two or three people say it to the room.
- **Delayed correction only.** Keep a small paper. Write three errors, maximum, without interrupting. At Card 6 put them on the board as "we said / we can say".
- **Point, don't explain.** If a word fails, point at the picture, mime it, or give the first sound. Translation is the last resort, and only for a noun.
- **Same seat, new partner.** Card 4 always swaps partners; Cards 2 and 3 keep the same partner.

---

### Part 3. Correction Triangle

1. **Fluency First:** Do not interrupt every mistake during speaking.
2. **Correct Communication Errors:** Priority on meaning problems and key grammar over minor articles/endings.
3. **Reformulation Method:** Upgrade student utterances naturally without harsh correction.

---

## Part 2. Complete Teacher Scripts & Classroom Language

### Starting the Session
- "Hello everyone! Welcome to COSY Speaking Club. How are you today?"
- "What is your name?" → "My name is..." → "Nice to meet you!"

### Vocabulary Formula: Show → Check → Connect → Personalise
1. **Show:** "Look. What is this?"
2. **Pronunciation:** "Listen and repeat..."
3. **Connect:** "Where is the...?"
4. **Personalise:** "Do you have a...?" → "I have a..."

### Scaffolding Discussion Frames
Display these frames on the board for adult A0–A1 discussions:
- `"I prefer _ to _ because ."`
- `"In my opinion, _ is good/bad because ."`
- `"I agree / I disagree because ."`
- `"In my country, we ."`
- `"I think _ is more important than ."`

---

## Part 3. 30-Session Curriculum Blueprint

### Overview
30 adult-centered, discussion-focused sessions covering everyday preferences, lifestyle choices, habits, work, money, technology, health, and travel.

The grammar column below is the **A1 rung** of the chunk ladder for that session. The
A0 rung is always a shorter version of the same frame (for example `I want…` before
`I would like…`), so a session never depends on a structure the group has not met yet.

1. **Session 1:** Introductions & First Impressions (*to be + adjectives*)
2. **Session 2:** Work & Career Choices (*Present Simple routines*)
3. **Session 3:** Time Management & Daily Priorities (*What time...? / I usually...*)
4. **Session 4:** Family Roles & Responsibilities (*Have got / Has got*)
5. **Session 5:** Appearance & First Judgments (*Adjectives to describe people*)
6. **Session 6:** Morning Routines & Productivity (*Adverbs of frequency*)
7. **Session 7:** Evening Wind-Down & Work-Life Balance (*Like/don't like + -ing*)
8. **Session 8:** Home & Living Preferences (*There is / There are + opinions*)
9. **Session 9:** Minimalism vs. Comfort at Home (*Prepositions of place*)
10. **Session 10:** Food Culture & Personal Taste (*Like / love / hate + gerund*)
11. **Session 11:** Restaurants & Social Eating (*I would like... / Could I...?*)
12. **Session 12:** Money Habits & Spending Priorities (*How much...? / It costs...*)
13. **Session 13:** Fashion & Identity (*Comparatives*)
14. **Session 14:** Weather & Lifestyle Choices (*It is + adj + for + activity*)
15. **Session 15:** Hobbies & Personal Growth (*Like / enjoy + -ing + because*)
16. **Session 16:** Sports, Health & Competition (*Play / go / do + opinion*)
17. **Session 17:** City Life vs. Small Town (*Comparatives + reasons*)
18. **Session 18:** Transport Choices & Sustainability (*By + transport + preference*)
19. **Session 19:** Job Satisfaction & Motivation (*Find + noun + adjective*)
20. **Session 20:** Emotions & Mental Wellbeing (*Feel + adjective + when*)
21. **Session 21:** Health Choices & Prevention (*Should / shouldn't + advice*)
22. **Session 22:** Time Perception & Punctuality (*Be + adjective + about*)
23. **Session 23:** Shopping Ethics & Consumer Choices (*Try to + verb + because*)
24. **Session 24:** Healthcare Access & Expectations (*Have to / don't have to*)
25. **Session 25:** Travel Mindset & Cultural Curiosity (*Want to / plan to + place*)
26. **Session 26:** Social Plans & Boundaries (*Do you want to...? / I'd rather...*)
27. **Session 27:** Navigation & Independence (*Can / can't + ability*)
28. **Session 28:** Learning Styles & Education Memories (*Used to + verb*)
29. **Session 29:** Tech Dependence & Digital Habits (*Spend + time + -ing*)
30. **Session 30:** Life Reflections & Future Hopes (*Would like to + verb*)
