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

## 🔒 Public vs. Access-Gated Session Model

To respect participant privacy and host intellectual property without paid auth/BaaS overhead, COSYevents uses a **Public/Gated Split**:

- **Public Access (`events/index.html` & Per-Event Pages):** Anyone can view event names, themes, CEFR levels, public blurbs, and schedule times. No paid session materials, prompt decks, recordings, or past-session content are exposed publicly.
- **Access Control (Unlisted Links):** Paid attendees and facilitators receive a unique unlisted session access link (a hard-to-guess URL string) after registration to access full session materials, recordings, and interactive prompt decks.

*Note on Access Control Trade-off:* This unlisted URL approach relies on obscurity rather than full identity-based authentication. If strict access control is required in the future, a roster-based access check (similar to COSYmanuals) can be implemented.

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

## 🚀 Running Locally

Open `index.html` or `events/index.html` directly in any web browser or serve with any static HTTP server. No Node.js build step or backend database required!

## Documentation & Specifications
- [Vocabulary Duplication Pipeline](docs/vocabulary-pipeline.md)
- [Session to Lesson Conversion Specification](docs/session-conversion-spec.md)
- [Speaking Clubs Specification](docs/speaking-clubs-spec.md)
- [Cinema Content Style Guide](docs/cinema-content-style-guide.md)
