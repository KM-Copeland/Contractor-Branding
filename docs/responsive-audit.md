# Tablet and mobile responsive audit

> **Current implementation note (2026-11-09):** This audit records an earlier design/implementation state. The responsive selection drawer and Step 2 selected-products sheet described below are not present in the current application. Step 1 hides the desktop rail below 1280px and uses the fixed Back/Continue footer. Step 2 uses Imprint Details and Configure Products views; Configure Products has List/Preview tabs and the same fixed footer. No drawer or draggable selection sheet is rendered. See [the current responsive implementation record](validation/responsive-phase6/acceptance.md) and [the current Step 2 layout](validation/step2-redesign/README.md). Historical Figma comparisons below remain evidence for the earlier design, not current behavior requirements.

**Status:** discovery and planning complete; application code was not changed. The latest Figma frames listed below are the visual authority for the two reference sizes. Older temporary responsive guidance is superseded for tablet and mobile by this audit; see [responsive-notes.md](responsive-notes.md).

## Executive findings

The prototype has responsive rules, but they are not yet a reliable responsive system. Step 1 and Step 2 switch layouts at different widths, and a container query uses the catalog's available width as if it were a device width. That turns a 768px tablet catalog into two narrow, short cards even though the 768px Figma design uses three columns. At 1024px the desktop sidebar leaves the catalog and Step 2 panels too narrow. Mobile search filters clip, the selected-products empty state leaks into the compact action bar, and the current generic modal does not match the designed bottom sheet.

Step 2 has the largest vertical mismatch: the form and controls remain too tall on mobile and tablet, so the preview begins below the usable screen and is covered by the fixed action region. The desktop 1440px screenshots were captured as a regression reference. No horizontal overflow appeared at the tested widths, but that alone does not establish usable layout.

## Scope and comparison method

Figma frames were retrieved from file `xODM0i0DWXCtnVps5NkQU2` and inspected for their visible content before use. Browser screenshots were captured at DPR 1 with fonts and images loaded at 768×1140 and 390×844. Step 2 text/logo state uses the same two sample lines and a valid test logo in browser and Figma. Screenshot comparison artifacts include side-by-side pairs, full-frame 50% overlays, and 16 component crops. Step 2 also has full-page captures. A 1440px Step 1 and Step 2 browser capture provides a desktop regression baseline.

The browser comparison helper is [capture.mjs](validation/responsive-audit/capture.mjs); measured layout data across 320, 375, 390, 430, 600, 768, 820, 1024, 1280, and 1920px is in [geometry.json](validation/responsive-audit/geometry.json). Source screenshots are grouped in [Figma references](validation/responsive-audit/figma/) and [browser captures](validation/responsive-audit/browser/). The capture script ran successfully and produced 11 full comparisons and 16 cropped overlays.

The discrepancy register below records the pre-Phase-1 findings. Browser screenshots and geometry were refreshed after Phase 1, so linked comparisons show the updated implementation against Figma and help assess remaining differences. The original browser PNGs were replaced; the pre-change measurements and causes remain described in the audit text.

Representative comparisons:

| Screen and state | Figma vs browser | Component overlay |
|---|---|---|
| Tablet Step 1, multiple selection | [Side by side](validation/responsive-audit/comparisons/tablet-step1-multiple-side-by-side.png) | [Catalog and filters](validation/responsive-audit/comparisons/tablet-step1-multiple-catalog-and-filters-overlay.png), [action bar](validation/responsive-audit/comparisons/tablet-step1-multiple-selection-action-bar-overlay.png) |
| Tablet Step 1, selection sheet | [Side by side](validation/responsive-audit/comparisons/tablet-step1-drawer-side-by-side.png) | [Sheet](validation/responsive-audit/comparisons/tablet-step1-drawer-selection-bottom-sheet-overlay.png), [empty sheet](validation/responsive-audit/comparisons/tablet-step1-drawer-empty-side-by-side.png) |
| Mobile Step 1, multiple selection | [Side by side](validation/responsive-audit/comparisons/mobile-step1-multiple-side-by-side.png) | [Catalog and filters](validation/responsive-audit/comparisons/mobile-step1-multiple-catalog-and-filters-overlay.png), [action bar](validation/responsive-audit/comparisons/mobile-step1-multiple-selection-action-bar-overlay.png) |
| Mobile Step 1, selection sheet | [Side by side](validation/responsive-audit/comparisons/mobile-step1-drawer-side-by-side.png) | [Sheet](validation/responsive-audit/comparisons/mobile-step1-drawer-selection-bottom-sheet-overlay.png) |
| Tablet Step 2, text and logo | [Side by side](validation/responsive-audit/comparisons/tablet-step2-text-logo-side-by-side.png) | [Form](validation/responsive-audit/comparisons/tablet-step2-text-logo-imprint-form-overlay.png), [preview and actions](validation/responsive-audit/comparisons/tablet-step2-text-logo-preview-and-actions-overlay.png) |
| Tablet Step 2, selected-products sheet | [Side by side](validation/responsive-audit/comparisons/tablet-step2-drawer-side-by-side.png) | [Sheet](validation/responsive-audit/comparisons/tablet-step2-drawer-branding-bottom-sheet-overlay.png) |
| Mobile Step 2, text and logo | [Side by side](validation/responsive-audit/comparisons/mobile-step2-text-logo-side-by-side.png) | [Form](validation/responsive-audit/comparisons/mobile-step2-text-logo-imprint-form-overlay.png), [preview and actions](validation/responsive-audit/comparisons/mobile-step2-text-logo-preview-and-actions-overlay.png) |
| Mobile Step 2, selected-products sheet | [Side by side](validation/responsive-audit/comparisons/mobile-step2-drawer-side-by-side.png) | [Sheet](validation/responsive-audit/comparisons/mobile-step2-drawer-branding-bottom-sheet-overlay.png) |

Additional no-selection, single-selection, filtered, and imprint-only comparisons are available in the same comparison folder. Desktop baseline: [Step 1](validation/responsive-audit/browser/desktop-1440-step1.png) and [Step 2](validation/responsive-audit/browser/desktop-1440-step2.png).

## Existing responsive implementation

- `AppShell` keeps a 50px header. Order History and FAQ remain visible until 767px, while the menu appears only below that width. The 768px Figma tablet header already uses the compact menu treatment.
- `Selection.module.css` uses a 1023px breakpoint to convert the Step 1 sidebar into a fixed bottom region. `SelectedProductsSidebar.module.css` uses a separate 950px breakpoint for Step 2, producing an inconsistent 951–1023px range.
- `Selection.module.css` also has a catalog container query. At catalog widths up to 767px it switches to two columns and 170px cards. Because the query responds to the narrowed catalog rather than the viewport, the rule also triggers at desktop-sized viewports when a fixed sidebar leaves a catalog narrower than 768px.
- Mobile category chips use a non-wrapping horizontal strip. At 390px the last chip is clipped in the captured page instead of showing the four Figma controls together.
- The progress bar's workflow region is shifted to the viewport edge: at both reference sizes it begins at x=0 while Figma places it 20px in from the edge.
- Step 2 stacks the form and preview below 950px and adds a fixed bottom action region. Its mobile rules retain large typography, 48px text fields, the bold controls, and broad internal spacing. At 390px this causes the form to extend under the action bar and pushes the preview to approximately y=814. At 768px the preview begins around y=806, versus about y=648 in the Figma frame.
- The compact Step 1 sidebar attempts to hide its empty state with `.selection .emptyState` in `SelectedProductsSidebar.module.css`. The empty-state element's class comes from `Selection.module.css`, so CSS Modules generate different local class names and this selector does not match. The no-selection bar consequently expands into an unwanted second grid column.
- The current `SelectionDrawer` is a centered/limited generic dialog with close, Clear All, and Done controls, a list, Escape dismissal, and trigger-focus restoration. The Figma tablet/mobile design is a bottom sheet with a handle, title/count, item removal controls, and Back/Continue actions. The empty Step 1 Figma sheet has an explicit empty message and disabled Continue; the current sheet has no equivalent empty view.
- The dialog has `aria-modal`, focuses the close control, closes on Escape/backdrop, and restores focus through its caller. It does not trap focus or lock background scrolling. Sheet behavior at short heights, when the keyboard is open, and with a long product list needs an explicit implementation design.

## Intended responsive experience

### Tablet: 768×1140

The 768px Figma frames use the compact header and an inset progress indicator, 20px page gutters, a three-column Step 1 catalog, and a fixed selection action region at the bottom. The selected-product sheet rises from the bottom and replaces the desktop rail; its content and controls remain inside the sheet. The empty sheet is a designed state with a message and unavailable Continue action.

Step 2 keeps its form and preview in a two-region content flow, with the selected-products region represented by the same bottom action/sheet pattern. Form density is reduced enough for the live preview to begin above the bottom action region. The no-imprint, text, and text-plus-logo frames establish distinct validation and artwork-overlay states without changing shared form data.

### Mobile: 390×844

The mobile frames retain the same shared header/progress language, page gutters, selection state, and bottom action/sheet model. Step 1 uses two product columns and keeps search plus category controls visible without clipping. The sheet occupies most of the lower screen and shows selection management and navigation actions.

Step 2 is a single content column. The form remains usable before the preview, but its controls and spacing are compact enough that the preview and fixed actions are not needlessly obscured. Text and logo overlays scale with the product preview. The same product-specific settings, selected rows, and branding state remain available through the sheet.

### Shared behavior and unresolved design meaning

Both sizes use one React workflow, shared product/branding state, a persistent bottom action region, and a bottom sheet. Tablet and mobile differ primarily in available content width and sheet height, not in selection rules. Figma confirms the visible sheet affordance and its Back/Continue controls; it does **not** prove that the handle is draggable or tappable, define all dismissal routes, or specify focus/scroll-lock behavior. These points require product/UX decisions before implementation. Preserve the existing business state and removal rules while implementing the approved presentation.

## Prioritized discrepancy register

Priority: **P0** blocks core content or primary actions; **P1** materially weakens usability or deviates from the approved interaction; **P2** visual refinement or secondary behavior.

| Priority | Device/state and Figma node | Component | Figma expectation vs current browser | Root cause | Proposed change; classification; reuse |
|---|---|---|---|---|---|
| P0 | Tablet Step 1 multiple, `487:4074`; 768×1140 | Catalog grid/cards | Three usable columns with roughly square cards vs two columns with 170px-high cards | Catalog container query applies a viewport-like threshold to its narrower available width | Choose columns/card minimums from available card width; preserve the 3-column tablet reference. Visual/layout. Reuse `ProductCard` and grid. |
| P0 | Tablet and mobile Step 1 no selection, `487:2711`, `482:1359` | Compact selection bar | Compact bar contains the count/empty treatment and actions; current CSS Modules selector fails to hide a cross-module empty-state class, expanding the bar | `.emptyState` is locally scoped in another CSS module | Add a stable host/data attribute or compose a shared class; verify the intended empty-bar state. Visual and functional. Reuse sidebar. |
| P0 | Mobile Step 2 text/logo, `485:6732` | Imprint form, preview, bottom actions | Figma exposes a compact form-to-preview progression; current form overlaps the fixed action area and preview starts below the viewport | Desktop text sizes, field heights, bold buttons, and spacing survive mobile; fixed action bar overlays the document | Set compact form rules and reserve scroll clearance for the action region; ensure fields remain reachable with keyboard open. Visual and interaction. Reuse form and preview. |
| P0 | Tablet Step 2 text/logo, `489:5796` | Form/preview workspace | Preview begins around y=648; current preview begins around y=806 and is partly below the fixed actions | Tablet form stays near 600px tall with desktop spacing and controls | Reduce only tablet form density to reference and keep preview visible above persistent actions. Visual/layout. Reuse panels. |
| P1 | Tablet and mobile drawer states, `492:6328`, `492:6539`, `492:5999`, `483:4013`, `486:10713` | `SelectionDrawer` | Full-width bottom sheet with handle, selected rows/status, and Back/Continue; current generic dialog has close/Clear All/Done and lacks the designed empty state | Shared component currently encodes a generic modal presentation | Extend one drawer with responsive sheet presentation and explicit step/empty variants; preserve shared list/state. Visual and functional. Reuse `SelectionDrawer`, `SelectedProductsList`, row. |
| P1 | Mobile Step 1 all states, `482:1359`–`482:3368` | Search and category chips | All four filters visible in the same search row/area; current pill strip clips the final item at 390px | Fixed chip sizing and non-wrapping overflow | Use a content-fit or compact wrapping arrangement based on available width; do not hide a filter. Visual and functional. Reuse search/filter logic. |
| P1 | Tablet header, `487:2711` | `AppShell` navigation | Tablet uses compact navigation; current desktop links remain at 768px | Header switches only below 768px | Align header compact mode with the approved tablet layout. Visual and functional affordance. Reuse header. |
| P1 | Tablet Step 1/2, all, including `487:2711` and `487:4848` | `WorkflowProgress` | Progress inset aligns with the 20px page gutter; current workflow track starts at x=0 | Shared shell negative/bleed alignment | Apply one shared inset rule without changing the desktop approved header. Visual. Reuse progress component. |
| P1 | Intermediate 951–1024px, inferred from measured layouts | Shared workspace/rail | Step 1 bottom region starts at 1023px, Step 2 at 950px; at 1024px the fixed right rail constrains the catalog and form/preview columns severely | Separate layout breakpoints and no minimum-content constraints for panel columns | Derive a shared transition from minimum usable widths and test 820/1024/1280. This range lacks direct Figma screenshots, so treat exact transition as a proposal. Visual/layout. Reuse shared sidebar and panels. |
| P1 | Tablet/mobile sheet, all sheet nodes | Sheet accessibility/scroll | Product rows scroll while actions need to remain reachable; background and focus state should remain controlled | Current dialog lacks focus trap and scroll lock; only the list itself scrolls | Add modal focus containment, background scroll lock, Escape handling consistent with approved dismissal, safe-area padding, and independent sheet-list scrolling. Functional/accessibility. Reuse dialog component. |
| P2 | Mobile Step 2 text/logo `485:6732` | Preview stage and imprint overlays | Overlay remains proportionate to device art as the stage narrows; current stage has reduced minimum height, but scaling and crop must be verified after form/layout changes | Preview area has local minimums and product-specific artwork ratios | Keep product aspect ratios and scale logo/text relative to the artboard; cover representative landscape and portrait art. Visual. Reuse current preview mapping. |
| P2 | Mobile/short viewport states, inferred | Sheet handle, browser keyboard, page scroll | Sheet actions remain usable with many rows, safe areas, and keyboard open; Figma does not specify exact gestures or focus behavior | Existing modal uses a fixed height cap and generic close mechanics | Confirm tap/drag/dismissal semantics first; then validate short height, keyboard, and safe-area behavior. Functional; reuse one sheet. |
| P2 | All responsive widths | Desktop regression | Existing 1440px desktop geometry remains stable | Future shared CSS may affect desktop | Keep 1440 Step 1/2 baselines and run existing e2e suite after each implementation phase. Visual/functional. Reuse all existing components. |

## Component reuse opportunities

- Keep `SelectedProductsSidebar` and `SelectedProductsList` as the single source of selected product rows, removals, visibility statuses, and active-product highlighting. Add responsive presentation variants rather than cloning product logic.
- Extend `SelectionDrawer` as the shared sheet shell with explicit `selection`/`branding` and empty/selected variants. Continue to receive the existing state and callbacks from `SelectionPanel` and `BrandReview`.
- Keep `ProductCard`, catalog data, filter/search state, `BrandReview` form state, upload validation, preview artboard, and logo/text mapping. Responsive work should change layout and presentation, not business rules.
- Centralize page gutter, compact header, bottom action clearance, and breakpoint decisions in the existing tokens/layout styles where they are genuinely shared. Avoid independent Step 1 and Step 2 breakpoint declarations for the same structural transition.

## Evidence limits

The Figma references define only the two exact responsive viewports in this audit. Intermediate widths are measured in the browser, but the proposed transitions at 820/1024/1280 need product review. The image states were recreated with equivalent local data; Figma and browser artwork can still have rendering differences from font availability and image decoding, so prioritize geometry and component behavior over anti-aliasing. The desktop captures are regression snapshots, not a new desktop design audit. No application tests were changed or run because this task did not change application code; the Playwright capture workflow itself completed successfully.
