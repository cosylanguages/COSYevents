# COSY Passport Schema Specification

The **COSY Passport** is a unified, client-side JSON data structure used across the **COSYlanguages** ecosystem to store language learning progress, completed items, activity metrics, and earned achievement badges.

---

## 📄 JSON Data Shape

```json
{
  "cosy_passport_version": 1,
  "language": "<lang code, matching LANGUAGES.md codes>",
  "updated": "<ISO 8601 timestamp>",
  "progress": [
    { "source": "<repo name>", "item": "<dot-path id>", "value": <number|string> }
  ],
  "badges": ["<string id>", ...]
}
```

### Fields Description

| Field | Type | Description |
| :--- | :--- | :--- |
| `cosy_passport_version` | `number` | Version number of the passport schema specification (currently `1`). |
| `language` | `string` | Target language code matching language codes defined in `LANGUAGES.md` (e.g., `es`, `fr`, `de`, `ja`). |
| `updated` | `string` | ISO 8601 formatted UTC timestamp indicating when the passport was last updated (e.g. `2025-05-15T12:00:00.000Z`). |
| `progress` | `array` | Array of progress objects recorded across ecosystem applications. |
| `progress[].source` | `string` | The originating ecosystem application name. Must be one of the allowed sources listed below. |
| `progress[].item` | `string` | Dot-path identifier representing a specific learning item or activity (e.g. `speaking_clubs.if_you_were.completed`). |
| `progress[].value` | `number` \| `string` | The completion metric, score, or status value associated with the item. |
| `badges` | `array` | Array of unique string identifiers representing earned achievement badges (e.g. `["first_club_joined", "streak_7_days"]`). |

---

## 🔒 Allowed Sources & Data Isolation Policy

### Allowed Source Names
The `source` attribute in any progress entry **must** be one of the following five official ecosystem repositories:
1. `COSYlanguages`
2. `COSYtools`
3. `COSYworld`
4. `COSYgames`
5. `COSYevents`

### Non-Destructive Data Policy
To ensure user privacy and interoperability across independent applications:
- **Source Isolation:** Each application within the ecosystem is only permitted to read and write progress entries matching its own `source` name.
- **Preservation of External Sources:** When importing or exporting a passport JSON file, applications **must never** overwrite, delete, or mutate progress entries or badges belonging to unknown or external sources.
