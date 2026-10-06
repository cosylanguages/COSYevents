# COSYevents 🎭 Calendar & Event Hub

**COSYevents** serves as the official public calendar, event directory, and interactive session repository for the **COSYlanguages** ecosystem. It hosts live calendar schedules, speaking club prompt decks, cinema immersion guides, teacher-led masterclasses, multimedia nights, and past event archives.

---

## 🌟 Architecture & Event Taxonomy

COSYevents features two main categories of communicative events across English, French, Italian, Russian, and Greek:

1. **Thematic Speaking Clubs** (`events/speaking-clubs/`)
   - **I Couldn't Help But Wonder** — Modern dating, relationship dynamics, personal identity, and urban social observations.
   - **Keeping Up with Science** — Scientific breakthroughs, emerging technologies, environmental insights, and innovation.
   - **Mind Matters** — Psychology, cognitive biases, mental well-being, behavioral science, and philosophy.
   - **Debatable & Relatable** — Debates on controversial modern dilemmas, ethical questions, and relatable social topics.
   - **Let's Celebrate** — Global holidays, cultural festivities, seasonal customs, and international traditions.
   - **My Life With/Without** — Reflective conversations comparing lifestyle choices, minimalism, digital habits, and personal values.
   - **The Greatest Quotes** — Deep-dive conversations inspired by literary quotes, maxims, and philosophical statements.
   - **If You Were** — Speculative speaking club focusing on hypothetical scenarios, second/third conditional practice, and roleplay.

2. **Interactive Multimedia Nights** (`events/multimedia-nights/`)
   - **Cinema Club** — Authentic film immersion with scene breakdowns, vocabulary primers, and post-watch debate.
   - **Karaoke Club** — Musical immersion with song lyric pronunciation, vocabulary breakdowns, and group singing.
   - **Game Evening** — Polyglot board games, team trivia, linguistic strategy games, and social challenges.
   - **Long Reads** — In-depth analysis of essays, short stories, article excerpts, and literary works.

---

## 🔒 Public Library & Participant Magic Link Access Model

To respect participant privacy and host intellectual property without forcing participants to create user accounts, COSYevents uses a **Public Library + Magic Link Model**:

- **Public Library & Teaser Shells:** Anyone can browse the event calendar, session catalog, and public teaser pages (`sessions/**/*.html`). Teaser pages contain only static metadata (title, club, CEFR level, duration, topic) and are tagged with `<meta name="robots" content="noindex,nofollow">` and `<meta name="referrer" content="no-referrer">`. No private prompt decks, vocabulary lists, discussion rounds, facilitator notes, or session recordings are committed to the public repository (the `sessions/**/*.json` folder remains strictly empty in git).
- **Participant Magic Links:** Paid session participants receive a unique single-use or timed magic link containing an access token fragment (`#k=<token>`). Upon opening the link, `shared/js/cosyevents-gate.js` extracts the token, stores it in `sessionStorage`, removes the hash from the URL bar (`history.replaceState`), redeems the token via Supabase RPC (`redeem_session_access_link`), and dynamically renders the full interactive session deck client-side using `shared/js/session-renderer.js`. No participant accounts or passwords are required.
- **Staff Access:** Facilitators and founders sign in with COSYauth (`shared/js/cosy-auth.js`) on `admin/session-links.html` to generate, manage, and revoke participant magic links or access full facilitator notes via `staff_get_session`.

---

## 🔄 Interchange Pipelines & Ecosystem Integrations

### 1. Vocabulary Duplication Pipeline into COSYdata
Useful vocabulary extracted from sessions is exported into a standardized `vocabulary-export.json` file.
- **Specification:** See [docs/vocabulary-pipeline.md](docs/vocabulary-pipeline.md) and template in `templates/vocabulary-export.json`.
- **Ingestion:** COSYdata's ingestion scripts pick up `vocabulary-export.json` files from `COSYevents` sessions and merge entries into target language/level vocabulary folders.

### 2. Session → Lesson Conversion Output for COSYplatform & COSYlanguages
Finished live sessions can be converted into structured lessons for **COSYplatform**.
- **Specification:** See [docs/session-conversion-spec.md](docs/session-conversion-spec.md).
- **Cataloging in COSYlanguages:** Once converted, the resulting lesson is cataloged in COSYlanguages as a distinct content type: **"Event Lesson"** (alongside General, Spoken, Professional, Travelling, Relocation, and Exam Prep tracks).

---

## 🤝 Ecosystem Companion Repositories

**COSYevents** seamlessly integrates with sibling portals in the COSYlanguages ecosystem:
- 🌐 **[COSYlanguages](https://cosylanguages.github.io/COSYlanguages/)** — Main portal and core curriculum.
- 🎓 **[COSYplatform](https://cosylanguages.github.io/COSYplatform/)** — Where weekly speaking club sessions become full structured lessons for enrolled students.
- 🛠️ **[COSYtools](https://cosylanguages.github.io/COSYtools/)** — Offline reference engines.
- 🎮 **[COSYgames](https://cosylanguages.github.io/COSYgames/)** — Interactive linguistic minigame engines.

*Note: COSYmanuals provides internal reference manuals and teacher documentation via direct unlisted links per its access model.*

---

## 🌐 Translating Events & Calendar UI

COSYevents supports multi-language calendar UI rendering across English, French, Italian, Russian, and Greek via `shared/calendar/calendar-i18n.js` and dynamic browser `Intl` APIs in `shared/calendar/calendar.js`.

### Optional Per-Event Translations in `events.json`
Individual event records in `shared/calendar-data/events.json` can include optional per-language overrides under an `i18n` object. If present for the current page language, `calendar.js` will display the localized title, description, or host bio; otherwise it seamlessly falls back to English:

```json
{
  "id": "event-123",
  "title": "4-Day Work Week Debate",
  "description": "Discussing productivity, work-life balance, and trial results.",
  "i18n": {
    "fr": {
      "title": "La semaine de 4 jours",
      "description": "Équilibre vie pro-vie privée, essais pilotes et productivité."
    },
    "ru": {
      "title": "4-дневная рабочая неделя",
      "description": "Баланс работы и жизни, пилотные проекты и производительность."
    }
  }
}
```

---

## 🚀 Running Locally

Open `index.html` or `events/index.html` directly in any web browser or serve with any static HTTP server. No Node.js build step or backend database required!

## Documentation & Specifications
- [Master Audit & State Report](AUDIT.md)
- [Vocabulary Duplication Pipeline](docs/vocabulary-pipeline.md)
- [Session to Lesson Conversion Specification](docs/session-conversion-spec.md)
- [Speaking Clubs Specification](docs/speaking-clubs-spec.md)
- [Cinema Content Style Guide](docs/cinema-content-style-guide.md)
