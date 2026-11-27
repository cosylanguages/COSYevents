# Vocabulary Duplication Pipeline into COSYdata

## Overview
Session materials across **COSYevents** (Speaking Clubs, Cinema Nights, Karaoke Club, Game Evenings, Long Reads, etc.) contain high-frequency, CEFR-calibrated vocabulary. To maintain ecosystem sync and reusability, useful vocabulary from finished sessions is duplicated into **COSYdata** (under target language levels/folders).

---

## Interchange Specification: `vocabulary-export.json`

Every session that produces vocabulary should maintain or generate a `vocabulary-export.json` file in its folder (or alongside its session deck).

### File Format Specification

```json
{
  "sessionId": "mind-matters-cognitive-biases",
  "sessionTitle": "Bounded Rationality & Cognitive Biases",
  "eventType": "speaking-club",
  "language": "English",
  "level": "B2",
  "exportDate": "2025-05-15",
  "vocabulary": [
    {
      "term": "bounded rationality",
      "pos": "noun",
      "definition": "The idea that rationality is limited when individuals make decisions due to cognitive limits.",
      "translation": "ограниченная рациональность",
      "example": "In complex choices, bounded rationality leads people to pick 'good enough' options.",
      "tags": ["psychology", "decision-making"]
    },
    {
      "term": "action bias",
      "pos": "noun",
      "definition": "A psychological impulse to take action even when waiting or doing nothing would be more effective.",
      "translation": "склонность к действию",
      "example": "Goalies in penalty kicks suffer from action bias when they jump early.",
      "tags": ["psychology", "biases"]
    }
  ]
}
```

---

## Ingestion Process by COSYdata

1. **Pickup Location:** COSYdata's ingestion script scans `COSYevents` sessions for `vocabulary-export.json` files or reads from `data/events/*.json`.
2. **Target Destination in COSYdata:**
   - Files are grouped by `language` and `level` (e.g. `COSYdata/en/B2/vocabulary/`).
   - Duplicate entries are merged using `term` normalized key comparison.
3. **Execution Command in COSYdata:**
   ```bash
   node scripts/ingest_events_vocabulary.js --source=../COSYevents
   ```
