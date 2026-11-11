# Phase 3A: workflow domain core extraction

**Date:** 2026-11-09  
**Scope:** Move the existing workflow reducer, action definitions, initial state, and validation into a React-independent domain directory. Routing, state shape, presentation, and feature APIs were preserved.

## Previous architecture

`WorkflowContext.tsx` owned provider setup and callbacks, but also contained the complete reducer, its private action union, and initial state. The pure configuration rules lived in `app/workflowValidation.ts`. `App.tsx` and Step 2 features imported the context compatibility function and app-level validation directly.

## New architecture

- `src/domain/workflow/workflowReducer.ts` owns `workflowReducer`, `WorkflowAction`, and `initialWorkflowState`.
- `src/domain/workflow/workflowValidation.ts` owns `isProductConfigured` and `areAllSelectedProductsConfigured`; these remain the single readiness implementation.
- `src/app/WorkflowContext.tsx` now owns Context, `useReducer`, stable dispatch callbacks, provider composition, and `useWorkflow`. It consumes the domain reducer and initial state.
- `src/app/workflowValidation.ts` re-exports the domain validators for existing feature imports.

The dependency direction is domain to shared types and static data: the reducer reads the existing product catalog and capability helper; validation reads the product catalog and shared workflow types. Neither domain module imports React, Context, app modules, or features. The provider imports the domain reducer and re-exports `areAllSelectedProductsConfigured` under the existing `hasValidImprint` name. `App.tsx`, routing, and feature imports remain unchanged. The product catalog, capability definitions, and type declarations remain in their existing directories.

## Compatibility and preserved behavior

The state shape, route transitions, action discriminants and payloads, `useWorkflow()` value/actions, and `hasValidImprint` export remain compatible. The legacy `continue` to `selection-ready` transition and reducer completion guard remain. Product ordering and active-product fallback, 30-character text truncation, independent bold flags, shared imprint state, capability enforcement, mutual exclusion, and expanded-preview state retain their original logic. No JSX, CSS, navigation, validation, product, or capability implementation changed.

## Tests and visual evidence

Added eight direct, UI-free tests in `tests/workflow-domain.spec.ts` covering initial state, valid/invalid selection, removal/active fallback, clear behavior, logo/text/bold updates and truncation, catalog capability rules, individual/aggregate readiness, completion acceptance/rejection, and legacy navigation/expanded state. Existing Playwright tests continue to cover route guards, browser navigation, feature interactions, and responsive workflow behavior.

Fresh before/after Chromium screenshots use DPR 1, reduced motion, the same single Sensi Smart selection, and the same shared text at 390×844, 768×1024, 1280×900, and 1920×1080. Each step's computed geometry and visible state match, and all eight screenshot files are byte-identical. Captures and their conditions are recorded in `docs/architecture/evidence/phase3a/{before,after}/metadata.json`.

## Source size and change inventory

`WorkflowContext.tsx` decreased from 95 to 33 lines as pure state logic moved out. `app/workflowValidation.ts` decreased from 29 to 2 lines and now serves only as the compatibility export. The new reducer is 71 lines; the domain validator is 29 lines; direct tests are 122 lines.

Runtime source changes are limited to the new domain modules and edits to `WorkflowContext.tsx` and `app/workflowValidation.ts`. Additional changes are the requested direct tests, this record, the architecture overview update, and before/after visual evidence. No dependencies were added. No unrelated pre-existing changes were staged, committed, reset, cleaned, or stashed.

## Future opportunities (not part of this phase)

- Shared workflow types remain in `src/types`; move them only when a distinct ownership boundary justifies it.
- The reducer currently looks up products in the static catalog and calls the existing capability helper; this is an explicit dependency, not an abstracted repository boundary.
- `continue` and `selection-ready` remain legacy public transitions and should be reviewed separately before any removal.
- The expanded-preview state remains in the model although the visible UI currently does not expose it.
- Broader workflow decomposition and component extraction remain for later phases.

## Validation

TypeScript `tsc --noEmit` passed. Production Vite build passed. The 8 direct domain tests passed; full Playwright passed all 99 tests (the 91-test baseline plus these 8 tests). `git diff --check` passed. The validation-artifact directory was compared with the pre-phase checkpoint and restored after tests. No pre-existing status rows were lost or changed; the phase's additions/edits are limited to the domain source, context adapter, compatibility re-export, direct tests, architecture documentation, and visual evidence.
