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
  - **Free Visitors:** See the club list and description. Prompted to unlock.
  - **Students:** See schedules, active session vocabulary, and full past session history.
  - **Teachers:** See everything students see + preparation topics + active mistake notes area.
- **Interactivity:** Toggles for Vocabulary, Rounds, and Mistake Notes.

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
