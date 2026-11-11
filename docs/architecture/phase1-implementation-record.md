# Phase 0/1 implementation record

**Date:** 2026-11-09  
**Scope:** protect the existing checkout, reconcile stale responsive documentation, add semantic aliases, and migrate exactly one shared CSS Module. No JSX, workflow, routing, data, or component architecture changes were made.

## Phase 0: protected state

At the protected snapshot, the checkout was `master` at `b0181a9`, with 141 existing status entries: 69 modified tracked files, 72 untracked files, and no staged changes. The earlier architecture audit counted 106 entries before the later browser evidence updates; the current inventory supersedes that earlier count.

A separate recovery copy was created before any Phase 1 source edits at:

`C:\Users\welau\.codex\visualizations\2026\10\08\01a11c5d-9825-7c83-8a1d-72a5d2451728\phase0-protected-baseline-2026-11-09`

It contains a copy of the working tree, including tracked modifications and untracked files, plus the full porcelain Git status and a binary patch from `HEAD`. No changes were staged or committed. The copy excludes only `.git`, `node_modules`, `dist`, `test-results`, and `playwright-report`; Git history and generated/dependency directories remain in the original checkout and can be recreated. The snapshot is approximately 125 MB. The full project files and patch preserve the contents; Git index state was unstaged at the time of capture.

## Documentation reconciliation

Current code and tests confirm there is no responsive selected-products drawer or draggable sheet. Compact Step 1 hides the desktop rail and uses the fixed responsive action footer. Compact Step 2 has Imprint Details and Configure Products views; Configure Products has List and Preview tabs, with the same fixed footer. Desktop retains the selected-products rail.

I updated current architecture guidance and added clear historical notes to older responsive audit, implementation, and validation documents. Old sheet screenshots and names remain intact as historical Figma evidence; the code and UX were not changed to restore them.

## Token migration summary

The runtime token source remains `src/styles/tokens.css`. These semantic aliases reference the existing values rather than duplicating them:

| Token | Alias | Resolved value | Purpose |
| --- | --- | --- | --- |
| `--color-action-primary` | `var(--color-primary)` | `#0c30cc` | Primary action and interactive accent |
| `--color-text-primary` | `var(--color-text)` | `#2a2a26` | Main text and control foreground |
| `--color-surface-default` | `var(--color-white)` | `#fff` | Default white control surface |
| `--color-border-control` | `var(--color-cool-grey)` | `#c4ced1` | Base control border |
| `--color-border-strong` | `var(--color-text-primary)` | `#2a2a26` | Strong Back control outline |
| `--color-focus-indicator` | `var(--color-action-primary)` | `#0c30cc` | Keyboard focus indicator |

Only `src/components/Controls.module.css` was migrated. It now uses these aliases for the primary button, Back button, filter pill, and search control: action/surface colors, strong border, base control border, hover and focus colors, and text color. Existing disabled colors, selected-pill fill, focus geometry, typography, spacing, dimensions, radius, and interaction rules remain as they were. `WorkflowProgress.module.css` and `BrandReview.module.css` were not modified.

## Before/after evidence

The repeatable capture utility is [capture-phase1-baseline.mjs](capture-phase1-baseline.mjs). Run it with a local Vite server at `127.0.0.1:5173`, first with `before` and then with `after`. The `after` run compares all captured control computed styles and SHA-256 hashes of the screenshots; it exits with an error if either comparison changes.

Both capture sets used Chromium 156.0.8078.4, 100% default browser zoom, DPR 1, `prefers-reduced-motion: reduce`, and fixed viewport dimensions: 390×844, 768×1140, 1280×900, and 1920×1080. Each metadata record contains route, selected products, shared imprint, per-product settings, font readiness, visible-image readiness, and browser conditions. Fonts and visible images were awaited before each screenshot.

Result: **zero computed-style differences** across disabled/enabled buttons, Back default/hover/focus-visible, active filter, search default/focus, at all four viewports. **All 12 before/after screenshots have identical SHA-256 hashes.** Compare [computed style differences](evidence/after/computed-style-differences.json), [screenshot hashes](evidence/after/screenshot-comparisons.json), and the [before](evidence/before/metadata.json) / [after](evidence/after/metadata.json) metadata.

## Validation

- Protected baseline TypeScript check: passed.
- Protected baseline production build: passed.
- Protected baseline full Playwright suite: 81/81 passed before adding the focused contract spec.
- Focused shared-controls contract tests: 4/4 passed at 390, 768, 1280, and 1920px.
- Post-migration TypeScript check: passed. Production build: passed; Vite transformed 63 modules.
- Post-migration Playwright suite: 85/85 passed, including the four new shared-controls cases.
- `git diff --check`: passed with no whitespace errors. Git emitted only its existing LF-to-CRLF conversion notices.
- The shell did not resolve `npm`, and the task-local npm CLI was unavailable. I ran the same build sequence directly (`tsc --noEmit` then `vite build`) and invoked the Playwright CLI used by `test:e2e`.
- The only runtime source edits are the two CSS files listed above; the added Playwright spec verifies alias resolution and rendered control states.

The final “before” capture was regenerated from the protected pre-edit CSS, then the migrated CSS was restored before the “after” capture. The final comparison again reports zero computed-style differences and 12/12 pixel-identical screenshots.

## Next migration candidates at Phase 1 completion

The footer candidate was migrated in the follow-up [Phase 1B record](phase1b-footer-token-record.md). The next recommended candidate is `src/features/selection/SelectedProductsList.module.css`, followed by `src/components/WorkflowProgress.module.css`; both need dedicated selected-state or animation comparisons.

Do not treat these candidates as authorization for broader CSS cleanup.
