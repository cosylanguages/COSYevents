# Manuals Migration Plan

This document presents a comprehensive proposal for organizing, restructuring, and migrating grammar and reference manuals under the `manuals/` directory.

---

## 1. Current Inventory of Files in `manuals/`

An audit was performed across the repository root directory `/manuals`.

### Repository Audit Summary
* **Current Files in `manuals/`**: 0 files currently exist in `manuals/` at the repository root.
* **Directory State**: `manuals/` is a newly introduced directory at the repo root.
* **Format & Content Types**: N/A (0 KB total size). Future manuals will consist of Markdown (`.md`) files containing language grammar overviews, conjugation tables, declension matrices, and syntactic rules.
* **Languages Represented**: English (`en`), French (`fr`), Italian (`it`), Russian (`ru`), Greek (`el`), Spanish (`es`), and German (`de`).

---

## 2. Proposed Target Folder Structure & Naming Conventions

To establish consistency, clarity, and scalability across all supported languages, manuals will be organized into language-specific subdirectories matching standard ISO 639-1 language codes (`manuals/<language-code>/`).

### Proposed Folder Hierarchy

```
manuals/
├── MIGRATION_PLAN.md
├── en/
│   ├── grammar-overview.md
│   ├── verb-conjugation.md
│   ├── tenses-and-aspects.md
│   └── article-usage.md
├── fr/
│   ├── grammar-overview.md
│   ├── verb-conjugation.md
│   ├── noun-gender-guide.md
│   └── subjunctive-mood.md
├── it/
│   ├── grammar-overview.md
│   ├── verb-conjugation.md
│   ├── prepositions-and-regimes.md
│   └── article-usage.md
├── ru/
│   ├── grammar-overview.md
│   ├── verb-conjugation.md
│   ├── noun-declensions-cases.md
│   └── verbs-of-motion.md
└── el/
    ├── grammar-overview.md
    ├── verb-conjugation.md
    ├── noun-declensions-cases.md
    └── article-usage.md
```

### Standardized Naming Conventions

File names inside each language directory follow a strict **kebab-case** convention based on specific pedagogical subject matter:

1. **`grammar-overview.md`**: High-level summary of language typography, phonology, word order, and core grammatical concepts.
2. **`verb-conjugation.md`**: Detailed breakdown of verb classes, regular/irregular conjugation paradigms, moods, and tenses.
3. **`noun-declensions-cases.md`**: Case systems, declension tables, and noun/adjective inflection patterns (for inflectional languages such as Russian, Greek, and German).
4. **`noun-gender-guide.md`**: Rules, phonetic indicators, and exceptions for noun gender classification (for French, Italian, Spanish, German, Russian, and Greek).
5. **`prepositions-and-regimes.md`**: Prepositional usage, spatial/temporal relations, and verb/case governing regimes.
6. **`article-usage.md`**: Definite, indefinite, and partitive article rules, contractions, and zero-article contexts.
7. **`verbs-of-motion.md`**: Unprefixed/prefixed verbs of motion, directionality, and aspectual pairs (specifically for Slavic languages like Russian).

---

## 3. Link Audit & `apps/free-portal/` Dependency Check

### `apps/free-portal/` Direct Embeds & Link Check
* **Directory Audit**: `apps/free-portal/` does not currently exist within this repository root.
* **README Claims**: Any companion applications (e.g. `apps/free-portal/`) claiming to serve "Grammar Manuals" will interface with manuals via relative paths `manuals/<language-code>/<manual-name>.md`.

### Repository-Wide `manuals/` Link Audit
* **Grep Audit Command**: `grep -rn "manuals/" .`
* **Findings**: **0 broken links or references** currently exist in the repository referencing `manuals/` files.
* **Migration Impact**: Migrating manuals into `manuals/<language-code>/` subdirectories carries **zero risk** of breaking existing hyperlinks within this codebase.

---

## 4. Human Review & Migration Execution Plan

This proposal is submitted for human review prior to executing file creation and migration:

1. **Review & Approval**: Human maintainers review the proposed language-code directory layout (`manuals/<lang>/`) and topic-based naming conventions.
2. **Migration Execution**: Upon approval, manuals will be placed in their respective `manuals/<language-code>/` directories in a dedicated follow-up PR. No existing files were moved or renamed in this proposal task.
