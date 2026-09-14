# COSYevents Specification & Documentation Link Audit

**Audit Date:** September 2025
**Target File:** `/link-audit/04-docs-spec-link-audit.md`
**Audit Scope:** Verification of cross-references, specification links, and documentation links across `README.md`, `CONTRIBUTING.md`, `migration-log.md`, and all specification documents in `docs/`.

---

## 1. Inventory of Specification & Documentation Files

The repository contains the following specification, guide, and process documentation files:
* `README.md` — Repository overview, architecture, and catalog guidelines.
* `CONTRIBUTING.md` — Contribution standards and guidelines.
* `migration-log.md` — Historical record of content and structure migrations.
* `docs/speaking-clubs-spec.md` — Specification for Speaking Club event formats, prompt decks, and layout rules.
* `docs/cinema-content-style-guide.md` — Editorial style guide and copyright guidelines for Cinema Club events.
* `docs/cinema-inventory.md` — Archive inventory of Cinema Club films and sessions.
* `docs/rules-template.md` — General session layout rules template.
* `docs/STRUCTURE_AUDIT.md` — Prior audit report detailing session structure.

---

## 2. Cross-Reference & Link Resolution Results

| Source File | Link Text | Target Href / Path | Status | Resolved Target |
| :--- | :--- | :--- | :---: | :--- |
| `README.md` | `docs/speaking-clubs-spec.md` | `docs/speaking-clubs-spec.md` | **OK** | `docs/speaking-clubs-spec.md` |
| `README.md` | `docs/cinema-content-style-guide.md` | `docs/cinema-content-style-guide.md` | **OK** | `docs/cinema-content-style-guide.md` |
| `README.md` | `COSYlanguages` | `https://cosylanguages.github.io/COSYlanguages/` | **OK** | External Ecosystem Hub |
| `README.md` | `COSYplatform` | `https://cosylanguages.github.io/COSYplatform/` | **OK** | External Ecosystem Hub |
| `README.md` | `COSYtools` | `https://cosylanguages.github.io/COSYtools/` | **OK** | External Ecosystem Hub |
| `README.md` | `COSYgames` | `https://cosylanguages.github.io/COSYgames/` | **OK** | External Ecosystem Hub |
| `README.md` | `COSYworld` | `https://cosylanguages.github.io/COSYworld/` | **OK** | External Ecosystem Hub |
| `README.md` | `COSYplatform lessons/` | `https://cosylanguages.github.io/COSYplatform/lessons/` | **BROKEN** | Returns **404 Not Found** |

---

## 3. Flagged Missing Specification & Documentation Links

1. **Unlinked Specification Documents in `docs/`:**
   - `docs/cinema-inventory.md` — Exists on disk but is **not linked** from `README.md` or any format catalog page.
   - `docs/rules-template.md` — Exists on disk but is **not linked** from `README.md` or `CONTRIBUTING.md`.
   - `docs/STRUCTURE_AUDIT.md` — Exists on disk but is **not linked** from `README.md` or `CONTRIBUTING.md`.

2. **Missing Specification Links in `CONTRIBUTING.md`:**
   - `CONTRIBUTING.md` outlines contribution rules but contains **0 hyperlinks** to `docs/speaking-clubs-spec.md` or `docs/cinema-content-style-guide.md`.
