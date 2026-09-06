# Contributing to COSYlanguages 🤝

Thank you for your interest in contributing to **COSYlanguages**! We welcome community contributions to help expand our comprehensive language learning portal, standalone engines, curriculum datasets, and interactive practice tools.

---

## 🛠️ Contribution Guidelines

To maintain pedagogical quality, architectural alignment, and data consistency across the **COSYlanguages** ecosystem, contributions are structured into allowed vs. maintainer-approval categories:

### 1. Allowed & Welcomed Contributions
You are welcome to submit Pull Requests directly for:
- **Vocabulary & Grammar Entries**: Expanding vocabulary decks, exercise cards, or conjugation/grammar lookup tables (`vocabulary/`, `grammar/`, `data/`).
- **Curriculum & Lesson Modules**: Adding or improving A1–C2 lesson materials, prompt cards, and event guides (`curriculum/`, `events/`, `data/`).
- **Games & Interactive Minigames**: Enhancing communicative minigames and interactive practice modules (`games/`, `apps/`).
- **UI & Accessibility Improvements**: Fixing CSS bugs, improving responsive design, and enhancing touch/screen-reader accessibility across user interfaces.
- **Bug & Typo Fixes**: Correcting typos, broken links, formatting errors, or minor script bugs.

### 2. Requiring Review & Maintainer Approval
Please open an issue to discuss with maintainers **before** submitting PRs that affect:
- Core engine architecture or global shared utilities (`shared/js/`, `shared/css/`).
- Modifications to data shapes, schemas, or taxonomy structures—`SCHEMA.md` and `CONTENT_ARCHITECTURE.md` are the single sources of truth for data shape and taxonomy.
- Global styling changes or token modifications—`docs/design-tokens.md` is the single source of truth for styling and CSS custom properties.

---

## 📋 Data & Styling Standards

When contributing code, datasets, or stylesheets:
1. **Data Taxonomy & Schema**: All JSON data files, event decks, and vocabulary matrices must strictly adhere to the data shape and taxonomy defined in `SCHEMA.md` and `CONTENT_ARCHITECTURE.md`.
2. **Design Tokens & Styling**: All UI styling, colors, typography, spacing, and shadows must utilize the design tokens specified in `docs/design-tokens.md` (`css/cosy-tokens.css`).
3. **No Placeholders**: Ensure all content and translations are complete. Generic placeholders (e.g., `[INSERT_TEXT]`, `Lorem ipsum`) are not permitted.

---

## 🚀 How to Submit a Pull Request & Local Development

1. Fork the `COSYlanguages` repository.
2. Create a feature branch (`git checkout -b feature/new-lesson-module`).
3. Test and validate your changes locally in a browser—no complex build tools or server dependencies required!
4. Ensure all JSON data files conform to valid JSON formatting and adhere to `SCHEMA.md`.
5. Commit your changes with clear, descriptive commit messages.
6. Push to your fork and submit a Pull Request.
