# COSYevents Italian (`it`) and Greek (`el`) Content Inventory & Hub Proposal

**Audit Date:** September 2026
**Target File:** `/link-audit/05-it-el-content-inventory.md`

---

## 1. Content Inventory: Existing Italian (`it`) and Greek (`el`) Files

Across the repository, exactly **16 files** exist for Italian (`it`) and Greek (`el`), concentrated entirely within the Karaoke Club format (`sessions/karaoke-club/`):

### Italian (`it`) Files (7 Total)
1. `sessions/karaoke-club/it/due-grosse-lacrime-bianche.html`
2. `sessions/karaoke-club/it/luomo-che-amava-le-donne.html`
3. `sessions/karaoke-club/it/un-raggio-di-sole.html`
4. `sessions/karaoke-club/it/unatta-estate.html`
5. `sessions/karaoke-club/challenges/it/massimo-ranieri-challenge/index.html`
6. `sessions/karaoke-club/challenges/it/massimo-ranieri-challenge/chi-sara-con-te.html`
7. `sessions/karaoke-club/challenges/it/massimo-ranieri-challenge/lamore-e-un-attimo.html`

### Greek (`el`) Files (9 Total)
1. `sessions/karaoke-club/el/an-einai-i-agapi-amartia.html`
2. `sessions/karaoke-club/el/faros.html`
3. `sessions/karaoke-club/el/na-i-agapi-na.html`
4. `sessions/karaoke-club/challenges/el/arletta-challenge/index.html`
5. `sessions/karaoke-club/challenges/el/arletta-challenge/kapoies-nychtes.html`
6. `sessions/karaoke-club/challenges/el/arletta-challenge/o-gatos.html`
7. `sessions/karaoke-club/challenges/el/mple-challenge/index.html`
8. `sessions/karaoke-club/challenges/el/mple-challenge/fovamai.html`
9. `sessions/karaoke-club/challenges/el/mple-challenge/to-idio-to-theo.html`

---

## 2. Navigation & Language Switcher Audit Findings

- **`karaoke-club.html`**: Fully functional. Contains flag filter buttons (`🇮🇹`, `🇬🇷`) that correctly filter and link to all existing Italian and Greek sessions and challenges.
- **`cinema-club.html`**: Contains flag filter buttons (`🇮🇹`, `🇬🇷`), but no standalone Italian or Greek cinema session files exist on disk yet.
- **`game-evenings.html`**, **`keeping-up-with-science.html`**, **`lets-celebrate.html`**, **`my-life-with-without.html`**: List `🇮🇹` / `🇬🇷` in the metadata tables as planned supported languages, but do not contain standalone language hubs or localized session pages.
- **Root-level Language Hubs (`it/index.html` & `el/index.html`)**: **Do not exist**. Clicking Italian/Greek flag options on global navigation bars or hub switchers does not lead to a root `it/index.html` or `el/index.html` page.

---

## 3. Proposed Minimal Language Hub Outlines (`it/index.html` & `el/index.html`)

Modeled on `fr/index.html` and `ru/index.html`, minimal language hubs can be structured as follows:

```html
<!-- Proposed it/index.html -->
<header class="hub-hero">
  <h1>Eventi COSYlanguages in Italiano 🇮🇹</h1>
  <p>Impara l'italiano con sessioni interattive, karaoke e club di conversazione.</p>
</header>
<main>
  <section class="format-grid">
    <div class="card">
      <h3>🎤 Karaoke Club (7 Sessioni)</h3>
      <a href="../karaoke-club.html?lang=it">Esplora Karaoke in Italiano →</a>
    </div>
  </section>
</main>
```

```html
<!-- Proposed el/index.html -->
<header class="hub-hero">
  <h1>Εκδηλώσεις COSYlanguages στα Ελληνικά 🇬🇷</h1>
  <p>Μάθετε ελληνικά με διαδραστικές συνεδρίες, καραόκε και λέσχες συνομιλίας.</p>
</header>
<main>
  <section class="format-grid">
    <div class="card">
      <h3>🎤 Karaoke Club (9 Συνεδρίες)</h3>
      <a href="../karaoke-club.html?lang=el">Εξερευνήστε Καραόκε στα Ελληνικά →</a>
    </div>
  </section>
</main>
```

---

## 4. Task Scope Assessment

- **Scope Status**: **Larger Task / Sparse Format Coverage**.
- **Reasoning**: While creating minimal `it/index.html` and `el/index.html` hub HTML files that link out to Karaoke Club sessions is a straightforward wiring step, 9 out of 10 format catalogs (Speaking Clubs, Cinema Club, Mind Matters, etc.) currently have **0 Italian or Greek sessions**. As a result, root language hub pages would be mostly empty until additional format content is developed.
