# COSYevents 🎭

**COSYevents** is the dedicated, standalone event content repository for the **COSYlanguages** ecosystem. It hosts interactive event materials, discussion guides, prompt decks, multimedia immersion sessions, and communicative challenge engines.

---

## 🌟 Relationship to COSYlanguages "Premium Events"

In the COSYlanguages ecosystem, **COSYevents** serves as the primary content repository powering **Premium Events**:
- Provides structured curriculum decks, vocabulary guides, and discussion session frameworks for language clubs and immersive event formats.
- Houses modular prompt viewers (`shared/js/prompt-deck-loader.js`) and schema-compliant datasets (`data/events/`).
- Operates 100% offline and client-side as a static web application built for zero-dependency local use and web hosting.

---

## 🤝 Ecosystem Companion Repositories

**COSYevents** works alongside sibling companion repositories in the COSYlanguages ecosystem:
- 🌐 **[COSYlanguages](https://github.com/cosylanguages/COSYlanguages)** — Main language learning portal, comprehensive A1–C2 curriculum, and core platform design tokens.
- 🛠️ **[COSYtools](https://github.com/cosylanguages/COSYtools)** — Standalone offline reference engines (conjugation engines, noun gender/case matrices, prepositional regime lookup tools).
- 🎮 **[COSYgames](https://github.com/cosylanguages/COSYgames)** — Standalone interactive vocabulary, grammar, and communicative minigame engines.

---

## 🎪 Included Event Formats

The catalog (`index.html`) hosts five core event formats:
1. **Speaking Clubs** (`speaking-clubs/`) — Topic-driven discussion sessions and themes (such as "If You Were" hypothetical scenarios) with handcrafted vocabulary, level calibration (A2–C1), and structured speaking rounds.
2. **Cinema Club** (`cinema-club/`) — Film-based language immersion with scene breakdowns, key vocabulary, and guided debate questions.
3. **Karaoke Club** (`karaoke-club/`) — Active vocal performance combined with lyric analysis, targeted grammar spotlights, and communicative role-play challenges.
4. **Game Evening** (`game-evening/`) — Interactive multiplayer linguistic games and communicative group challenges.
5. **Long Reads** (`long-reads/`) — In-depth article and passage analysis with calibrated reading comprehension and debate prompts.

---

## 📚 Reference Docs

Key specifications, content style guides, and templates imported during the COSYlanguages migration:
- 🎬 **[Cinema Club Content Style Guide](docs/cinema-content-style-guide.md)** — Pedagogical and content quality standards for film sessions.
- 📋 **[Cinema Inventory](docs/cinema-inventory.md)** — Audit report and problem inventory for Cinema Club sessions.
- 📐 **[Rules Template](docs/rules-template.md)** — Master template and visual rules for Speaking Clubs.
- 🗣️ **[Speaking Clubs Specification](docs/speaking-clubs-spec.md)** — Structural specification, round templates, and HTML patterns for Speaking Clubs.

---

## 🚀 Usage & Local Development

1. **Running Locally:**
   - Open `index.html` directly in any web browser, or serve the repository with any static file server — no build step, Node server, or database required!
2. **Deployment:**
   - Deployable via GitHub Pages, Vercel, Netlify, or any static hosting service.
