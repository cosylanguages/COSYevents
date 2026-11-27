# COSYevents UI/UX Design Specification & System Guide

## 1. Visual Identity & Design Philosophy

COSYevents is the central practice, event, and session hub within the COSYlanguages static web application ecosystem. The design philosophy centers on **warm, calm, distraction-free language practice** ("Cosy Immersion").

### Core UX Principles
1. **Low Cognitive Load & Clarity:** Beginners (A0–A1) and advanced learners alike should focus on conversation, prompt cards, and practice exercises without visual clutter or intrusive UI elements.
2. **Predictable Navigation & Flow:** Standardized session layouts (Hero → Metadata → Step Tabs / Slides → Content Sections → Linguistic Corrections / Teacher's Note) ensure instant familiarity across every event format.
3. **Inclusive & Accessible (WCAG 2.1 AA):** High contrast ratios, accessible focus rings, keyboard navigation (tabbing, arrow key controls), and dark mode support guarantee comfortable use across desktop, tablet, and mobile devices.
4. **Cohesive Ecosystem Harmony:** COSYevents inherits master tokens and design rules from COSYlanguages while maintaining tailored event theme accents (e.g. Sage Green for Speaking Clubs, Warm Terracotta for Cinema, Deep Purple for Karaoke).
5. **Multilingual Main Hubs & Monolingual Session Decks:** Main hub pages (`index.html`, `fr/index.html`, `it/index.html`, `ru/index.html`, `el/index.html`) offer site language switching (English, French, Italian, Russian, Greek) so beginners can navigate in their native tongue or surround themselves in target languages. Gated session decks (`sessions/`) remain strictly monolingual in the practice language to enforce full language immersion.

---

## 2. Master Design Tokens

All global styling parameters are defined in `shared/css/sessions.css` using CSS custom properties (`:root`).

### Color Palette & Theme Tokens

#### Core Track & Theme Accents
| Accent Name | CSS Token Name | Hex Value | Used For |
| :--- | :--- | :--- | :--- |
| **Terracotta / Social Coral** | `--cosy-event-accent` | `#B84318` | Distinct COSYevents Product Accent, Interactive Badges & Highlights |
| **Sage / Forest Green** | `--cosy-color-sage` | `#416b49` | Speaking Clubs Master Theme, Primary Buttons |
| **Credible Navy** | `--cosy-color-navy` | `#1e2f6b` | Professional Track, Grammar Focus Blocks |
| **Fresh Green** | `--cosy-color-fresh-green` | `#4a6b50` | Travel & Action Badges |
| **Amber / Honey** | `--cosy-color-amber` | `#945e05` | Note Highlights, Intermediate Badges |
| **Scholarly Plum** | `--cosy-color-plum` | `#7a5c3a` | Exam Prep, Cultural Deep Dives |
| **Indigo / Electric** | `--indigo` | `#4F46E5` | Interactive Slide Active Tabs, Jump Links |

#### Surface & Neutral Palette (Light Mode vs. Dark Mode)
| Token Name | Light Mode Value | Dark Mode Value | Usage |
| :--- | :--- | :--- | :--- |
| `--cream` / `--background-color` | `#fdfcf8` | `#1a1f1a` | Main Page Background |
| `--warm-white` / `--surface-color` | `#FFFEFB` | `#222b22` | Cards, Panels, Modal Containers |
| `--cream-dark` | `#f5ede0` | `#141914` | Sub-panels, Table Headers |
| `--ink` | `#2a2a2a` | `#e8f0e9` | Primary Body & Heading Text |
| `--ink-soft` | `#4a4a4a` | `#c8d8c9` | Secondary Descriptive Text |
| `--ink-faint` / `--muted` | `#5c5957` | `#8a9e8b` | Captions, Metadata, Subtitles |
| `--border` | `rgba(74, 107, 80, 0.12)` | `rgba(107, 143, 113, 0.2)` | Card & Container Borders |

---

### Typography Scale & Hierarchy

COSYevents utilizes a triple-font system to balance editorial elegance with high legibility:
- **Headings & Serif Accents:** `'Fraunces'`, `'Playfair Display'`, serif
- **Body & UI Controls:** `'Nunito'`, `'DM Sans'`, sans-serif
- **Code & Micro-data:** `'SFMono-Regular'`, Consolas, monospace

```css
:root {
    --cosy-font-size-xs:   0.75rem;   /* 12px - Badges, Footnote Labels */
    --cosy-font-size-sm:   0.875rem;  /* 14px - Captions, Metadata, Secondary Buttons */
    --cosy-font-size-base: 1rem;      /* 16px - Standard Body Text */
    --cosy-font-size-lg:   1.125rem;  /* 18px - Card Titles, Prompts */
    --cosy-font-size-xl:   1.25rem;   /* 20px - Section Subheadings */
    --cosy-font-size-2xl:  1.5rem;    /* 24px - Section Titles */
    --cosy-font-size-3xl:  2rem;      /* 32px - Page Titles */
    --cosy-font-size-4xl:  2.5rem;    /* 40px - Hero Display Headings */
}
```

---

### Spacing, Radii & Shadow Scales

```css
:root {
    /* Spacing Scale */
    --space-xs:  4px;
    --space-sm:  8px;
    --space-md:  16px;
    --space-lg:  24px;
    --space-xl:  32px;
    --space-xxl: 48px;

    /* Border Radius Scale */
    --r-sm:   8px;   /* Chips, Badges, Small Inputs */
    --r-md:   14px;  /* Inset Containers, Mini-Cards */
    --r-lg:   22px;  /* Main Cards, Slide Deck Viewports */
    --r-xl:   32px;  /* Modal Overlay Containers, Hero Blocks */
    --radius-full: 100px; /* Pill Buttons, Floating FABs */

    /* Elevation & Shadows */
    --shadow-sm:  0 2px 12px rgba(46, 74, 51, 0.07);
    --shadow-base: 0 6px 28px rgba(46, 74, 51, 0.10);
    --shadow-md:   0 4px 14px rgba(46, 74, 51, 0.15);
    --shadow-lg:   0 6px 20px rgba(46, 74, 51, 0.25);
}
```

---

## 3. Component Specifications

### Unified Cosy Button Hierarchy

COSYevents enforces a strict 3-tier button system across all pages:

```css
/* Primary Action Button - Solid Sage Green Pill */
.btn-primary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: var(--btn-primary-bg, #416b49);
  color: #ffffff;
  font-weight: 800;
  padding: 14px 32px;
  border-radius: 100px;
  font-size: 1rem;
  border: none;
  cursor: pointer;
  box-shadow: 0 4px 14px rgba(46, 74, 51, 0.15);
  transition: all 0.3s ease;
}

.btn-primary:hover {
  background: var(--btn-primary-hover-bg, #375742);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(46, 74, 51, 0.25);
}

/* Secondary Action Button - Outlined Sage Pill */
.btn-secondary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: transparent;
  border: 1.5px solid var(--sage-soft, #6b9474);
  color: var(--sage-dark, #375742);
  font-weight: 600;
  padding: 13px 28px;
  border-radius: 100px;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-secondary:hover {
  background: var(--sage-light, #e8f0e9);
  border-color: var(--sage-deep, #233827);
  transform: translateY(-1px);
}

/* Tertiary Link Button - Text Underline Link */
.btn-tertiary {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: transparent;
  border: none;
  color: var(--sage-dark, #375742);
  font-weight: 700;
  padding: 4px 8px;
  font-size: 0.9rem;
  cursor: pointer;
  text-decoration: underline;
}
```

---

### Card Component Systems

#### Catalog & Event Cards (`.club-card`, `.course-card`)
- **Structure:** Rounded container (`border-radius: var(--r-xl)`), light border (`1px solid var(--border)`), subtle padding (`1.5rem - 2.5rem`), flex column layout.
- **Micro-interaction:** On hover, cards translate upwards by `-6px` to `-8px` using `cubic-bezier(0.23, 1, 0.32, 1)` and elevate with `--shadow-md`.
- **Top Accent Strip:** `5px` colored border strip matching the event theme (e.g., Sage for Speaking Clubs, Terracotta for Cinema).

```css
.club-card {
    background: var(--warm-white);
    border: 1px solid var(--border);
    border-radius: 24px;
    overflow: hidden;
    transition: transform .3s cubic-bezier(.34, 1.56, .64, 1), box-shadow .3s;
    display: flex;
    flex-direction: column;
}
.club-card:hover {
    transform: translateY(-8px);
    box-shadow: 0 20px 40px rgba(61, 43, 31, .15);
}
```

---

### Navigation Header & Footer Patterns

#### Unified Sticky Navigation Bar (`#cosy-nav`, `.ce-session-nav`)
- **Position:** `sticky`, `top: 0`, `z-index: 1000`.
- **Backdrop:** Translucent white / dark background (`rgba(250, 248, 245, 0.95)`) with native CSS backdrop filter (`backdrop-filter: blur(10px)`).
- **Height & Layout:** Fixed `64px` height with logo branding on the left, primary navigation links in center, and theme switcher / language controls on the right.

#### Mobile Navigation (`.mobile-nav`, `#cosy-mobile-menu`)
- **Bottom Tab Bar (Max-width 800px):** Fixed bottom nav bar for quick finger access to Home, Events, Practice, and Settings.
- **Safe Area Padding:** Utilizes `padding-bottom: max(var(--safe-bottom, 0px), 8px)` to support mobile devices with notched screens (iOS Home Bar).

---

## 4. Interactive Slide Deck Presentation System

For classroom delivery and self-study, individual session HTML decks in `sessions/` are dynamically converted into an interactive slide presentation by `shared/js/cosyevents-session.js`.

### Slide Deck UI Components & Controls
1. **Top Step Tabs (`.sd-step-tabs`):** Dynamic pill tabs displaying session steps (Warm-up, Vocabulary, Round 1, Let's Speak Together, Round 2, Teacher's Note).
2. **Slide Viewport (`.sd-slide-viewport`):** Isolated card container rendering the active section while hiding inactive slides (`display: none`).
3. **Control Bar (`.sd-control-bar`):** Bottom control bar containing:
   - Prev (`←`) and Next (`→`) Slide Navigation Buttons
   - Slide Index Counter (e.g., `Slide 2 of 6`)
   - View Mode Switcher (`Slides` vs. `Scroll`)
   - Fullscreen Presentation Toggle (`🖥️ Fullscreen`)
4. **Progress Bar (`.sd-progress-fill`):** Accent progress bar reflecting completion percentage across the session deck.

### Keyboard Shortcuts
- `ArrowRight` / `Space`: Advance to next slide.
- `ArrowLeft`: Return to previous slide.
- `Escape`: Exit fullscreen presentation mode.

---

## 5. Animation, Micro-Interactions & Transitions

All page transitions and component state changes follow standardized timing functions:

```css
/* Smooth Page Entrance Keyframe */
main, .page, .content-container {
    animation: cosyPageFadeIn 0.35s ease-out;
}

@keyframes cosyPageFadeIn {
    from {
        opacity: 0;
        transform: translateY(4px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

/* Accordion Expand Animation */
.vim-tab-pane, .round-body, .mistake-body {
    animation: vimFadeIn 0.3s ease;
}

@keyframes vimFadeIn {
  from { opacity: 0; transform: translateY(5px); }
  to { opacity: 1; transform: translateY(0); }
}
```

---

## 6. Accessibility & WCAG Standards Compliance

1. **Color Contrast:** All body text meets WCAG 2.1 AA minimum contrast (4.5:1 ratio against background). Dark mode uses softened off-white (`#e8f0e9`) on deep green-black (`#1a1f1a`) to reduce glare.
2. **Accessible Focus Ring:** Universal custom focus indicator using `--teal` (`#416b49`) with `3px` solid offset:
   ```css
   :focus-visible {
       outline: 3px solid var(--teal);
       outline-offset: 3px;
       border-radius: var(--r-sm);
   }
   ```
3. **Motion Sensitivity:** Includes `prefers-reduced-motion` CSS overrides to immediately fallback animations for users with vestibular sensitivity:
   ```css
   @media (prefers-reduced-motion: reduce) {
       *, *::before, *::after {
           animation-delay: -1ms !important;
           animation-duration: 1ms !important;
           animation-iteration-count: 1 !important;
           transition-duration: 1ms !important;
       }
   }
   ```
4. **ARIA Accessibility Attributes:** All interactive accordions, modals, slide tabs, and dropdowns use explicit `aria-expanded`, `aria-controls`, `aria-selected`, and `role` tags.
