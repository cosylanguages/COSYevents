# Session to Lesson Conversion Specification

## Overview

Live sessions held in **COSYevents** (such as Speaking Clubs, Cinema Nights, or Masterclasses) often generate high-value pedagogical content. When a session is complete, it can be converted into a full structured lesson for **COSYplatform**.

Once converted, the resulting lesson is cataloged in **COSYlanguages** under a distinct content type called **"Event Lesson"** (alongside General, Spoken, Professional, Travelling, Relocation, and Exam Prep tracks), preserving its identity as an event-derived interactive lesson rather than folding it into a standard course track.

---

## Session Interchange File Format (`session-export.json`)

To enable automated conversion scripts in COSYplatform (or COSYevents), finished sessions export their full structured content using the following JSON schema:

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "sessionId": "evt-2025-mind-matters-01",
  "title": "Bounded Rationality & Cognitive Biases",
  "eventType": "speaking-club",
  "language": "English",
  "level": "B2",
  "summary": "Exploring how cognitive limits shape human decision-making and modern choices.",
  "durationMinutes": 60,
  "conversionStatus": "converted",
  "convertedLessonUrl": "https://cosylanguages.github.io/COSYplatform/lessons/event-lessons/en/b2/bounded-rationality.html",
  "sections": [
    {
      "type": "warmup",
      "title": "Warm-up Discussion",
      "instructions": "Discuss these introductory questions in pairs.",
      "prompts": [
        "Have you ever made an impulse decision you regretted immediately?",
        "How do you usually choose between multiple good options?"
      ]
    },
    {
      "type": "vocabulary",
      "title": "Key Vocabulary & Phrases",
      "items": [
        {
          "term": "Bounded Rationality",
          "definition": "Decision-making bounded by cognitive limits and available time.",
          "example": "Satisficing is a key result of bounded rationality."
        }
      ]
    },
    {
      "type": "deep-dive",
      "title": "Core Case Study & Debate",
      "content": "Read the brief case study on action bias in sports and discuss...",
      "questions": [
        "Is action bias more prevalent in high-stakes environments?",
        "How can leaders mitigate cognitive bias in teams?"
      ]
    },
    {
      "type": "wrapup",
      "title": "Reflective Speaking & Takeaways",
      "prompts": [
        "Summarize one bias you recognize in your own daily routines."
      ]
    }
  ]
}
```

---

## Conversion Workflow

1. **Host Finalizes Session:**
   - The host or teacher marks `conversionStatus: "planned"` or `"converted"` in `shared/calendar-data/events.json`.
   - The session's structured data is exported to `session-export.json`.

2. **COSYplatform Ingestion Script:**
   - A script in COSYplatform reads `session-export.json` and builds a full interactive lesson file under `COSYplatform/lessons/event-lessons/<lang>/<level>/<slug>.html`.
   - The output lesson contains interactive exercises, vocabulary flashcards, and student submission components.

3. **COSYlanguages Catalog Publishing:**
   - The converted lesson URL (`convertedLessonUrl`) is registered in COSYlanguages' catalog.
   - It is categorized as a distinct content type: **"Event Lesson"** (e.g. `type: "Event Lesson"` or `contentType: "event-lesson"`), ensuring clear distinction from General, Spoken, or Exam Prep courses.

---

## Tracking Conversion in `events.json`

In `shared/calendar-data/events.json`, each converted event record is updated with:

```json
{
  "id": "evt-2025-mind-matters-01",
  "title": "Bounded Rationality & Cognitive Biases",
  "conversionStatus": "converted",
  "convertedLessonUrl": "https://cosylanguages.github.io/COSYplatform/lessons/event-lessons/en/b2/bounded-rationality.html"
}
```
