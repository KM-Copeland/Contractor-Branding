# Baseline validation

**Captured:** 2026-11-09  
**Checkout:** `master` at `b0181a9`. The earlier architecture review recorded 106 entries; Phase 0 re-inventoried the tree before token edits and found 141 existing entries (69 modified, 72 untracked, none staged). See the [protected snapshot record](phase1-implementation-record.md).  
**Scope:** read-only application audit; no application files were changed.

## Checks

| Check | Result |
| --- | --- |
| TypeScript (`tsc --noEmit`) | Passed |
| Vite production build | Passed; 63 modules transformed |
| Protected baseline Playwright suite | Passed; 81 tests across 12 spec files |
| Post-migration Playwright suite | Passed; 85 tests across 13 spec files, including four controls-token checks |
| Phase 1B footer migration suite | Passed; 86 tests, including responsive action-footer token coverage |

The protected baseline TypeScript check, production build, and all 81 Playwright tests pass. After the migration, TypeScript, the production build, and all 85 tests also pass. Playwright refreshed existing validation images during the run; those artifacts were restored from the protected snapshot so this task leaves them unchanged. New Phase 1 evidence is kept under `docs/architecture/evidence/`. Treat results as evidence for this checkout, not as a clean-commit comparison.

The Phase 1B footer-only migration also passed TypeScript, production build, and all 86 Playwright tests. Its six-viewport before/after captures and screenshot hashes are documented in the [Phase 1B record](phase1b-footer-token-record.md); existing validation images refreshed by the suite were restored from the pre-migration checkpoint.

## Representative visual evidence

The repository already contains extensive screenshots and comparisons. These paths are links to the current validation archive; some were captured during earlier visual-fidelity work, so their original capture context is documented alongside the files. They are representative references, not all newly captured for this architecture audit.

The fresh Phase 1 baseline was captured immediately before the token migration in Chromium 156.0.8078.4, DPR 1, default 100% Playwright zoom, and reduced-motion mode. Fonts and visible images were awaited and their readiness counts are recorded per screenshot in [baseline metadata](evidence/before/metadata.json). Captures cover Step 1 selection and desktop rail, Step 2 Imprint Details, Configure Products List and Preview on compact screens, and the combined desktop Step 2 workspace. The fixed responsive action footer is visible in the compact captures.

- [390×844 Step 1](evidence/before/mobile-390x844-step1-selection.png), [Imprint Details](evidence/before/mobile-390x844-step2-imprint-details.png), [Configure Products List](evidence/before/mobile-390x844-step2-configure-list.png), [Configure Products Preview](evidence/before/mobile-390x844-step2-configure-preview.png).
- [768×1140 Step 1](evidence/before/tablet-768x1140-step1-selection.png), [Imprint Details](evidence/before/tablet-768x1140-step2-imprint-details.png), [Configure Products List](evidence/before/tablet-768x1140-step2-configure-list.png), [Configure Products Preview](evidence/before/tablet-768x1140-step2-configure-preview.png).
- [1280×900 Step 1 and selected-products rail](evidence/before/desktop-1280x900-step1-selection.png), [desktop Step 2](evidence/before/desktop-1280x900-step2-desktop-workspace.png).
- [1920×1080 Step 1 and selected-products rail](evidence/before/wide-1920x1080-step1-selection.png), [desktop Step 2](evidence/before/wide-1920x1080-step2-desktop-workspace.png).

Focused computed styles for disabled/enabled primary action, Back, active filter, search, hover, and focus-visible states are also saved in metadata. Run the capture utility documented in the Phase 1 implementation record to create a matching `after` set and automatically compare these computed values.

- Step 1 desktop states at 1280: [no selection](../validation/phase2/no-selection-1280.png), [single selection](../validation/phase2/single-selection-1280.png), [multiple selection](../validation/phase2/multiple-selection-1280.png).
- Step 2 desktop: [no imprint](../validation/phase3/step2-no-imprint-collapsed-1280.png), [populated](../validation/phase3/step2-populated-collapsed-1280.png), [active product](../validation/phase3/step2-active-collapsed-1280.png).
- Responsive Step 1: [mobile](../validation/responsive-audit/browser/mobile-step1-none.png), [tablet](../validation/responsive-audit/browser/tablet-step1-none.png), [1440 desktop](../validation/responsive-audit/browser/desktop-1440-step1.png).
- Responsive Step 2: [mobile](../validation/responsive-audit/browser/mobile-step2-none.png), [tablet](../validation/responsive-audit/browser/tablet-step2-none.png), [1440 desktop](../validation/responsive-audit/browser/desktop-1440-step2.png).
- Step 2 responsive redesign: [configure products](../validation/step2-redesign/browser/03-configure-products.png), [product preview](../validation/step2-redesign/browser/04-product-preview.png).

Before future visual comparisons, hold viewport dimensions, device scale factor, browser zoom, route, selected product IDs, active product, imprint text/logo state, fonts, and image readiness constant. Use geometry assertions for precise alignment and screenshots for overall visual relationships.

## Integrity note

The working tree already contains many modified and untracked files. This audit did not reset, stage, stash, clean, or otherwise rewrite them. New files are limited to `docs/architecture/`.
