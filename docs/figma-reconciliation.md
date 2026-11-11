# Figma reconciliation assessment

> **Current implementation note (2026-11-09):** This assessment preserves the October Figma comparison. Its responsive drawer/sheet descriptions and recommendations are historical. The current prototype has no responsive selected-products drawer: Step 1 uses a fixed action footer with the rail hidden, and Step 2 uses Imprint Details plus Configure Products List/Preview modes with a fixed action footer. Keep the Figma observations as historical design evidence; use current code and the Phase 6 acceptance record for implemented behavior.

## Source and scope

Reviewed the current Figma file `xODM0i0DWXCtnVps5NkQU2` on 2026-10-28. The source frames inspected were:

- Step 1 desktop: No selection `356:2003`, Single selection `358:1573`, Multiple selection `358:2036`, Filtered `482:2938`, and narrow desktop single-selection `269:1474`.
- Step 1 responsive: Mobile multiple-selection `482:2288` and tablet multiple-selection `487:4074`.
- Step 2 desktop: No imprint `322:1282`, imprint details `358:2554`, text preview `485:4961`, and text plus logo preview `485:6122`.
- Step 2 responsive: Combined text and logo preview on mobile `485:6732` and tablet `489:5796`.

These are observations of the current Figma and current application. Older exports exist in `docs/figma-source`; this assessment does not infer historical design changes where a matching previous frame is unavailable.

## Baseline discrepancy assessment (before the current implementation)

| Area | Current Figma vs prototype | Classification | Priority |
|---|---|---|---|
| Shared site header | White 50px header, compact C mark and title, right-side account/menu, thin blue workflow progress bar. Prototype uses a tall blue header and numbered horizontal workflow component. | Visual + functional | High |
| Step 1 intro and discovery | Compact “Choose products” intro; one search field and compact category chips (All, Thermostats, Wallplates, Other). Product-family group headings are part of the catalog. | Visual | High |
| Product cards | Four columns on wide desktop, three at narrow desktop, two on mobile/tablet; compact image/title cards, selection check at top-left, capability badges top-right, blue selected border/background. Prototype uses different grid breakpoints and card proportions. | Visual | High |
| Selection summary | Desktop right rail titled “Selected products,” grouped concise rows with remove icons and selected count. Mobile uses a fixed bottom action tray and opens selection in a drawer. Prototype uses a “Selection” panel with clear/remove links and a Continue/Edit Products footer. | Visual + functional | High |
| Step 2 structure | Shared imprint form and a larger “Live Preview” in adjacent panels; selected products remain visible in the desktop right rail. Prototype stacks preview/form and uses separate selection switches. | Visual | High |
| Step 2 configuration | Imprint details are shared; logo/text enablement is set for the active product in a compact “Apply to this product” bar. Product carousel provides previous/next and current count. | Visual + functional | High |
| Preview state | Product title/category, product-specific settings, live artwork and overlays are shown in the preview. Preview expansion control and the older collapsed/expanded split are not present in inspected new frames. | Visual + functional | High |
| Upload and optional text | Compact upload dropzone, optional logo label, print-readiness status when a logo is present, two shared lines and counters. Current prototype includes more detailed upload validation guidance/status and bold controls. | Visual + functional / Uncertain | High |
| App completion and footer | Inspected Step 1/2 frames show the workflow canvas and no footer. The older app shell footer is outside these frames. Whether to retain the footer in other site contexts is not specified. | Uncertain | Medium |
| Copy and assets | Product names and supplied thermostat artwork are consistent in inspected frames; current Figma uses a compact Copeland “C” mark and updated search/menu/preview icons. | Visual | High |

## Implementation notes and assumptions

- Preserve search, category filtering, hidden selection state, browser history, per-product imprint capability rules, logo file validation, and reversible local completion behavior.
- Use one reducer-backed workflow state for shared logo/text, per-product switches, active product, and selection; the carousel and summary are projections of that state.
- The inspected Step 2 frames show both logo and text enabled on Sensi Smart. Preserve product capability restrictions and disable unsupported combinations for other products.
- The new Figma depicts a “Logo meets print requirements” success state. Keep the prototype's evidence-based validation and avoid asserting print readiness unless the existing validator actually confirms it; visually adapt the success treatment only where its result supports that claim.
- Existing text bold controls are not visible in the new frames. Keep them only if needed for existing workflow coverage; their intended visibility in the revised design is uncertain.
- Mobile Step 1 shows a sticky Continue tray and selected count, while Step 2 shows a sticky selected-count/active-product/Continue tray. The product selection drawer is separately represented in Figma; retain a responsive drawer entry point.
- Figma's layouts are design targets, not instructions to reproduce its layer tree. Preserve the existing React, TypeScript, CSS Modules, typed product metadata, and reducer architecture.

## Implementation order

1. Align shared header, progress indicator, page surface and desktop breakpoints.
2. Rework Step 1 cards, discovery controls, selection rail and mobile selection tray/drawer.
3. Rework Step 2 into shared imprint details, live preview carousel, active-product settings and selected-product rail/tray.
4. Preserve and reconcile upload/print feedback and completion behavior.
5. Update focused Playwright coverage, build, run the full workflow suite and capture desktop/mobile comparisons against the current Figma frames.

## Existing behavior to preserve

Product selection and filters remain state-driven; hidden selections are not discarded by filtering. Step 2 continues to share imprint text/logo across selected families while keeping logo/text switches per family. Unsupported product capabilities remain unavailable, upload checks remain local, and no backend order or production request is introduced.

## Step 1 visual fidelity correction — Pass 1 (2026-10-28)

Rechecked the current Figma frames listed in the request and used `get_metadata` for node coordinates, plus `get_screenshot` exports at their native dimensions for visual comparison. The comparison captures use 100% viewport sizing, DPR 1, and matching states. The source frames show a white workflow canvas with no site footer inside the workflow frame; the shell keeps the footer in normal page flow, with its existing minimum-height behavior for short screens.

At 1920px, the 50px page gutters leave a 1420px catalog, a 40px gap, and a 360px selected-products rail beginning at x=1510. The desktop progress track spans 1510px, aligned to the viewport’s left edge. The catalog intro begins at page y=90; search and filters begin at y=212; the first product group begins at y=300 and its first card at y=344. Wide cards are 340×315px, with 20px internal spacing, a 300×236px image slot, and a 220×143px product image.

At the 1280px reference, the catalog is 780px wide and the rail begins at x=870. Cards use three columns at 253.33×215px with 10px gutters. Tablet and mobile preserve the source’s three- and two-column layouts and use a full-width search row, while the selected-products tray remains available without horizontal overflow.

Pass 1 consolidates the affected Step 1 CSS instead of stacking new overrides. It aligns the shell and progress track, catalog/sidebar proportions, card and image geometry, search/filter styling, capability badges, selected state, and empty-state boundary. The search, filters, multi-select, keyboard navigation, removal, Clear All, and selection persistence behavior remain in place. The selection rail retains the requested Clear All link even though the current Figma selection examples only show per-product removal; this is the intentional functional difference in the rail.

Current-frame Figma exports, matching prototype captures, same-size side-by-side comparisons, and measured browser geometry are stored in [`docs/validation/step1-pass1`](validation/step1-pass1/). The wide-frame Playwright assertion verifies the card, image-slot, progress-track, and rail coordinates directly. The remaining known visual differences are font rasterization and the additional Clear All link; no card-scale or page-column discrepancy remains at the measured desktop references.

## Implemented reconciliation

- Rebuilt the shared navigation and progress treatment; Step 1 now uses compact category filters, responsive product-card grids, upper-left selection marks, upper-right capability indicators, and a selected-products rail.
- Added mobile selected-product drawers from both Step 1 and Step 2 so people can inspect, remove, or clear choices without hiding the sticky continue tray; Step 2 also shows the active product in that tray.
- Reorganized Step 2 into shared imprint details, a live active-product preview, product-specific logo/text switches, and a selected-products rail. The drawer and preview share reducer-backed state, so choosing a product in either place updates the same active preview.
- Kept the prototype's detailed local file checks and expanded-preview behavior because the current Figma screens do not define those behaviors. Automated file checks still avoid claiming final production approval.
- Captured desktop and mobile browser states in `docs/validation`; full browser verification passes across product, branding, and completion flows.

## Step 2 visual fidelity correction — Pass 2 (2026-10-28)

Rechecked the current 1920 × 1080 Figma frames: no imprint `322:1282`, imprint details `358:2554`, text preview `485:4961`, and text plus logo `485:6122`. The desktop workflow now gives the form and preview a 1,420px workspace with 40px between panels, sized 446.7px and 933.3px; the selected-products rail occupies its dedicated 360px region at the right. At the reference viewport, the form and preview are 752px tall, the active product row begins at y=206 and is 90px high, and the preview artwork uses its 693px reference width. The expanded preview retains the prototype behavior and scales text with the artboard.

The reducer, product capabilities, local file checks, shared imprint text, per-product switches, carousel, removal, and return-to-selection behavior remain intact. The prototype intentionally retains the requested `Clear All` action, `Edit Products` navigation, preview expansion, and per-line bold controls. Print readiness stays evidence-based: the Figma success state is not copied when the test vector asset only qualifies for review.

Four current-frame comparisons and their source captures are in [`docs/validation/step2-pass2`](validation/step2-pass2/README.md). The full Playwright suite passes (36 tests), and TypeScript plus the Vite production build pass. Remaining visible differences are these retained controls and the amber review warning in the combined-imprint capture, where Figma displays a green success state.
