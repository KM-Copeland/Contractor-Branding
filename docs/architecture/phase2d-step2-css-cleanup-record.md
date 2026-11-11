# Phase 2D: Verified Step 2 CSS cleanup

**Date:** 2026-11-09  
**Scope:** Remove four confirmed orphan selectors and duplicate responsive declarations from `BrandReview.module.css`. No component, state, validation, breakpoint, or test code changed.

## Changes

Removed the unused `.fileInfo`, `.success`, `.pending`, and `.error` selectors after checking all runtime source for direct and computed CSS Module references. They have no JSX consumers, prop-composed class names, or dynamic lookup paths. The active `.validation*` family is separate: `LogoValidationMessage` constructs `validationSuccess`, `validationWarning`, or `validationError` through a computed CSS Module key, and `.validationProgress` remains used by both upload forms. All validation declarations are unchanged.

Removed the max-1279px `.actions` redeclaration for `gap: 0` and `margin-top: 0`; the desktop base `.actions` rule already sets those same values. Its display, direction, padding, and the `.actionRow` styling remain unchanged. No desktop action wrapper exists in the stable responsive composition, and the separate responsive footer is untouched.

No other selector or declaration was removed. In particular `.expanded`, `.stageExpanded`, responsive overrides, `.responsiveIntro`, and both label selectors remain unchanged. Undefined `styles.mainExpanded` and `styles.mainHasImprint` references remain deferred.

## Undefined class follow-up

Repository history locates both JSX lookups in commit `9bb659e` (“Checkpoint before Step 2 redesign”). The CSS at that commit already had `.layout.expanded` and `.previewStage.stageExpanded`, but no `.mainExpanded` or `.mainHasImprint` declarations. Current CSS still has those equivalent state modifiers on the layout and preview stage; neither undefined main-level token has a matching selector or evidenced visual behavior. The current product UI has no expanded-preview control, `setPreviewExpanded` has no application call site beyond the workflow context, and Step 2 tests assert the absence of an expand button. Existing design/source material does not establish a requirement for either main-level modifier. Removing them could affect a future behavior only if one is later added; it would not remove current expanded layout styling. Per Phase 2D scope, this batch leaves both lookups and the unreachable expanded state untouched. Revisit them only after confirming whether that future preview state remains a product requirement.

## File and size record

Runtime source change: [BrandReview.module.css](../../src/features/branding/BrandReview.module.css). Its pre-cleanup working-tree copy was 20,404 bytes and 320 lines; the resulting file is 20,046 bytes and 315 lines, a reduction of 358 bytes and 5 lines. The other added deliverables are this record, the Step 2 capture helper, and its evidence under `docs/architecture/evidence/phase2d/`.

No test source was added or edited. The capture helper uses Chromium at DPR 1, reduced motion, settled fonts and decoded images, the seven requested viewports, deterministic products and upload fixtures. It captures empty imprint, successful upload with text/bold, warning, error, responsive List/unconfigured and configured states, and responsive Preview. The full-page images and computed-style snapshots are in the [before captures](evidence/phase2d/before/metadata.json) and [after captures](evidence/phase2d/after/metadata.json).

## Verification

- Before-change full Playwright baseline: 91 passed.
- After-change full Playwright suite: 91 passed.
- TypeScript `tsc --noEmit`: passed.
- Production Vite build: passed.
- Computed styles and geometry across 40 paired captures: zero differences after ignoring regenerated CSS Module class hashes. This includes form panels, upload/file states, validation, text and Bold controls, preview, responsive configuration, carousel, desktop actions, and responsive footer.
- Exact PNG pixel comparison: 35 of 40 before/after captures were pixel-identical. The five remaining captures differed only in a 50px warning-text region at 390px (50 pixels) and a 48×40 raster-thumbnail region at 1440px (263 pixels in each of four states). A second capture with the same unchanged application reproduced these small differences in those same regions. The computed CSS and geometry stayed identical, which points to Chromium text/image rasterization variance between cold captures rather than a layout or style change. The pixel comparison threshold was not relaxed; exact cross-run pixel identity remains unverified for those regions.
- `git diff --check`: passed.

The discrepancy matters for screenshot-baseline policy: a pixel threshold should not be loosened to hide it. If strict cross-run pixel identity is required, capture both stylesheet states in one browser process or stabilize the Chromium raster environment before using the images as a pixel-perfect gate. The existing screenshots remain useful visual evidence; inspect the recorded difference bounds in [the comparison report](evidence/phase2d/after/screenshot-comparisons.json).

## Remaining ownership concern

`BrandReview.module.css` still combines desktop and responsive Step 2 composition rules. This cleanup does not change that boundary. Any later extraction should first settle the undefined main-level modifiers, then move CSS with its actual React owner and repeat the viewport comparison. See the [Phase 2C audit](phase2c-step2-css-ownership-audit.md) for the selector map and staged recommendations.
