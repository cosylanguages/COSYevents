# Contributing to COSYevents 🤝

Thank you for your interest in contributing to **COSYevents**! We welcome community contributions to help expand prompt decks, session topics, and language learning activities.

---

## 🚦 Contribution Guidelines & Permissions

To maintain high quality, pedagogical alignment, and architectural integrity across the **COSYlanguages** ecosystem, contributions are divided into two categories:

### ✅ Contributions Allowed Without Maintainer Pre-Approval
You are welcome to submit pull requests directly for:
* **New Prompt Content:** Adding new prompt cards, discussion items, or vocabulary entries to **existing** event decks and session files in `data/events/`.
* **Typo & Link Fixes:** Fixing spelling, grammatical mistakes, broken links, or formatting errors in existing html, markdown, or json files.
* **Documentation Improvements:** Clarifying instructions, setup guides, or examples in `README.md` or `CONTRIBUTING.md`.

### 🛑 Contributions Requiring Maintainer Approval
Please open an issue to discuss with maintainers **before** submitting pull requests for:
* **New Event Types / Formats:** Adding a new event category directory (e.g. creating a 7th event format beyond the core six).
* **Schema & Architectural Changes:** Modifying `manifest.json`, changing dataset schemas (`SCHEMA.md`), or altering `shared/js/prompt-deck-loader.js`.
* **Design & CSS Token Updates:** Changing hub layout structures or core color tokens in `shared/css/`.

---

## 📋 Content & Schema Requirements

When contributing prompt decks or event datasets:
1. **No Placeholders:** Ensure all prompt text and definitions are fully written out. Generic placeholders (e.g. `[INSERT_TEXT]`, `Lorem ipsum`) are not permitted.
2. **Pedagogical Quality:** Content must be level-calibrated (A2, B1, B2, C1) and target-language consistent.
3. **Sensitive Content:** Any session or prompt deck dealing with heavy or sensitive topics must include the appropriate warning metadata tag.

---

## 🛠️ How to Submit

1. Fork the repository and create your feature branch (`git checkout -b feature/my-new-prompt-deck`).
2. Verify changes locally by opening `index.html` in a web browser.
3. Commit your changes with clear, descriptive commit messages.
4. Push to your branch and open a Pull Request.
