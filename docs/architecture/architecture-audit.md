# Architecture audit

**Audit date:** 2026-11-09  
**Scope:** original architecture audit; use the [Phase 5A final readiness report](final-readiness-report.md) and [system overview](system-overview.md) for the consolidated current state.

## Current stack and shape

The application uses React 19, TypeScript with strict checking, Vite 7, CSS Modules, CSS custom properties, and Playwright. Product data and assets are local; the prototype has no server integration, router package, UI kit, or external state-management package. The current design is feature-first: shared workflow/shell code sits under `src/app` and `src/components`, while landing, selection, and branding live under `src/features`.

The main flow is `LandingScreen` → product selection → imprint configuration/preview → completion. `App.tsx` owns hash-based screen selection and coordinates navigation. `WorkflowContext.tsx` owns the reducer-backed shared workflow state. The Step 1 screen stays mounted while inactive so its search/filter state survives navigation back from Step 2.

## State and business rules

`WorkflowContext.tsx` is the shared state boundary. Its state includes the current workflow step, selected product IDs, shared logo/text imprint content, per-product branding toggles, and preview active-product/expanded state. Reducer actions enforce selection and configuration transitions. The URL hash is a navigation input/output, but workflow content is not persisted across reloads.

`workflowValidation.ts` centralizes whether selected products meet the continue requirement. `imprintCapabilities.ts` supplies per-product logo/text capability data. The reducer and the Step 2 UI both derive some capability-dependent enabled/disabled states. Keep the reducer as the final authority; consolidate UI derivation only after tests prove the same rule is being implemented in more than one place.

Logo validation is local in `logoValidation.ts`; it checks supported file characteristics and prepares a preview URL. The prototype has no print-service or server validation, so client validation and a successful preview do not prove print readiness.

## Confirmed architecture observations

- The feature-first layout already maps well to the product workflow. Avoid replacing it with generic page/component layers without a concrete reuse need.
- The original audit's `BrandReview.tsx` extraction candidate was completed through Phases 4A–4H. `BrandReview` now coordinates state/upload lifecycle and selects `DesktopStep2` or `ResponsiveStep2`; child compositions and preview/form components own their presentation.
- The shared selected-products sidebar/list/row and responsive action footer are already reused across steps. Preserve those shared components.
- `WorkflowContext` exposes a `continueSelection` callback and a `continue` reducer action that appear unused by runtime consumers. Step 1's similarly named prop is wired to `App` hash navigation instead. Confirm whether the legacy `selection-ready` transition is externally relied on before removing it.
- `backToProducts` is used by app navigation and is not dead code.
- `SelectionReady.tsx` is presented at the completion route, so its name does not clearly describe its role. Rename only in a separate compatibility-tested batch.
- Current worktree has 106 preexisting status entries on `master` at `b0181a9`; these make refactor attribution and rollback difficult. Do not clean or overwrite those changes as part of this audit.

## Quality and risk posture

Phase 5A re-ran TypeScript, production build, and all 99 Playwright tests successfully. That is evidence for the current checkout, not proof that every responsive rendering matches every Figma frame or native Safari behavior; see [the final report](final-readiness-report.md).

The principal design risk is broad token/CSS migration causing subtle visual drift across desktop, tablet, mobile Safari, and the responsive selected-products sheet. The principal behavior risk is changing routing/reducer semantics while improving names or splitting `BrandReview`. Sequence work so one boundary changes at a time and use existing interaction and screenshot checks.

## Audit references

The more detailed component, token, CSS, naming, and staged proposals live in the neighboring audit documents. Historical behavior/design requirements remain in the existing `docs/` references linked from [the index](README.md).
