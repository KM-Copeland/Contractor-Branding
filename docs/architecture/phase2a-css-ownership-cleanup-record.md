# Phase 2A: Selection CSS ownership and redundancy cleanup

**Date:** 2026-11-09  
**Scope:** remove only verified orphaned Selection/sidebar CSS. Component hierarchy, JSX, styles that affect the rendered interface, and workflow behavior remain unchanged.

## Protected state

Before edits, the complete working tree (including untracked files) and `git status --short` were copied to:

`C:\Users\welau\.codex\visualizations\2026\10\08\01a11c5d-9825-7c83-8a1d-72a5d2451728\phase2a-protected-before-css-ownership-cleanup-2026-11-09`

No changes were staged, committed, stashed, reset, or cleaned. The existing full Playwright baseline was 90/90 passing before CSS edits.

## Ownership findings

- `Selection.module.css` is imported by `StepOneScreen`, `ProductCard`, `SelectionPanel`, and `SelectionReady`. It owns Step 1 page/catalog/filter/card styles, the live empty-selection state, and the completion selection view.
- `SelectedProductsSidebar.module.css` is imported by `SelectedProductsSidebar.tsx`. It owns the shared desktop rail shell, positioning, header, footer, and rail action layout.
- `SelectedProductsList.module.css` is imported by `SelectedProductsList` and `SelectedProductRow`. It owns grouped products, rows, selected-row states, and status indicators.
- `Controls.module.css` is imported by the shared `Controls.tsx` component and remains responsible for reusable controls.

The live empty-selection node is passed into the sidebar as a `ReactNode`, but its classes are supplied by `SelectionPanel` from `Selection.module.css`. The identically named empty-state selectors in the sidebar stylesheet therefore never matched live markup. Five selectors duplicated the active Selection rules and were confirmed unused by static and runtime reference searches.

The Selection module also contained one unmatched `.actionRow > button:last-child img` selector. The component requested `styles.actionRow`, but the module had no `.actionRow` class, so CSS Modules returned no class for that lookup. The rule was additionally inside the responsive range where the desktop sidebar is hidden and a separate responsive footer owns the visible controls. It had no computed effect.

No further declarations were changed. The mounted-but-inactive `.inactive` rules, container query, focus-visible styling, status-dependent rules, and responsive fallbacks remain. The shared sidebar and row modules continue to own their existing responsibilities. No styles were moved to global CSS.

## Changes performed

- Removed `.emptyState`, `.emptyIcon`, `.emptyCopy`, `.emptyCopy strong`, and `.emptyCopy span` from `SelectedProductsSidebar.module.css`.
- Removed the unmatched responsive `.actionRow > button:last-child img` rule from `Selection.module.css`.
- Kept the active empty-state styles in `Selection.module.css` unchanged.
- Runtime files changed: `Selection.module.css` and `SelectedProductsSidebar.module.css` only.
- Source CSS decreased by 514 bytes across the two files (459 bytes from the sidebar module and 55 from Selection).
- Added deterministic before/after captures and this record; updated the CSS audit with only these verified findings.

## Validation evidence

The [capture utility](capture-phase2a-selection-css.mjs) recorded Step 1 empty, single, multiple, filtered/search states and Step 2 multi-product, unconfigured, active-product, and configured states across the requested viewport set. It used Chromium 156, DPR 1, default 100% zoom, reduced motion, and waited for fonts and images. Responsive widths capture the full workflow because the rail is intentionally hidden there; desktop screenshots focus on the selected-products rail, except the filtered catalog state, which captures the full page.

The [before captures](evidence/phase2a/before/metadata.json) and [after captures](evidence/phase2a/after/metadata.json) contain 45 matched scenarios. The [computed-style comparison](evidence/phase2a/after/computed-style-differences.json) is empty, and all 45 screenshot pairs are pixel-identical in the [pixel comparison results](evidence/phase2a/after/screenshot-comparisons.json). The captures include bounding rectangles for the rail or responsive main/footer/configuration regions.

Baseline full suite before edits: 90/90 passed. After edits, TypeScript and the production build passed; the focused Selection, sidebar, workflow, and Step 2 tests passed 45/45; the complete Playwright suite passed 90/90. `git diff --check` passed, with only Git's existing LF-to-CRLF notices. A checkpoint comparison restored test-generated changes outside Phase 2A and confirmed no other pre-existing files changed.

## Next CSS ownership improvement

Review the control/action-row contract shared by the sidebar footer and responsive action footer. The sidebar currently styles the action row through a data attribute while `SelectionPanel` still requests a nonexistent CSS Module class; removing or correcting that stale class lookup requires a narrowly scoped JSX/type contract change and belongs in a later batch. Do not combine it with broad extraction from the large Step 2 stylesheet.
