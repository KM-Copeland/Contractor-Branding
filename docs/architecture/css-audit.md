# CSS architecture audit

## Current structure

The application uses `src/styles/global.css` and `tokens.css`, plus feature/component CSS Modules. Styles mostly follow the same feature boundaries as their TSX files. The responsive contract has approved breakpoints around 767/768px and 1279/1280px, with additional breakpoints for particular constraints, including the selected row, landing content, and preview height. Treat those as observed behavior, not arbitrary cleanup targets.

Responsive behavior is more than width changes: below the desktop breakpoint, Step 1 hides the selected-products rail and uses the fixed action footer; Step 2 presents imprint details and Configure Products views, with List/Preview tabs inside Configure Products. Neither responsive screen currently renders a selected-products drawer or draggable sheet. The action footer accounts for safe areas, dynamic viewport height has a fallback, carousel gestures preserve vertical scrolling, and reduced-motion preferences affect progress motion. Keep these requirements attached to the component that owns the behavior.

## Main issues to address later

- Many repeated raw colors, border styles, and spacing values bypass shared tokens.
- `BrandReview.module.css` is a large cross-mode stylesheet with desktop and responsive rules for several components. Its size reflects two substantially different layouts, but it makes ownership and cascade review harder.
- The CSS module naming is generally scoped, but names such as `active`, `inactive`, `row`, and `panel` are broad and can be difficult to read when composed across nested modules.
- A single `!important` rule on the inactive Step 1 wrapper enforces hidden/pointer behavior while the screen stays mounted to preserve filters. Do not delete it until visibility, accessibility tree, focus, and state-preservation behavior are tested together.
- Inline styles are used for dynamic preview placement; they should remain for state-derived geometry, while stable presentation belongs in CSS.

## Refactoring guardrails

- Consolidate declarations inside the affected module; do not append override tails.
- Change one feature or shared component at a time.
- Preserve all current breakpoints and safe-area/dynamic-viewport fallbacks unless a measured defect requires a change.
- Compare desktop, tablet, and mobile captures at fixed viewport and DPR; include mobile Safari checks for editable input sizing and fixed-footer behavior.
- Use computed-style and bounding-box assertions for layout contracts, then use screenshots for visual relationships. Neither replaces the other.

## Phase 2A: Selection and shared sidebar findings

The Selection stylesheet is consumed by `StepOneScreen`, `ProductCard`, `SelectionPanel`, and `SelectionReady`. It owns the Step 1 catalog, cards, responsive layout, search-empty state, and the empty-selection markup rendered by `SelectionPanel`. The live empty-state JSX uses `styles.emptyState`, `styles.emptyIcon`, and `styles.emptyCopy` from this module.

`SelectedProductsSidebar.module.css` is imported by `SelectedProductsSidebar.tsx` and owns the shared rail shell, mode positioning, header, and footer. The sidebar accepts its empty-state content as a `ReactNode`; its same-named `.emptyState`, `.emptyIcon`, and `.emptyCopy` selectors had no corresponding class references in that component or any runtime path. They duplicated the live Selection styles and were removed. All five selectors from the orphaned block were confirmed absent from runtime references; no sidebar JSX relied on them.

One additional selector, `.actionRow > button:last-child img` in the Selection module, had no matching generated class in `SelectionPanel`: the JSX queried `styles.actionRow`, which the CSS Module did not define. The rule was inside the responsive range where the desktop sidebar is hidden and the separate `ResponsiveActionFooter` renders the controls. It had no computed effect and was removed. Phase 2B also removed this stale JSX lookup. The wrapper's active layout remains owned by the sidebar footer's `[data-sidebar-action-row]` rule, and the same attribute remains the selector for keyboard focus restoration after product removal. Step 2 retains its separate, valid `styles.actionRow` class.

No other Selection or sidebar declarations were removed. The `.inactive` visibility/pointer rules, container query, focus-visible selector, and breakpoint rules remain because they support mounted workflow state, accessibility, or responsive behavior. The row/group module and reusable controls module keep their existing boundaries. The undefined Step 1 `styles.actionRow` lookup is resolved; see the [Phase 2B record](phase2b-sidebar-action-row-record.md).

## Phase 2C: Step 2 ownership audit

The Step 2 CSS ownership, desktop/responsive cascade, live class states, orphan candidates, and staged Phase 2D recommendations are documented in the [Phase 2C audit](phase2c-step2-css-ownership-audit.md). Phase 2C made no runtime changes; its validation and viewport evidence are recorded there.

## Phase 2D: verified Step 2 cleanup

Removed four runtime-unreferenced selectors and the duplicate responsive `.actions` values from `BrandReview.module.css`. All 91 Playwright tests pass; computed styles and geometry match across the requested viewports. The screenshot comparison found small repeatable cold-render raster differences in warning text and one product thumbnail, documented with bounds and without relaxing the pixel threshold in the [Phase 2D record](phase2d-step2-css-cleanup-record.md). Undefined `mainExpanded` and `mainHasImprint` lookups remain deferred.

## Phase 4E: shared preview artwork ownership

The shared preview artwork rules now live in `PreviewArtwork.module.css`, imported by desktop `ProductPreviewPanel` and responsive `ProductPreviewCarousel`. It owns only `.productArt`, `.brandLogo`, and `.brandText`. Desktop `.artboard` remains in `ProductPreviewPanel.module.css`; responsive `.mobileArtboard` and carousel sizing remained in `BrandReview.module.css` through Phase 4E. The declarations and values did not change, and container-relative text sizing remains anchored to each existing artboard. See the [Phase 4E record](phase4e-shared-preview-artwork-css-record.md) for its comparisons and validation.

## Phase 4F: responsive carousel CSS ownership

The responsive carousel's intrinsic presentation now lives in `ProductPreviewCarousel.module.css`: track and slide layout, viewport interaction styling, artboard and stationary summary presentation, pagination, tablet sizing, and reduced-motion transitions. `BrandReview.module.css` retains only the `.previewMode`-dependent flex, height, container-query, and footer relationships because they depend on the screen composition around the carousel. `ProductPreviewCarousel.tsx` applies both modules' classes to the constrained nodes; no markup, state, product logic, or gesture behavior changed. Shared artwork remains in `PreviewArtwork.module.css`. See the [Phase 4F record](phase4f-responsive-carousel-css-ownership-record.md) for measurements and validation.

## Phase 4H: imprint component CSS ownership

`ImprintTextFields.module.css`, `LogoValidationMessage.module.css`, and `ImprintForm.module.css` now own their components' internal presentation. `BrandReview.module.css` retains shared form layout and utilities, including `.fieldGroup`, `.textGroup`, `.hiddenInput`, and `.validationProgress`. CSS values, DOM structure, and behavior are unchanged. See the [Phase 4H record](phase4h-imprint-css-ownership-record.md) for the migrated selectors, responsive invariants, source-size impact, and comparison evidence.
