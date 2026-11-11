# Phase 4G — Step 2 screen composition extraction

**Outcome:** Step 2 now has independent desktop and responsive screen-composition components. `BrandReview` remains the integration point for workflow state, shared upload handling, derived product data, responsive view state, and screen selection. This is a behavior-preserving React ownership change; styles and rendered output remain unchanged.

## Boundaries and data flow

Before this phase, `BrandReview.tsx` contained workflow integration and both screen compositions. It now derives the selected products, active product, active branding configuration, imprint readiness, and breakpoint state; validates and owns logo upload/removal; owns responsive Imprint/Configure and List/Preview state; and passes explicit values and callbacks to the selected screen.

`DesktopStep2.tsx` owns the desktop screen assembly: heading, imprint form, live preview, selected-products rail, and Back/Continue row. Its `DesktopStep2Props` extends the shared `Step2PresentationProps` with the active index and product-removal callback.

`ResponsiveStep2.tsx` owns the responsive imprint/configure assembly, List/Preview tabs, fixed action footer, and existing scroll/progress effects. Its `ResponsiveStep2Props` extends the shared contract with view/mode values, their setters, and responsive progress reporting. The view and mode state remain in `BrandReview`, so switching between responsive and desktop retains the prior mount behavior.

`step2Presentation.ts` defines the shared presentation dependencies and the single `defaultBrandingConfiguration` value. It does not create a state layer. Both screen components consume explicit props and do not import `BrandReview` or `WorkflowContext`.

The responsive scroll effect retains `responsiveMainRef`, `listScrollPosition`, List-to-Preview `window.scrollY` capture, the same animation-frame schedule, reset/restore conditions, `window.scrollTo`, and cancellation cleanup. Progress still reports 35 for Imprint and 60 for Configure, with the same dependency list and cleanup reset. The parent retains its existing `(max-width: 1279px)` listener and breakpoint.

## Styling and markup

All 17 CSS files present at the protected checkpoint remain byte-identical; no CSS files were added. Both compositions continue to import `BrandReview.module.css`. The existing undefined `mainExpanded` and `mainHasImprint` class lookups remain unchanged. The extracted elements retain their existing hierarchy, IDs, data attributes, ARIA relationships, test IDs, inline icon masks, and child component mounting conditions.

## Visual verification

The deterministic capture harnesses use Chromium at 100% zoom, device scale factor 1, and reduced motion. Responsive coverage includes 320×568, 375×667, 390×844, 414×896, 767×800, 768×1140, 1024×768, and 1279×800; desktop coverage includes 1280×900, 1440×900, and 1920×1080.

- Responsive: all 79 before/after states matched in semantic DOM, measured geometry, and screenshot pixels. The 1279px→1280px→1279px populated-imprint transition was checked once and retained the expected form and progress state.
- Desktop: all 15 before/after preview states matched in semantic DOM, measured geometry, and screenshot pixels. Those states use four selected products, shared text, logo upload, and previous/next navigation.
- Repeat captures: all 15 desktop states matched on the first repeat. The first responsive repeat had one 12-pixel raster difference in the upload-warning text at 414×896, with identical DOM and geometry; a second repeat matched all 79 after images exactly. No comparison threshold was relaxed.

Evidence is in [responsive captures](evidence/phase4g/responsive/) and [desktop captures](evidence/phase4g/desktop/). Each `after/comparisons.json` lists DOM, geometry, and pixel equality for every corresponding baseline image.

## Validation

- Substep A: TypeScript check and production build passed; 22 focused desktop/workflow tests passed before starting Substep B.
- Substep B: TypeScript check and production build passed; 46 focused responsive/workflow tests passed.
- Full Playwright suite: 99 passed.
- `git diff --check`: passed; Git reported only its existing LF-to-CRLF working-copy notices.
- Historical files under `docs/validation/` rewritten by Playwright were restored from the protected Phase 4G checkpoint. Pre-existing tracked and untracked work was preserved; no staging, commit, stash, reset, cleanup, or discard operation was used.

## Source-size impact

`BrandReview.tsx` decreased from 15,470 bytes / 245 lines to 4,413 bytes / 90 lines. The extracted `DesktopStep2.tsx` is 2,483 bytes / 37 lines, `ResponsiveStep2.tsx` is 8,248 bytes / 119 lines, and `step2Presentation.ts` is 1,447 bytes / 40 lines. Together, these files add 1,121 bytes and 41 lines compared with the former parent file, reflecting the extra module imports and explicit prop contracts.

## Remaining opportunities

The screen compositions now have clear React ownership. The shared `BrandReview.module.css` still owns both composition layouts, as required for this phase. A later, separately scoped phase could assess CSS ownership only after establishing its own protected baseline; Phase 4G does not begin that work.
