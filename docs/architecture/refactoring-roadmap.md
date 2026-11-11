# Architecture modernization status

## Closeout

**Status: Complete — Initial Component Library & Design System Foundation.**

| Phase | Status | Outcome |
| --- | --- | --- |
| 0 — Protected baseline | Complete | Existing working tree was inventoried and protected before implementation work. |
| 1 — Semantic tokens | Complete | Semantic aliases and scoped migrations for shared controls, responsive footer, selected products and workflow progress. |
| 2 — CSS ownership | Complete | Selection/sidebar cleanup, action-row contract correction, Step 2 cascade audit and verified cleanup. |
| 3A — Workflow domain | Complete | Reducer, initial state/action contract and pure completion validation moved to `src/domain/workflow`; app adapter remains small. |
| 4A–4H — Branding decomposition | Complete | Imprint controls, upload feedback, desktop preview, responsive carousel, shared art, screen composition and component CSS ownership extracted without changing the workflow model. |
| 5A — Final readiness | Complete | Current architecture, component contracts, token coverage, compatibility findings and developer workflow documented. |
| 5B — Final cleanup | Complete | Removed undefined desktop class lookups, renamed the completion component, corrected the font-test note, verified preservation and closed this architecture initiative. |

Phase evidence remains in the linked [implementation records](README.md#historical-records-and-evidence). The checkout contained pre-existing tracked and untracked work; do not infer authorship from Git status relative to an older commit.

## Deferred concerns

There is no architecture refactoring batch queued. Keep these product/platform decisions bounded and separate:

- Legacy `continueSelection`, reducer `continue`, the `selection-ready` state, and `#selection-ready` route compatibility remain intact until compatibility requirements are decided.
- The historical intermittent Aileron assertion has no confirmed cause; `tests/selection.spec.ts` already awaits `document.fonts.ready`.
- Physical iOS Safari and screen-reader/manual accessibility checks remain outside Chromium evidence.
- Continue semantic token adoption only when multiple consumers have a demonstrably shared visual role.
- Define backend, persistence, submission, print approval and order/history requirements only if product scope advances beyond this prototype.

These deferred concerns do not block continued prototype development and do not reopen the architecture initiative. See the [Phase 5B closeout record](phase5b-final-cleanup-record.md) and [final readiness report](final-readiness-report.md) for evidence and limitations.

## Worktree preservation

The pre-existing checkout contained substantial tracked and untracked changes. Phase 5B recorded a protected checkpoint, edited only its scoped runtime files and architecture documents, and restored test-generated validation output where it changed. No unrelated work was staged, committed, reset, stashed, cleaned, or discarded.
