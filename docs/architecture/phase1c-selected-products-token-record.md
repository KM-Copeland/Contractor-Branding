# Phase 1C: Selected Products List semantic token migration

**Date:** 2026-11-09  
**Scope:** migrate shared selected-product list colors to existing semantic aliases. No token definitions, JSX, layout, workflow behavior, selection state, or responsive rules changed.

## Protected state and changes

The pre-edit working tree was copied to:

`C:\Users\welau\.codex\visualizations\2026\10\08\01a11c5d-9825-7c83-8a1d-72a5d2451728\phase1c-protected-before-list-migration-2026-11-09`

The checkpoint includes the full existing dirty tree and status listing, captured before this phase's evidence and test files were added. No files were staged or committed.

Only `src/features/selection/SelectedProductsList.module.css` changed at runtime. Existing tokens now replace the raw values:

- `#2a2a26` → `var(--color-text-primary)` for group headings, product names, and status text.
- `#dee4ed` → `var(--color-border-subtle)` for default row borders.
- `#fff` → `var(--color-surface-default)` for default row backgrounds.
- `#0c30cc` → `var(--color-action-primary)` for active row borders and Remove text.
- The active row continues to use `var(--color-selected)`.

All aliases already existed and resolve to the prior values. No tokens were necessary. `SelectedProductsList` and `SelectedProductRow` consume this module through the shared `SelectedProductsSidebar`, so the migration applies to both Step 1 and Step 2.

## Before/after evidence

The capture utility is [capture-phase1c-selected-products.mjs](capture-phase1c-selected-products.mjs). It captures a single selected product, a four-product multi-category selection, a removal state, and four mixed Step 2 active-product states at 1280×900, 1440×900, and 1920×1080. It waits for fonts and image decoding, sets DPR 1 and reduced motion, normalizes the pointer position, records computed styles, and compares decoded PNG pixels.

The [before captures](evidence/phase1c/before/metadata.json) and [after captures](evidence/phase1c/after/metadata.json) document the states and conditions. The [computed-style comparison](evidence/phase1c/after/computed-style-differences.json) reports zero differences. All 21 screenshot pairs are pixel-identical; see the [pixel comparison results](evidence/phase1c/after/screenshot-comparisons.json).

The focused [token contract test](../../tests/selected-products-token-contract.spec.ts) checks default and active row colors, text/status colors, muted Step 1 opacity, fully visible Step 2 status indicators, selection/removal, and responsive rail visibility at 390, 768, and 1279px.

## Validation

- Focused selected-products token contract: 2/2 passed.
- TypeScript check (`tsc --noEmit`): passed.
- Production build (`vite build`): passed; Vite transformed 63 modules.
- Full Playwright suite: 88/88 passed.
- `git diff --check`: passed; Git only reported its existing LF-to-CRLF conversion notices.

The shell did not resolve `npm`; validation used the task's local Node, TypeScript, Vite, and Playwright executables. The Playwright suite rewrote pre-existing screenshots and geometry files under `docs/validation`; those generated changes were restored from the protected checkpoint, leaving the pre-phase contents intact.

## Next candidate

`src/components/WorkflowProgress.module.css` is the next candidate for a separate, focused token review. This record does not authorize that migration.
