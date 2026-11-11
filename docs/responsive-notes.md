# Responsive strategy — Phase 2 provisional implementation (historical)

> **Superseded for tablet/mobile:** This file records the earlier provisional assumptions before the latest responsive Figma frames were reviewed. Use [responsive-audit.md](responsive-audit.md) for verified tablet/mobile findings and [responsive-implementation-plan.md](responsive-implementation-plan.md) for the proposed next steps. The notes below remain as historical context, not approved responsive requirements.

> **Implementation status (2026-11-09):** The later drawer/sheet proposals in this note and in the audit/plan were not retained. Current compact Step 1/Step 2 layouts use the fixed responsive action footer; Step 2 uses Configure Products List/Preview modes without a selected-products drawer.
Only 1280px desktop frames were supplied and inspected. No finalized tablet/mobile UX is claimed.

## Desktop: 1280px and above
Match the initial screen at 1280 first: 50px gutters, 780/40/360 catalog-gap-summary layout. Center the 1280px main container on wider viewports. Header context uses a separate 1440px maximum; confirm the wider-screen relationship later.

Use a three-column grid, semantic source order, flexible main column and constrained summary. Preserve intentional image geometry. Avoid reproducing Figma's 1280px minimum width.

## Tablet: below 1280px
Historical temporary behavior: search/filter wrapping, 32px gutters, two product columns and a 300px summary. Below 950px, selection stacked after the catalog and the grid returned to three columns. A prior review asked whether the summary should become sticky or a drawer; the current implementation instead uses a fixed responsive action footer and no selected-products drawer.

## Mobile: below 768px
Implemented temporary behavior: stacked main content, two product columns, wrapping controls/footer links, 20px gutters, fluid search and a three-part labelled progress sequence. Header navigation wraps onto a second row. Below 440px the product grid becomes one column. Product image slots keep their original 125×81 dimensions. This requires dedicated mobile design review.

## Future Step 2
Collapsed/expanded are user-controlled layout states, not automatically mobile/desktop variants. Below the two-column fit threshold, preserve content in one column and retain the same form values and active preview. Confirm whether expansion remains useful there.

## Checks performed
All three Step 1 states were compared at 1280px. At 1024, 767 and 375px Playwright confirmed no horizontal overflow and working selection, including the new summary actions in the rendered page. Keyboard removal, Clear All and navigation focus were tested at desktop size. Narrow checks establish basic usability only, not approved visual fidelity. Remove/Clear All placement and touch targets need a dedicated narrow-screen design pass.
