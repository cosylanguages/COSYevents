# Hero Contrast Checker (`scripts/check_hero_contrast.js`)

## Purpose
`check_hero_contrast.js` verifies that every session page across `sessions/`, `fr/sessions/`, and `ru/sessions/` satisfies WCAG 2.1 AA minimum contrast standards (contrast ratio >= 4.5:1) between the `h1` hero title text and its effective background (gradient start or solid background color) in both Light Mode and Dark Mode (`colorScheme`).

## Features & Implementation
- Starts a local Node.js HTTP server.
- Uses Playwright Chromium with a worker pool (parallel async execution) to evaluate contrast across 600+ session pages in seconds.
- Computes relative luminance according to the WCAG 2.x specification.
- Evaluates both Light and Dark mode themes (`colorScheme: 'light'` and `'dark'`).

## Running the Check
```bash
node scripts/check_hero_contrast.js
```
