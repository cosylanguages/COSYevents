# COSYevents 🎭 Calendar & Event Hub

**COSYevents** serves as the official public calendar and interactive event content repository for the **COSYlanguages** ecosystem. It hosts live calendar schedules, speaking club prompt decks, cinema immersion guides, teacher-led masterclasses, and past event archives.

---

## 🌟 Overview of Events Offered

COSYevents features five core communicative event formats across English, French, Italian, Russian, and Greek:
1. **Speaking Clubs** (`speaking-clubs/`) — Topic-driven discussion sessions with CEFR level calibration (A1–C2), vocabulary decks, and structured speaking rounds.
2. **Cinema Nights** (`cinema-nights/`) — Authentic film immersion with scene breakdowns, subtitle indicators, vocabulary primers, and post-watch debate guides.
3. **Teacher-Led Sessions** (`teacher-led-sessions/`) — Specialized masterclasses on phonetics, idioms, and 1-on-1 private lesson bookings.
4. **Special Events** (`special-events/`) — Polyglot trivia nights, cultural gastronomy workshops, and multiplayer game evenings.
5. **Past Events Archive** (`past-events/`) — Searchable archive offering instant access to study decks, discussion guides, and companion links to COSYmanuals.

---

## 📱 Joining Events & Registration Flow

- **Free & Open Access:** All event schedules, prompt decks, and materials are freely accessible without logging in.
- **Central Registration Hub:** To reserve spots or join live sessions, all registration buttons route back to the central COSYlanguages WhatsApp and Telegram contact hubs.
- **Timezone Awareness:** All session times are displayed in CET with dynamic client-side conversion to your local browser timezone.

---

## 👨‍🏫 Teacher Guidelines & Session Submission

Teachers and community facilitators can host or submit new sessions by updating `/shared/calendar-data/events.json`:
1. **Add Event Record:** Insert an object following the schema:
```json
{
  "id": "evt-2025-xxx",
  "title": "Session Title",
  "type": "speaking-club | cinema-night | teacher-session | special-event",
  "language": "English | French | Italian | Russian | Greek",
  "level": "A1 | A2 | B1 | B2 | C1 | C2",
  "date": "YYYY-MM-DD",
  "time": "HH:MM",
  "timezone": "CET",
  "host": "Host Name",
  "host_bio": "Short Facilitator Bio",
  "description": "Comprehensive session description",
  "registration_link": "https://wa.me/...",
  "materials": "https://cosylanguages.github.io/COSYevents/sessions/...",
  "conversionStatus": "not-planned | planned | converted",
  "convertedLessonUrl": "https://cosylanguages.github.io/COSYplatform/lessons/..."
}
```
2. **Pedagogical Standards:** Ensure all session decks adhere to [docs/speaking-clubs-spec.md](docs/speaking-clubs-spec.md) and [docs/cinema-content-style-guide.md](docs/cinema-content-style-guide.md).

---

## 🤝 Ecosystem Companion Repositories

**COSYevents** seamlessly integrates with sibling portals in the COSYlanguages ecosystem:
- 🌐 **[COSYlanguages](https://cosylanguages.github.io/COSYlanguages/)** — Main portal and core curriculum.
- 🎓 **[COSYplatform](https://cosylanguages.github.io/COSYplatform/)** — Where weekly speaking club sessions become full structured lessons for enrolled students.
- 🛠️ **[COSYtools](https://cosylanguages.github.io/COSYtools/)** — Offline reference engines.
- 🎮 **[COSYgames](https://cosylanguages.github.io/COSYgames/)** — Interactive linguistic minigame engines.
- 🗺️ **[COSYworld](https://cosylanguages.github.io/COSYworld/)** — Cultural immersion maps.

Additionally, COSYmanuals provides internal reference manuals and teacher documentation (accessible via direct unlisted links per its access model).

---

## 🚀 Running Locally

Open `index.html` directly in any web browser or serve with any static HTTP server. No Node.js build step or backend database required!
