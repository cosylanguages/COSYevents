# Isolation report

Generated 2026-11-27T12:23:55.636Z by `scripts/check_isolation.js`.

## Summary

| Metric | Value |
| --- | --- |
| HTML pages scanned | 716 |
| Pages loading assets from another COSY repo | 0 |
| Cross-repo asset references | 0 |
| JS files loading assets from another COSY repo | 2 |
| Cross-folder dependency edges | 0 |
| Pages using self-absolute COSYevents URLs | 0 |

## Cross-repo dependencies

None.

## Cross-repo assets loaded from JavaScript

| File | Repos |
| --- | --- |
| `shared/js/daily-wheel.js` | `COSYtools` |
| `shared/vendor/cosylanguages/js/daily-directory.js` | `COSYtools` |

## Cross-folder edges

| Edge | Pages |
| --- | --- |
| none | 0 |

## What this measures

A page is isolated when every asset it loads comes from its own top-level
folder or from `shared/`. The baseline above is grandfathered: CI fails only
when a page adds a dependency that is not already listed here.
