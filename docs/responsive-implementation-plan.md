# Tablet and mobile implementation plan

**Status:** Phases 1–6 completed. Final results and limitations are recorded in the [Phase 6 acceptance register](validation/responsive-phase6/acceptance.md). This plan follows the [responsive audit](responsive-audit.md). Preserve the 1440px desktop captures as a regression baseline.

> **Current implementation note (2026-11-09):** This is the earlier implementation plan. Its proposed responsive selection sheet/drawer was not retained in the current UI. Step 1 and Step 2 use a fixed action footer on compact screens; Step 2 uses Imprint Details and Configure Products List/Preview views. Treat sheet-specific steps below as historical recommendations, not pending work.

## Architecture direction

Keep one React application, one selection/branding state model, and the current product and preview components. Treat tablet/mobile as layout variants. Use content-driven grid sizing for catalog cards and a shared structural breakpoint for the desktop rail versus persistent bottom action region. Below that transition, keep the action region fixed and scroll only the main workflow content. Open the existing selected-product list in one responsive sheet shell, with explicit Step 1 and Step 2 content/actions.

Do not copy the Figma frame tree into separate mobile markup. Keep the rows, removal callbacks, visibility state, active product and preview state shared. Add only the state needed for presentation and accessibility: sheet open/close, modal focus handling, and any explicit step-specific sheet action. Do not add independent product or branding state.

The two Figma reference widths are authoritative: 768px and 390px. At intermediate widths, choose transitions from the minimum useful widths of the catalog, rail, form, and preview. Phase 1 uses 1279px as the shared structural breakpoint: at 1280px the current 360px rail and two Step 2 panels still fit, while at 1024px they compress the workspace. The 1279/1280 transition is captured for review.

## Phased implementation

### Phase 1 — Responsive shell and layout constraints — completed

**Files:** `src/app/AppShell.module.css`, `src/styles/tokens.css`, `src/features/selection/Selection.module.css`, `src/features/selection/SelectedProductsSidebar.tsx`, `src/features/selection/SelectedProductsSidebar.module.css`, `src/features/branding/BrandReview.module.css`, `tests/selection.spec.ts`, and `docs/validation/responsive-audit/capture.mjs`.

**Changes:** use one 1279px structural transition; align tablet navigation with the compact Figma header; inset responsive progress using a shared 20px gutter; add a shared page-gutter token; fix the empty selection bar with an explicit data attribute; move the two-column catalog rule from a container-width query to a mobile viewport rule; add dynamic viewport sizing, safe-area padding, and 160px scroll clearance. Keep the desktop rail and 1440px behavior intact.

**References:** tablet Step 1 `487:2711`, `487:4074`; mobile Step 1 `482:1359`; tablet Step 2 `487:4848`; mobile Step 2 `483:4572`.

**Dependencies:** none. This is the layout foundation for the sheet and feature refinements.

**Validation:** TypeScript/Vite production build passed; all 50 Playwright tests passed. Browser captures and geometry were refreshed at 768×1140, 390×844, and 320/375/390/430/600/768/820/1024/1280/1920px. Focused shell/grid/empty-action overlays and 820/1024/1279/1280 transition screenshots are in [responsive audit captures](validation/responsive-audit/). Verified 3 columns at 768px, 2 at 390px, progress x=20 at both responsive references, no horizontal overflow at measured widths, and final catalog/preview content scrolls above the fixed action region. Desktop regression tests passed.

**Risk:** changing shared shell gutters can shift desktop or Step 2 panel alignment; container queries can create a second hidden breakpoint. Keep card minimum size explicit and test where each column count changes.

### Phase 2 — Shared selected-products bottom sheet — completed

**Files:** `src/features/selection/SelectionDrawer.tsx`, `SelectionDrawer.module.css`, `SelectionPanel.tsx`, `SelectedProductsSidebar.tsx`, `SelectedProductsList.tsx`, `SelectedProductRow.tsx`, plus the corresponding Step 2 caller in `BrandReview.tsx` and styles.

**Changes:** extend the existing drawer into the responsive bottom sheet; share the selected list and row markup; provide Step 1 empty/selected content and Step 2 active/status content; present the designed Back/Continue actions. Keep `onRemove`, `onClear`, `onSelect`, and navigation state connected to existing callbacks. Do not remove Clear All from desktop. The responsive sheet omits Clear All as shown in Figma; individual row removal remains available and the desktop action is preserved. The sheet also locks background scroll, prevents underlay interaction, traps and restores focus, supports Escape/backdrop dismissal, and provides safe-area padding.

**References:** tablet Step 1 `492:6328`, empty `492:6539`; tablet Step 2 `492:5999`; mobile Step 1 `483:4013`; mobile Step 2 `486:10713`.

**Dependencies:** Phase 1 establishes the fixed action region and shared layout state.

**Validation:** production TypeScript/Vite build passed; all 54 Playwright tests passed. Verified open/close from both steps; individual removal; active Step 2 switching; logo/text status; disabled/enabled Continue; empty state; Escape/backdrop behavior; focus restoration; list-only scrolling; and state persistence. Captured Figma comparisons at 768×1140 and 390×844 under `docs/validation/responsive-phase2/`.

**Risk:** the Step 2 drawer has active-product selection semantics absent from Step 1. Preserve the current `onSelect` behavior while avoiding accidental navigation when merely removing a row.

### Phase 3 — Deeper accessibility and viewport behavior — completed

**Files:** `src/features/selection/SelectionDrawer.tsx`, `SelectionDrawer.module.css`, `Selection.module.css`, `SelectedProductsList.module.css`, `src/features/branding/BrandReview.module.css`, and `tests/step1-workflow.spec.ts`.

**Changes:** announce selection-count updates from the sheet with a polite status; expand responsive row-removal and sheet-trigger hit areas to at least 44px without enlarging their visible icons; preserve workflow focus recovery when removing the last Step 2 product returns the app to Step 1. Keep the established dialog, focus trap, scroll lock, list-only scrolling, dismissal routes, safe-area padding, and decorative handle unchanged.

**References:** same drawer frames as Phase 2; Figma does not specify all these behaviors, so implement standard accessible dialog behavior only after confirming dismissal/gesture expectations.

**Dependencies:** Phase 2 sheet structure.

**Validation:** TypeScript check and Vite production build passed. All 56 Playwright tests passed, including drawer open/focus containment/Escape/backdrop/Back/focus restoration, removal and active selection in both steps, disabled Continue, background inertness and scroll locking, long-list scrolling, 44px hit areas, and removing the final Step 2 item. Browser emulation covered 320×568, 375×667, 390×844, 430×932, 600×800, 768×1140, 820×1180, 1024×768, and 1279×800; the Step 2 drawer was explicitly exercised at 390×844 and 768×1140. Resizing a 390px sheet to a short 320px height and a 844×390 landscape viewport kept its title and actions visible. Existing coverage confirmed fixed action bars do not cover final content and retained 1440px desktop regressions.

**Limitations and risk:** viewport changes and orientation were simulated in Chromium; no physical iOS/Android device, native Safari/Android browser, assistive technology, or real virtual keyboard was available. Safe-area behavior is implemented with CSS environment insets but is not device-verified. Treat those native browser checks as outstanding validation, not as completed evidence.

### Phase 4 — Step 1 catalog and selection refinement — completed

**Files:** `src/features/selection/Selection.module.css`, `ProductCard.tsx`, `SelectionPanel.tsx`, `SelectedProductsSidebar.tsx`, `SelectedProductsSidebar.module.css`, `tests/selection-responsive-fidelity.spec.ts`, and `docs/validation/responsive-phase4/capture.mjs`.

**Changes:** match the current tablet and mobile Step 1 references at 768px and 390px, including exact title/search/filter/category positions, chip dimensions, card dimensions, card padding, artwork bounds, title typography, selection indicators, and the fixed bottom action bar. At 390px the search is x=20/y=167/350×48, chips are y=225/34px high, and cards begin at y=313 with 170×170px geometry. At 768px the search is x=20/y=196/728×48, chips are y=254/48px high, and cards begin at y=356 at 236×215px in three columns. Keep search/filter and multi-select data flow unchanged. The mobile selected-products handle remains a 44px accessible trigger around its 50×5px visible mark, preserving the existing drawer behavior.

**References:** tablet Step 1 `487:2711`, `487:3688`, `487:4074`, `487:4459`; mobile Step 1 `482:1359`, `482:1744`, `482:2288`, `482:3368`.

**Dependencies:** Phase 1 grid and page geometry; Phase 2 action bar if selection presentation is being finalized.

**Validation:** TypeScript/Vite production build passed; all 58 Playwright tests passed. Added exact-geometry coverage for no selection, single, multiple, and filtered states at 768×1140 and 390×844; retained keyboard selection, removal, Clear All, and selection-state behavior. Refreshed 18 responsive screenshots and Figma side-by-side, overlay, and difference captures; checked width coverage at 320/375/430/600/820 and desktop 1440/1920. Artifacts are in [Phase 4 comparisons](validation/responsive-phase4/comparisons/) and [responsive captures](validation/responsive-phase4/).

**Risk:** the Figma mobile bar shows a short decorative handle without an explicit interaction. The prototype keeps a 44px invisible accessible button aligned to that mark to preserve access to the existing selected-products drawer; no swipe gesture was added.

**Remaining differences:** side-by-side exports show minor text and artwork rasterization differences. Geometry and interaction states match the measured references; at 320px the filter chips intentionally wrap to two rows to preserve readable labels and avoid horizontal overflow. Responsive behavior was validated in Chromium emulation, not on physical devices.

### Phase 5 — Step 2 form and live preview refinement — completed

**Files:** `src/features/branding/BrandReview.tsx`, `BrandReview.module.css`, `tests/responsive-step2-fidelity.spec.ts`, and `docs/validation/responsive-phase5/`.

**Changes:** corrected the responsive intro spacing, form padding, optional Logo label, upload guidance and success presentation, and the compact bold controls inside the text fields. The 1279px workflow breakpoint, shared form and preview components, validation rules, selected-products sheet, and per-product settings remain in place. The responsive preview uses a tablet artboard width of 86% and a centered full-width mobile artboard; logo and text still use the product's percentage placements on that artboard.

**Measured reference geometry at DPR 1:** at 768×1140, the blank and valid-logo form measures 728×631 at x=20/y=198, and the preview measures 728×694 at x=20/y=869. At 390×1505, the same form states measure 350×612 at x=20/y=182, and the preview measures 350×602 at x=20/y=834. The form-to-preview gap is 40px in both layouts. The mobile artboard measures 320×184.6px; the tablet artboard measures 555.5×320.5px. Product artwork retains its 693.333:400 aspect ratio, and the overlay bounds preserve their product-relative coordinates between widths.

**References:** tablet Step 2 `487:4848`, `487:5418`, `487:5596`, `489:5796`; mobile Step 2 `483:4572`, `485:5656`, `485:5911`, `485:6732`.

**Validation:** captured blank, valid-logo, text, and text-plus-logo states at 768px and 390px, plus 390×844 short-height viewport states. Captures include full-page and viewport images, geometry JSON, and component side-by-side/overlay comparisons in [Phase 5 validation](validation/responsive-phase5/). Checked horizontal overflow at 320, 375, 390, 430, 600, 768, 820, 1024, 1279, 1280, 1440, and 1920px. TypeScript check and production build passed; all 61 Playwright tests passed, including desktop Step 2 and Step 1 responsive regression coverage.

**Remaining differences:** the existing Bold controls stay visible as small buttons inside each text input to retain their behavior, though the Figma mobile screens omit them. Phase 6 removes the responsive “View selected products” text row and uses the existing accessible handle pattern. The tablet reference frame places much of the preview art beneath the fixed action area at the initial scroll position; full-page and final-scroll captures show the complete preview separately. Validation errors and expanded file checks can increase form height when needed to avoid clipping.

### Phase 6 — Final responsive acceptance — completed

**Files:** `src/features/branding/BrandReview.tsx`, `src/features/branding/BrandReview.module.css`, `src/features/selection/SelectedProductsSidebar.module.css`, `tests/responsive-step2-fidelity.spec.ts`, `tests/step1-workflow.spec.ts`, and `docs/validation/responsive-phase6/`.

**Changes:** replaced Step 2’s extra “View selected products” text row with the same centered, 44px keyboard/touch-accessible handle used by Step 1. Removed the redundant active-product label from the fixed action bar; active-product state remains visible in Live Preview and the sheet. Preserved the shared sheet, callbacks, selection and imprint state. Added regression checks for the handle semantics, Escape dismissal, focus restoration, action-area text removal, and full preview scroll clearance at tablet and mobile sizes.

**Validation:** `npm run build` passed, and `npm run test:e2e` passed all 63 tests (invoked through the installed `npm.cmd` path because PowerShell did not resolve bare `npm`). Responsive Step 2 overflow was measured at 320, 375, 390, 430, 600, 768, 820, 1024, 1279, 1280, 1440, and 1920px; Step 1 reference captures cover 768×1140 and 390×844, including empty, single, multiple, and filtered states. Refreshed Phase 4/5 comparison captures and captured current Step 1/2 sheet, action-bar, and final-scroll states at DPR 1 in [Phase 6 captures](validation/responsive-phase6/after/). Acceptance outcomes and the remaining UX decision are in the [acceptance register](validation/responsive-phase6/acceptance.md).

**Remaining differences and limits:** Bold formatting buttons remain visible in responsive text fields to preserve behavior, although the responsive Figma frames omit them. Chromium viewport emulation does not establish native Safari/Android behavior, physical safe-area rendering, virtual-keyboard interaction, or assistive-technology compatibility. See the acceptance register for the complete evidence boundary.

## Responsive interaction decisions

The handle opens the existing selected-products sheet. No swipe/drag gesture was added. Escape and backdrop dismissal, focus containment/restoration, list-only scrolling, and current Back/Continue/removal semantics remain covered by the automated workflow tests. The Bold controls are the one visual/UX decision still open; see the Phase 6 acceptance register.
