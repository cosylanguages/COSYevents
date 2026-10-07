# Speaking Clubs Specification & Templates

## 1. Core Principles
- **Immersion First:** All session content (topics, questions, notes) should be in the target language where possible.
- **The 5-Part Session Structure:** Every session (past or active) must follow this sequence:
  1. **Warm-up:** Uses the `<vim-choice>` component for interactive vocabulary, grammar, and expressions.
  2. **Round 1:** Core discussion questions or quick-fire activities.
  3. **Let's Speak Together:** Visual/interactive element (image sets, choices).
  4. **Round 2:** Advanced discussion, debates, or future-focused statements.
  5. **Teacher's Note (Linguistic Corrections):** Review of linguistic mistakes made during the session.
- **Role-Based Reality:**
  - **Free Visitors:** See the club list, description, source media links, and free essential source-extracted vocabulary (10 units). Everything after the free vocabulary section (paid vocabulary & discussion structure) is gated in the free version.
  - **Students / Active Members:** See schedules, free source vocabulary, paid/gated expanded discussion vocabulary, full discussion rounds, and full past session history.
  - **Teachers:** See everything students see + preparation topics + active mistake notes area.
- **Interactivity:** Toggles for Vocabulary, Rounds, and Mistake Notes.

## 1.1 Free vs. Paid Vocabulary Model
- **Free Source Vocabulary:**
  - Mandatory 10 vocabulary units extracted directly from reference sources (articles, videos, songs, films, books, summary podcasts).
  - Purpose: Helps participants understand the primary material before attending the session.
  - Open to all site visitors.
- **Paid / Gated Vocabulary:**
  - Advanced, precise vocabulary, collocations, and speaking expressions designed to expand speaking ability and discussion depth.
  - Used actively across discussion rounds.
  - Gated behind authentication/subscription (`shared/js/cosyevents-session.js` / Supabase auth).

## 1.2 "Keeping Up with Science" Club Specification
- **Focus:** Articles, scientific papers, research findings, and popular science podcasts.
- **Target Levels:**
  - Elementary (`A2`, `A2+`)
  - Intermediate (`B1`, `B1+`)
  - Advanced (`C1`, `C1+`)
- **Mandatory Step:** Reading the research article or summary script before the session is an **obligatory requirement**.
- **Media Triad & Alternative Access:** Each session integrates 3 reference media assets:
  1. Original Research Article 📖
  2. Summary & Podcast Script (written in our words, serving as the script for the podcast) 📜
  3. Podcast Audio / Video (Alternative Access) 🎙️
  *Note:* The original research article, written summary script, and podcast audio represent the exact same core source material. The audio version is provided for participants who prefer listening or are unable to access the original article text.
- **Session Uniqueness Rule:** While templates provide generic guidance, **each session is unique**. All warm-up questions, Round 1 analysis, intermediate tasks, Round 2 projections, and wrap-up activities MUST specifically address the unique research topic of that session.
- **Round Requirements (Canonical 6-Part Flow):**
  1. **🟠 Warm-up:** Introduction to the research topic, initial engagement, and source material check.
  2. **🔵 Round 1 (Theoretical Research Analysis & Article Focus):** 10 theoretical items focusing on the article, summary script, and podcast. Every item MUST feature a core science/theoretical question paired with a personal application question (`.round-item-main` + `.round-item-personal`).
  3. **🟣 Intermediate Discussion (Grammar Practice & Collaborative Synthesis):** Interactive grammar exercise on target connectors (e.g. contrast/cause-effect), followed by visual diagram synthesis or scenario cards (Let's Speak Together / Scientific Thinking / Headline Game).
  4. **🟢 Round 2 (Agree / Disagree Statements & Future Projections):** 10 agree/disagree statements and future/speculative projections. Every item MUST feature a statement/projection paired with a personal stance question (`.round-item-main` + `.round-item-personal`).
  5. **🎤 Wrap-up & Reflection (Homework / Additional Discussion / Challenge):** Final synthesis, 1-minute TED Talk style presentation or reflection challenge for homework and post-session discussion.
  6. **✏️ Teacher's Note:** Linguistic corrections following the 3-color error-type standard.

## 2. Visual Guidelines
- **Typography:** Headers: `'Playfair Display'`, Body: `'DM Sans'`, Content: `'Nunito'`.
- **Club Colors:** Science (`#0F6E56`), Celebrate (`#BA7517`), Quotes (`#534AB7`), Mind (`#993556`), Life (`#3B6D11`), Debate (`#993C1D`).
- **Section Accents:** Warm-up (`#FAEEE8`), Round 1 (`#E1F5EE`), Speak Together (`#EEEDFE`), Round 2 (`#EAF3DE`), Mistakes (`#FFF8F5`).

## 3. Round Type Templates
Clubs use various round activities. Use the following structures inside `.round-body`:

- **Questions:** Standard list of discussion points.
- **Agree/Disagree:** `[STATEMENT] — Do you agree or disagree?`
- **True/False:** `[FACT/MYTH] — Is this true or false in your experience?`
- **Real/Unreal:** `[SCENARIO] — Is this a real possibility or just science fiction?`
- **Believe it / Ain't believe it:** `[UNBELIEVABLE FACT] — Do you believe it?`
- **Possible/Impossible:** `[GOAL/TASK] — Is this possible today or impossible?`
- **Role Play:** `Speaker A: [ROLE], Speaker B: [ROLE]. Scenario: [SITUATION].`
- **Finish the Idea:** `[SENTENCE STARTER] ... (complete with your own ideas).`

## 4. Vocabulary Format
All vocabulary entries must follow this pattern:
`Word – definition. Example: Sentence using the word.`

## 5. HTML Template: Session Entry (History)
Place inside `.history-body` of a club card.

```html
<div class="history-session" id="[SESSION_ID]" style="margin-bottom:1rem;border:1px solid var(--border);border-radius:10px;overflow:hidden;">
  <div class="history-session-header" onclick="toggleBlock('[SESSION_ID]')" style="display:flex;align-items:center;justify-content:space-between;padding:.5rem .85rem;cursor:pointer;font-size:.8rem;font-weight:500;background:#FAF7F2;user-select:none;">
    <span>[SESSION TOPIC] <span class="history-date" style="font-size:.72rem;color:var(--muted);font-weight:400;margin-left:.5rem;">[DATE]</span></span>
    <span class="round-toggle">▼</span>
  </div>
  <div class="history-session-body" style="display:none;padding:.65rem .85rem .85rem;border-top:1px solid var(--border);">
    <div class="rounds-container" style="display:flex;flex-direction:column;gap:.65rem;">

      <!-- 1. WARM-UP -->
      <div class="round-block warm-up" id="[SESSION_ID]-warm">
        <div class="round-header" style="background:#FAEEE8;" onclick="toggleRound('[SESSION_ID]-warm')">
          <span>🟠 Warm-up</span><span class="round-toggle">▼</span>
        </div>
        <div class="round-body">
          <p><vim-image resource-id="[ID]"></vim-image></p>
          <vim-instruction>[INSTRUCTION]</vim-instruction>
          <vim-choice>
            <vim-choice-option>
              <vim-choice-option-title>Vokabeln</vim-choice-option-title>
              <vim-choice-option-content>
                <ul>
                  <li>[WORD]</li>
                </ul>
              </vim-choice-option-content>
            </vim-choice-option>
            <vim-choice-option>
              <vim-choice-option-title>Grammatik</vim-choice-option-title>
              <vim-choice-option-content>
                <vim-blockquote importance="basic">
                  <h2>[TITLE]</h2>
                  <p>[CONTENT]</p>
                </vim-blockquote>
              </vim-choice-option-content>
            </vim-choice-option>
          </vim-choice>
        </div>
      </div>

      <!-- 2. ROUND 1 -->
      <div class="round-block" id="[SESSION_ID]-r1">
        <div class="round-header" style="background:#E1F5EE;" onclick="toggleRound('[SESSION_ID]-r1')">
          <span>🔵 Round 1 — [TYPE]</span><span class="round-toggle">▼</span>
        </div>
        <div class="round-body">
          <!-- Template varies by type (Agree/Disagree, Questions, etc.) -->
          <div class="round-item">
             <div class="round-item-main"><strong>1.</strong> [CONTENT]</div>
          </div>
        </div>
      </div>

      <!-- 3. LET'S SPEAK TOGETHER -->
      <div class="round-block lst" id="[SESSION_ID]-lst">
        <div class="round-header" style="background:#EEEDFE;" onclick="toggleRound('[SESSION_ID]-lst')">
          <span>🟣 Let's Speak Together</span><span class="round-toggle">▼</span>
        </div>
        <div class="round-body">
          <p class="round-instruction">[INSTRUCTION]</p>
          <div class="lst-grid" style="display:grid; grid-template-columns:repeat(auto-fit, minmax(120px, 1fr)); gap:10px;">
             <!-- Image Item -->
             <div class="lst-item" style="text-align:center;">
                <img src="[URL]" style="width:100%; border-radius:8px; margin-bottom:5px;">
                <div style="font-size:.75rem; font-weight:600;">[LABEL]</div>
             </div>
          </div>
        </div>
      </div>

      <!-- 4. ROUND 2 -->
      <div class="round-block" id="[SESSION_ID]-r2">
        <div class="round-header" style="background:#EAF3DE;" onclick="toggleRound('[SESSION_ID]-r2')">
          <span>🟢 Round 2 — Deep Dive</span><span class="round-toggle">▼</span>
        </div>
        <div class="round-body">
          <div class="round-item">
             <div class="round-item-main"><strong>1.</strong> [STATEMENT/QUESTION]</div>
          </div>
        </div>
      </div>

      <!-- 5. TEACHER'S NOTE (LINGUISTIC CORRECTIONS) -->
      <div class="mistake-block" id="[SESSION_ID]-mistakes">
        <div class="mistake-header" onclick="toggleBlock('[SESSION_ID]-mistakes')">
          <span>✏️ Teacher's Note (Linguistic Corrections)</span><span class="round-toggle">▼</span>
        </div>
        <div class="mistake-body">
          <!-- 1. Extra/Wrong Word Example -->
          <div class="mistake-item">
            <span class="mistake-wrong">He <span class="mistake-flag-wrong">have</span> went to Paris</span>
            <span class="mistake-arrow">→</span>
            <span class="mistake-right">He <span class="mistake-flag-right">has</span> gone to Paris</span>
            <span class="mistake-note-text">(Wrong word: 'have' vs singular auxiliary 'has' for present perfect)</span>
          </div>

          <!-- 2. Missing Word Example -->
          <div class="mistake-item">
            <span class="mistake-wrong">She lives <span class="mistake-null">X</span> Paris</span>
            <span class="mistake-arrow">→</span>
            <span class="mistake-right">She lives <span class="mistake-flag-right">in</span> Paris</span>
            <span class="mistake-note-text">(Missing preposition 'in')</span>
          </div>

          <!-- 3. Word Order / Structure Example -->
          <div class="mistake-item">
            <span class="mistake-wrong"><span class="mistake-part-subj">We</span> <span class="mistake-part-verb">discussed</span> <span class="mistake-part-mod">yesterday</span> <span class="mistake-part-obj">the problem</span></span>
            <span class="mistake-arrow">→</span>
            <span class="mistake-right"><span class="mistake-part-subj">We</span> <span class="mistake-part-verb">discussed</span> <span class="mistake-part-obj">the problem</span> <span class="mistake-part-mod">yesterday</span></span>
            <span class="mistake-note-text">(Word order: Subject + Verb + Object + Modifier)</span>
          </div>
        </div>
      </div>

    </div>
  </div>
</div>
```

## 6. Markdown Frontmatter Session Schema (Stage 3 Refined)

The Markdown frontmatter format (`sessions/<club>/*.md`) serves as the structured content source for session static generation and PagesCMS editing.

### Frontmatter Schema Definition
```yaml
---
title: "Session Title"
page_title: "Session Title : COSYlanguages"
breadcrumbs_current: "Short Title"
club_tag: "Mind Matters" # or Cinema Club, Karaoke Club, Keeping Up with Science, etc.
date: "DD Month YYYY"
theme_class: "theme-mind-topic"
decorator_icon: "🎙️" # or 🧠, 🎬, 🎤, 🔬, 🧪
duration: "60 minutes"
languages: "🇬🇧 English"
level: "Intermediate (B1)"
topic: "Session Topic"
target_grammar: "Conditionals (2nd, 3rd, Mixed)" # Explicit key auto-populating badges & filters
hero_background: "linear-gradient(135deg, #993556, #4d1a2b)"
description: "Detailed 3-sentence blurb introducing the session theme."

# Format-Specific Profile Objects (Optional)
mind_profile:
  core_tendency: "Core Human Tendency"
  trigger: "Subconscious Trigger"
  phenomenon: "Psychological Phenomenon"
  anchor: "Self-Reflection Anchor"

film_metadata:
  movie_title: "Movie Title"
  director: "Director Name"
  release_year: "2024"
  suggested_genre: "Drama / Sci-Fi"
  age_rating: "PG-13"

song_metadata:
  song_title: "Track Title"
  artist: "Artist Name"
  release_year: "2023"
  genre: "Pop / Indie"
  lyrics_gap_fill_lines: # Max 8 lines allowed per copyright policy
    - "Line 1..."
    - "Line 2..."

science_takeaway:
  core_finding: "Core Scientific Finding"
  scientific_field: "Neuroscience"
  real_world_application: "Practical Application"

sensitive_topic_warning: "Optional note for sensitive or 18+ personal/philosophical themes."

vocabulary:
  - word: "Term"
    definition: "definition ending with period."
    example: "Example sentence using term."

warm_up:
  instruction: "Optional instruction text."
  questions:
    - "Question 1?"
    - "Question 2?"

round_1:
  title: "Round 1 : Title"
  badge: "Questions" # Falls back to target_grammar if omitted
  instruction: "Optional instruction."
  items:
    - main: "Main question statement."
      personal: "Optional personal application question."

lets_speak_together:
  title: "Let's Speak Together"
  # Structured subfields option (recommended for PagesCMS):
  task_title: "The Roleplay / Synthesis Task"
  task_description: "Scenario description for participants."
  grammar_requirements:
    - "At least one Second Conditional"
    - "At least one Third Conditional"
  # Rich-text fallback:
  note: "<p>Custom HTML card or paragraph fallback.</p>"

round_2:
  title: "Round 2 : Title"
  badge: "Conditionals"
  instruction: "Optional instruction."
  items:
    - main: "Main statement or dilemma."
      personal: "Optional personal question."

mistakes:
  - wrong: "Incorrect string or HTML snippet"
    wrong_part: "Structured incorrect part"
    right: "Corrected string or HTML snippet"
    right_part: "Structured corrected part"
    note: "Level-appropriate explanation note."
---
```
