# COSYlanguages Design Tokens

This document details the design token architecture defined in `css/cosy-tokens.css` for the **COSYlanguages** ecosystem (including companion applications such as COSYevents, COSYtools, and COSYgames).

---

## 🎨 Overview & Purpose

Design tokens serve as the single source of truth for design values across COSYlanguages web properties. They establish visual consistency across colors, typography, spacing, border radii, and elevation shadows.

---

## 📐 Token Catalog

### 1. Premium Track Colors
These custom properties define the six primary brand track palettes:

| Track Name | Token Name | Hex Value | Description |
| :--- | :--- | :--- | :--- |
| **Forest Green / Sage** | `--cosy-color-forest-green`<br>`--cosy-color-sage` | `#416b49` | Primary track green |
| | `--cosy-color-forest-green-dark`<br>`--cosy-color-sage-dark` | `#375742` | Dark contrast variant |
| | `--cosy-color-forest-green-light`<br>`--cosy-color-sage-light` | `#e8f0e9` | Light tint background |
| | `--cosy-color-forest-green-soft`<br>`--cosy-color-sage-soft` | `#6b9474` | Soft accent variant |
| **Terracotta / Coral** | `--cosy-color-terracotta` | `#c85a32` | Warm terracotta base |
| | `--cosy-color-terracotta-dark` | `#a14322` | Dark terracotta variant |
| | `--cosy-color-terracotta-light` | `#fbeee8` | Light terracotta background |
| | `--cosy-color-coral` | `#e06d53` | Coral accent color |
| **Credible Navy** | `--cosy-color-credible-navy` | `#1b2a4a` | Deep navy base |
| | `--cosy-color-navy-dark` | `#121c33` | Dark navy variant |
| | `--cosy-color-navy-light` | `#e8edf5` | Soft navy background |
| **Practical Fresh Green** | `--cosy-color-practical-fresh-green` | `#2e7d32` | Fresh green base |
| | `--cosy-color-fresh-green-dark` | `#1b5e20` | Dark fresh green variant |
| | `--cosy-color-fresh-green-light` | `#e8f5e9` | Light fresh green background |
| **Warm Rust / Amber** | `--cosy-color-warm-rust` | `#b7410e` | Rust base accent |
| | `--cosy-color-amber` | `#d97706` | Amber warning / spotlight color |
| | `--cosy-color-amber-light` | `#fef3c7` | Soft amber background |
| **Scholarly Plum** | `--cosy-color-scholarly-plum` | `#582c4d` | Deep plum base |
| | `--cosy-color-plum-dark` | `#3d1e36` | Dark plum variant |
| | `--cosy-color-plum-light` | `#f5ebf2` | Soft plum background |

---

### 2. Base Neutrals & UI Colors
| Category | Token Name | Value | Purpose |
| :--- | :--- | :--- | :--- |
| **Background** | `--cosy-color-bg` | `#fdfcf8` | Warm cream page background |
| **Surface** | `--cosy-color-surface` | `#ffffff` | Pure white card & container surface |
| **Text Primary** | `--cosy-color-text` | `#2a2a2a` | High-contrast dark neutral text |
| **Text Muted** | `--cosy-color-text-muted` | `#5c5957` | Secondary / muted body text |
| **Border** | `--cosy-color-border` | `#e8e2d5` | Soft warm neutral border |

*(Note: Legacy short-name tokens `--cream`, `--cream-dark`, `--warm-white`, `--ink`, `--ink-muted` are also provided for backward compatibility).*

---

### 3. Typography Scale

#### Font Families
- `--cosy-font-family-base`: `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif`

#### Font Sizes
- `--cosy-font-size-xs`: `0.75rem` (12px)
- `--cosy-font-size-sm`: `0.85rem` (13.6px)
- `--cosy-font-size-md`: `0.875rem` (14px)
- `--cosy-font-size-base`: `0.95rem` (15.2px)
- `--cosy-font-size-lg`: `1.1rem` (17.6px)
- `--cosy-font-size-xl`: `1.2rem` (19.2px)
- `--cosy-font-size-2xl`: `1.35rem` (21.6px)
- `--cosy-font-size-3xl`: `1.5rem` (24px)
- `--cosy-font-size-4xl`: `2.25rem` (36px)

#### Font Weights
- `--cosy-font-weight-normal`: `400`
- `--cosy-font-weight-medium`: `500`
- `--cosy-font-weight-semibold`: `600`
- `--cosy-font-weight-bold`: `700`

#### Line Heights
- `--cosy-line-height-tight`: `1.2`
- `--cosy-line-height-snug`: `1.3`
- `--cosy-line-height-base`: `1.5`
- `--cosy-line-height-relaxed`: `1.6`

---

### 4. Spacing Scale
- `--cosy-spacing-2xs`: `0.2rem`
- `--cosy-spacing-xs`: `0.25rem`
- `--cosy-spacing-sm`: `0.5rem`
- `--cosy-spacing-md`: `0.75rem`
- `--cosy-spacing-base`: `1rem`
- `--cosy-spacing-lg`: `1.25rem`
- `--cosy-spacing-xl`: `1.5rem`
- `--cosy-spacing-2xl`: `2rem`
- `--cosy-spacing-3xl`: `2.5rem`
- `--cosy-spacing-4xl`: `3rem`

---

### 5. Border Radius
- `--cosy-radius-xs`: `4px`
- `--cosy-radius-sm`: `6px`
- `--cosy-radius-md`: `8px`
- `--cosy-radius-lg`: `10px`
- `--cosy-radius-xl`: `12px`
- `--cosy-radius-pill`: `20px`
- `--cosy-radius-full`: `9999px`

---

### 6. Shadows & Elevation
- `--cosy-shadow-sm`: `0 2px 4px rgba(0, 0, 0, 0.04)`
- `--cosy-shadow-md`: `0 4px 12px rgba(0, 0, 0, 0.05)`
- `--cosy-shadow-lg`: `0 8px 24px rgba(0, 0, 0, 0.08)`

---

## 📌 Consumer Repository Pinning Policy

### Mandatory Linking Policy
All consumer repositories (such as `COSYevents`, `COSYtools`, and `COSYgames`) referencing design tokens remotely must load `css/cosy-tokens.css` via `raw.githubusercontent.com` **pinned to a specific commit SHA or release tag**.

**CRITICAL:** Consumer repositories must **NEVER** link to the `main` branch (e.g., `.../main/css/cosy-tokens.css`). Linking to `main` introduces unverified upstream visual drift and breaking changes across independent ecosystem applications.

### Recommended HTML Link Tag Example
```html
<!-- Correct: Pinned to a specific commit SHA or release tag -->
<link rel="stylesheet" href="https://raw.githubusercontent.com/cosylanguages/COSYlanguages/a1b2c3d4e5f678901234567890abcdef12345678/css/cosy-tokens.css">
```

```html
<!-- INCORRECT: Never link directly to main -->
<!-- <link rel="stylesheet" href="https://raw.githubusercontent.com/cosylanguages/COSYlanguages/main/css/cosy-tokens.css"> -->
```
