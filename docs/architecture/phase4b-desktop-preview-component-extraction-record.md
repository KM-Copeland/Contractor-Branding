# Phase 4B: Desktop Live Preview Component Extraction

## Outcome

The desktop live-preview panel now lives in `src/features/branding/ProductPreviewPanel.tsx`. `BrandReview` still owns workflow state and passes only the product data, derived active configuration, shared imprint values, preview expansion state, and the callbacks the panel needs. The panel's private switch control moved with it. This is a behavior-preserving ownership change; it does not alter the product carousel used by responsive Step 2.

## Ownership and boundary

| Owner | Responsibility |
| --- | --- |
| `BrandReview` | Derives selected and active products, configures state and responsive composition, and owns the shared workflow actions. |
| `ProductPreviewPanel` | Renders desktop carousel controls, per-product logo/text switches, product/category identity, product artwork, and optional logo/text overlays. |
| `BrandReview.module.css` | Continues to own the existing desktop and responsive styles; no CSS declarations or class names changed. |
| `ProductPreviewCarousel` | Remains inside `BrandReview.tsx` with its independent responsive gesture, summary, and mode behavior. |

The panel receives a narrow prop contract and imports catalog asset resolution, capability logic, shared workflow types, and the existing CSS module. It does not read context, own state, alter validation, or reach into the parent. Markup, callbacks, native controls, accessible names, IDs, and `data-testid` values were preserved.

## Source size

| File | Before Phase 4B | After Phase 4B |
| --- | ---: | ---: |
| `BrandReview.tsx` | 27,277 bytes / 379 lines | 24,651 bytes / 373 lines |
| `ProductPreviewPanel.tsx` | Inline in parent | 3,964 bytes / 36 lines |
| Combined | 27,277 bytes / 379 lines | 28,615 bytes / 409 lines |

The parent loses 2,626 bytes of desktop panel markup. The combined implementation grows by 1,338 bytes for the separate imports, exported component, and explicit type contract. `BrandReview.module.css` is unchanged byte-for-byte (SHA-256 `1521AD18027DA63D6DD883BB097132D2DC757D321B11A619B7E62CBCDDC94746`).

## Verification

- TypeScript check: passed.
- Production Vite build: passed.
- Full Playwright suite: 98 passed, 1 failed. The same single failure occurred before the extraction: `tests/selection.spec.ts` expects all local Aileron weights to load, and the current environment reports at least one weight unavailable. No Step 2 or preview test failed.
- Desktop before/after captures: 15 states at 1280×900, 1440×900, and 1920×1080. Empty imprint, two bold text lines, logo plus text enabled, and middle/last product navigation were captured with four products selected.
- All 15 captures match exactly: panel DOM, measured geometry, and screenshot pixels. A separate repeat capture also matches the after capture exactly in all 15 states.
- Existing responsive Step 2 and swipe-carousel tests ran in the full suite and passed. The responsive carousel implementation was not changed.
- `git diff --check` on the changed tracked implementation and architecture files passed; Git reported its existing LF-to-CRLF working-copy notices.

Evidence is stored under `docs/architecture/evidence/phase4b-preview/`: `before/`, `after/`, and `repeat/` each contain the 15 PNG captures and metadata; the latter two also contain strict comparison results. The capture harness is `docs/architecture/capture-phase4b-preview.mjs`.

## Scope and next boundary

No workflow state, validation, routing, styles, or responsive carousel behavior changed. The next architecture pass should assess the responsive carousel as its own boundary, without combining it with the desktop panel simply because both display product artwork.
