# Phase 4A: Imprint Component Extraction Record

## Outcome

The three existing imprint presentation components now live in feature-owned files. `BrandReview` still connects the workflow to them and retains the upload lifecycle. This is a behavior-preserving component-boundary change; it does not change the workflow state model or the rendered markup.

## Ownership and interfaces

| Component | File | Responsibility and contract | Atomic lens |
| --- | --- | --- | --- |
| `ImprintForm` | `src/features/branding/ImprintForm.tsx` | Desktop imprint panel. Receives `WorkflowState['imprint']`, nullable `LogoValidationResult`, validation loading state, file input ref, add/remove logo callbacks, and line/bold callbacks. | Organism |
| `ImprintTextFields` | `src/features/branding/ImprintTextFields.tsx` | Shared desktop and responsive line inputs, counters, labels, and bold controls. Receives the imprint value, `setLine`, `toggleBold`, and wrapper `className`. | Molecule |
| `LogoValidationMessage` | `src/features/branding/LogoValidationMessage.tsx` | Shared accessible validation result presentation. Receives only `LogoValidationResult`. | Molecule |

`BrandReview` remains the adapter from workflow state and callbacks to the view components. It owns the input ref, request invalidation, asynchronous validation, logo state, and object URL creation/revocation. `ImprintForm` composes `ImprintTextFields` and `LogoValidationMessage`; responsive Step 2 imports the same text and validation components directly.

The new components depend on feature data/types and `BrandReview.module.css`. None imports `BrandReview`, `WorkflowContext`, the reducer, or routing. No new state, duplicated validation logic, or dependency was added. `BrandReview.module.css` is unchanged (SHA-256 matches the protected pre-change copy); splitting stylesheet ownership remains a later phase.

The existing desktop and responsive class composition, markup hierarchy, conditions, attributes, IDs, accessible names, and event behavior were retained. Successful validation remains hidden in the responsive form where it was previously hidden.

## Source size

| Source | Before | After | Change |
| --- | ---: | ---: | ---: |
| `BrandReview.tsx` | 31,800 bytes / 415 lines | 27,277 bytes / 379 lines | −4,523 bytes / −36 lines |
| Three extracted components | Inline in `BrandReview.tsx` | 6,090 bytes / 67 lines | New focused files |
| Combined source | 31,800 bytes / 415 lines | 33,367 bytes / 446 lines | +1,567 bytes / +31 lines |

The parent file is smaller and its dependencies are explicit. Total source grows slightly because the extracted files now state their own imports, exports, and prop contracts; the goal here is clearer ownership and easier local reasoning, not fewer total characters.

## Verification

- Pre-change full Playwright baseline: 99 passed.
- TypeScript check: passed.
- Production build: passed.
- Focused suites (`brand-review`, `configuration-completeness`, `responsive-step2-fidelity`, `workflow-domain`): 54 passed.
- Full Playwright suite: 99 passed.
- `git diff --check`: passed.
- Upload, validation, remove/re-upload, text entry, counters, bold controls, configuration completeness, responsive modes, and workflow behavior remain covered by the existing tests.

Before and after captures use Chromium at device scale factor 1 for 390×844, 768×1140, 1024×768, 1279×800, 1280×900, 1440×900, and 1920×1080. Each viewport includes an empty form, populated bold text, uploaded-logo success, warning, and error states. Responsive widths also capture configure list, configured list, and preview. This yields 47 captures per pass. The capture harness records the form/main DOM, key attributes, bounding rectangles, sampled computed styles, text values, viewport dimensions, and full-page screenshots.

DOM snapshots and measured geometry/styles match across all 47 before/after states after normalizing only browser-generated blob URL identifiers. Pixel comparison is still strict with no tolerance: 46 of 47 after-captures were byte-pixel identical. The remaining capture differs in 38 pixels along one row of the 390×844 uploaded-logo state (`x=34, y=346, width=188, height=1`). A repeat capture showed localized pixel variation in logo-present mobile captures while retaining identical DOM and geometry; side-by-side screenshots show no visible layout difference. This is recorded as image raster variation rather than hidden by a comparison threshold.

The post-extraction responsive transition was exercised at 1279→1280→1279 with the same populated imprint and validation error. Both desktop and responsive compositions appeared at their respective widths, and the line value plus error announcement persisted. Evidence is in the repeat capture metadata.

The full Playwright run regenerated older screenshots under `docs/validation`; all changed pre-existing files were restored byte-for-byte from the protected checkpoint. New Phase 4A evidence is isolated under `docs/architecture/evidence/phase4a/`.

## Remaining architecture and next boundary

The extracted components intentionally continue to share one CSS Module, and the parent still contains the desktop and responsive preview compositions. For Phase 4B, `ProductPreviewPanel` is the next useful boundary to assess because it groups the desktop live-preview controls and artboard. Keep the responsive `ProductPreviewCarousel` as a separate interaction surface with its own swipe/navigation contract. No preview or CSS decomposition was started in Phase 4A.
