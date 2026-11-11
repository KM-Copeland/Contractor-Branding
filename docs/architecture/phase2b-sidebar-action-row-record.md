# Phase 2B: Sidebar action-row contract cleanup

**Date:** 2026-11-09  
**Scope:** remove the undefined Step 1 CSS Module class lookup while preserving the sidebar's existing action-row and keyboard-focus contract.

## Findings and change

`SelectionPanel.tsx` referenced `styles.actionRow`, but `Selection.module.css` defines no `.actionRow`. That lookup produced no class, so it did not participate in layout or appearance. The desktop sidebar owns the grid through `.footer [data-sidebar-action-row]` in `SelectedProductsSidebar.module.css`.

The Step 1 wrapper now keeps only `data-sidebar-action-row`. The sidebar uses that stable attribute both for action-row styling and to restore keyboard focus to Back when removal leaves no product rows. Step 2 remains unchanged: `BrandReview.tsx` uses its valid `.actionRow` CSS Module class as well as the shared data attribute. The responsive footer is unchanged.

## Protected state and validation

The working tree and pre-edit Git status were copied before editing to:

`C:\Users\welau\.codex\visualizations\2026\10\08\01a11c5d-9825-7c83-8a1d-72a5d2451728\phase2b-protected-before-sidebar-action-row-cleanup-2026-11-09`

No existing changes were staged, committed, reset, stashed, or cleaned. A new Playwright regression verifies keyboard removal moves focus to the next product row, then to the Back action when the final row is removed.

Before/after evidence uses Chromium at DPR 1, default 100% zoom, reduced motion, and the six requested widths: 390, 768, 1279, 1280, 1440, and 1920px. The capture set includes Step 1 empty and multiple-product states plus Step 2 selected-product states. All 45 screenshot pairs are pixel-identical, and the computed-style comparison is empty. See [before metadata](evidence/phase2b/before/metadata.json), [after metadata](evidence/phase2b/after/metadata.json), and [pixel comparisons](evidence/phase2b/after/screenshot-comparisons.json).

Validation: TypeScript passed; production build passed; the focused workflow/sidebar suite passed 46 tests; the full Playwright suite passed 91/91, including the new focus regression. `git diff --check` passed. The suite rewrote unrelated pre-existing `docs/validation` artifacts; files that differed from the protected checkpoint were restored to their exact pre-test contents.
