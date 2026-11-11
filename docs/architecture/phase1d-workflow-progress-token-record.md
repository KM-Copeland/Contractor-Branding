# Phase 1D: Workflow Progress semantic token migration

**Date:** 2026-11-09  
**Scope:** replace progress-specific color literals with semantic tokens. No stage logic, accessibility, animation timing, dimensions, responsive geometry, or shell styling changed.

## Protected state and changes

The pre-edit working tree was copied to:

`C:\Users\welau\.codex\visualizations\2026\10\08\01a11c5d-9825-7c83-8a1d-72a5d2451728\phase1d-protected-before-workflow-progress-token-migration-2026-11-09`

The checkpoint includes all tracked and untracked working files plus the full Git status captured before Phase 1D edits. No files were staged or committed.

Three tokens were added in `src/styles/tokens.css`:

- `--color-progress-track: #dee4ed` for the unfilled progress track.
- `--color-progress-fill: #3155a4` for completed progress.
- `--color-progress-track-breathe: #e7e9ed` for the breathing animation midpoint.

The track token is independent of the same-valued border token because track and border are distinct roles. `src/components/WorkflowProgress.module.css` now uses the tokens for the default track, fill, animation start/end, and animation midpoint. No other runtime source file changed.

## Behavior and accessibility preserved

The progress component's React code is unchanged. Stage and optional numeric progress calculations, responsive percentages, readiness handling, and ARIA progressbar reporting remain in place.

The fill still transitions its width over 420ms with `cubic-bezier(.4,0,.2,1)`. The track still breathes over four seconds with ease-in-out timing and infinite repetition until completion. The completed stage stops breathing. The existing reduced-motion rule still disables the fill transition and track animation.

## Before/after visual and motion evidence

The [capture utility](capture-phase1d-workflow-progress.mjs) recorded Step 1, Step 2, and completed progress at 390×844, 768×1140, 1279×800, 1280×900, 1440×900, and 1920×1080 with Chromium, DPR 1, default 100% zoom, and reduced motion enabled.

The [before metadata](evidence/phase1d/before/metadata.json) and [after metadata](evidence/phase1d/after/metadata.json) record progress styles, ARIA values, track/fill dimensions, and positions. The [computed-style comparison](evidence/phase1d/after/computed-style-differences.json) reports zero differences. All 18 screenshot pairs are pixel-identical; see the [pixel comparison results](evidence/phase1d/after/screenshot-comparisons.json).

The new [focused progress token contract](../../tests/workflow-progress-token-contract.spec.ts) verifies the six responsive heights, stage and completed ARIA values, exact token resolutions and keyframe colors, animation duration/easing/repetition, sampled start and midpoint colors, fill progression in both directions, and reduced-motion behavior. Existing progress tests also cover layout alignment and responsive dimensions.

## Validation

- Focused progress token contract: 2/2 passed.
- TypeScript check (`tsc --noEmit`): passed.
- Production build (`vite build`): passed (63 modules transformed).
- Full Playwright suite: passed (90/90).
- `git diff --check`: passed; Git emitted only existing LF-to-CRLF notices.

Validation uses the local Node, TypeScript, Vite, and Playwright executables because this shell cannot resolve `npm`. The full suite regenerated older files under `docs/validation`; those were restored from the protected checkpoint. A checkpoint comparison confirmed no unintended file changes outside the Phase 1D migration and evidence paths.

## Next architectural improvement

Before another token migration, review repeated raw colors for stable semantic meaning and identify a small testable consumer. Do not start a broad token or CSS ownership refactor from this record.
