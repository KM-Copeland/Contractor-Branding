# Phase 4D: Desktop Preview CSS Ownership Extraction

## Outcome

`ProductPreviewPanel` now imports a dedicated `ProductPreviewPanel.module.css` for desktop preview controls and interior layout. Its outer panel and heading remain parent/shared styles from `BrandReview.module.css`. This is a CSS ownership change only: no preview markup, state, data, capability rule, callback, or interaction changed.

## Selector ownership

Moved into `ProductPreviewPanel.module.css`:

- `.carouselControls`, its button and disabled rules
- `.applyBar`, its direct child and nested switch-label rules
- `.switchLabel`, `.switch`, `.switchOn`, and `.switchDisabled`, including thumb and disabled-state rules
- `.previewProduct` and its category span
- `.previewStage`, `.stageExpanded`, and `.artboard`

Their existing `max-width: 1279px` and `max-width: 767px` declarations moved with the owning selectors in the same order. These preserve the former transition-time behavior while React swaps desktop and responsive compositions at 1280px. No breakpoint or declaration value changed.

Retained in `BrandReview.module.css`:

- `.previewPanel`, including its shared border/background/min-height framing, height/overflow behavior, and `.layout.expanded .previewPanel` parent relationship
- `.panelHeading` and `.panelHeading h2`, because the heading is shared presentation and responsive overrides remain parent-owned
- `.productArt`, `.brandLogo`, and `.brandText`, because both desktop panel and responsive carousel consume these same artwork and overlay rules
- `.layout`, `.expanded`, `.workspace`, and all form, screen, and responsive-composition rules

The desktop panel now imports the two modules as `styles` (component-owned interior) and `layoutStyles` (parent/shared framing and artwork). Compound selectors such as `.applyBar .switchLabel` and `.previewStage.stageExpanded` remain within one CSS Module, so CSS Module hashing does not break their relationships. The responsive carousel does not import the new module.

## Source size

| File | Before | After |
| --- | ---: | ---: |
| `ProductPreviewPanel.tsx` | 3,964 bytes / 36 lines | 4,055 bytes / 37 lines |
| `BrandReview.module.css` | 20,046 bytes / 315 lines | 16,981 bytes / 285 lines |
| `ProductPreviewPanel.module.css` | — | 3,128 bytes / 36 lines |
| Combined | 24,010 bytes | 24,164 bytes |

The parent stylesheet is 3,065 bytes smaller. Combined source grows by 154 bytes for the second module import and separated selector ownership; the stylesheet rules are not duplicated.

## Baseline and visual validation

A fresh protected snapshot was created before edits at `C:\Users\welau\.codex\visualizations\2026\10\08\01a11c5d-9825-7c83-8a1d-72a5d2451728\phase4d-protected-checkpoint-2026-11-09`. It includes the full working tree except `.git` and `node_modules`, plus a status listing and binary diff patch. Pre-existing validation artifacts were included.

The Phase 4C record documented a historical full-suite result of 98 passed and one Aileron font-weight assertion failure. In this Phase 4D checkout, a fresh pre-edit full run passed all 99 tests, so that older failure did not reproduce. The before/after capture suite was also run against this unchanged baseline.

Fresh Chromium captures use DPR 1, 100% browser zoom, reduced motion, and wait for fonts and images. Desktop Step 2 covers 1280×900, 1440×900, and 1920×1080 with empty/disabled controls, text-only, logo-only, logo+text, middle and last navigation, a long product name, warning feedback, and navigation back. Responsive smoke covers List and Preview at 390×844, 768×1140, and 1279×800.

All 30 before/after states have matching semantic DOM, measured geometry and computed styles, and screenshot pixels. All 30 after/repeat captures also match exactly. No comparison threshold was increased. Evidence and the repeatable harness are in `docs/architecture/evidence/phase4d-preview/` and `docs/architecture/capture-phase4d-preview.mjs`.

## Checks

- TypeScript `tsc --noEmit`: passed before and after extraction.
- Production Vite build: passed before and after extraction. The initial sandboxed build invocation hit a filesystem access error; rerunning with the approved local Node runtime succeeded.
- Focused desktop Step 2, configuration-completeness, and responsive fidelity suite after extraction: 47 passed.
- Full Playwright suite: 99 passed before extraction and 99 passed after extraction.
- `git diff --check`: passed; Git emitted existing LF-to-CRLF working-copy notices.

## Remaining ownership boundary

Shared artwork and overlay styles remain in `BrandReview.module.css` because desktop and responsive components both use them. A suitable Phase 4E boundary is to decide whether those rules should move together into a small shared artwork-presentation module or remain feature-owned in the current shared module, then validate both preview compositions. Do not combine that decision with responsive-carousel stylesheet migration or screen decomposition.
