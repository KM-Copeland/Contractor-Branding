# Phase 4C: Responsive Carousel Component Extraction Record

## Outcome

`ProductPreviewCarousel` now lives in `src/features/branding/ProductPreviewCarousel.tsx`, separate from both the `BrandReview` screen composition and desktop `ProductPreviewPanel`. The responsive parent still decides when the Preview tab mounts the carousel. No `key`, extra wrapper, hook, or state was added, so its existing mount/unmount boundary remains intact.

## Component boundary and prop contract

The carousel accepts selected and active `ProductFamily` values, active `ProductBrandingConfiguration`, the `WorkflowState['branding']` map, `WorkflowState['imprint']`, shared logo/text availability flags, and `setActiveProduct` / `setBranding` callbacks. It does not receive the full workflow state and does not import context, reducer, routing, or the parent screen.

The component owns `dragX`, `dragging`, `gesture`, `previousActiveId`, `displayedProductId`, and `summaryFade`, plus the `CarouselGesture` type. Its product-image track, slide articles, preview stages/artboards, logo/text overlays, pagination, stationary summary and controls, keyboard handling, announcements, and reduced-motion transition remain together. The actionable switches continue to use the active product while the summary may temporarily show the previous product during its existing fade.

The pointer algorithm was moved without adjustment: primary pointer and mouse-button checks; 8px movement threshold; 1.15 direction bias; touch/non-touch capture distinction; 42px and fast 18px/0.45px-per-ms navigation thresholds; clamped first/last navigation; cancellation cleanup; and no wraparound. The 110ms summary transition, requestAnimationFrame sequence, timeout cleanup, reduced-motion branch, CSS classes, capabilities, `isProductConfigured`, and `supportsSimultaneousImprint` behavior remain unchanged.

The extracted component continues to import `BrandReview.module.css`. The stylesheet is byte-identical to the protected pre-extraction copy (SHA-256 `1521AD18027DA63D6DD883BB097132D2DC757D321B11A619B7E62CBCDDC94746`). No CSS, artwork, fonts, validation, workflow state, or reducer changes were made.

## Source size

| File | Before Phase 4C | After Phase 4C |
| --- | ---: | ---: |
| `BrandReview.tsx` | 24,651 bytes / 373 lines | 15,470 bytes / 245 lines |
| `ProductPreviewCarousel.tsx` | Inline in parent | 10,288 bytes / 158 lines |
| Combined | 24,651 bytes / 373 lines | 25,758 bytes / 403 lines |

The parent is smaller by 9,181 bytes and 128 lines. The combined source adds 1,107 bytes and 30 lines for its imports, exported component, and focused prop contract.

## Validation

- Pre-extraction TypeScript check and production build: passed.
- Pre-extraction focused Step 2 and responsive tests: 44 passed.
- Pre-extraction full Playwright suite: 98 passed, 1 failed.
- Post-extraction TypeScript check and production build: passed.
- Post-extraction focused responsive, configuration-completeness, and workflow-domain tests: 33 passed.
- Post-extraction full Playwright suite: 98 passed, 1 failed. The sole failure is the same Aileron weight assertion at `tests/selection.spec.ts:4` seen in the full pre-extraction baseline; no new failures appeared.
- Responsive captures include 320×568, 375×667, 390×844, 414×896, 768×1140, 1024×768, and 1279×800. Each includes configured logo+text, logo-only, text-only, unconfigured middle product, and the long-name final product. Desktop smoke captures cover 1280×900 and 1920×1080. Captures use Chromium at device scale factor 1 and reduced motion for deterministic comparisons.
- Before/after comparison: all 37 captures have identical carousel/preview DOM, computed-style and bounding-rectangle snapshots, art/overlay sources, scroll dimensions, and screenshot pixels. A separate repeat pass also matches all 37 after captures exactly.
- The 320×568 capture verifies the constrained viewport presentation. Existing responsive tests cover artwork/footer clearance, vertical scrolling and gesture separation, pointer cancellation and thresholds, keyboard/pagination boundaries, animation and reduced motion, product configuration, and preservation across List/Preview changes.
- `git diff --check` passed after final validation (Git emitted its existing LF-to-CRLF working-copy notices).

Evidence is stored in `docs/architecture/evidence/phase4c-carousel/{before,after,repeat}/`. Each folder has the corresponding PNGs and a `metadata.json`; after and repeat also include `comparisons.json`. The repeatable capture harness is `docs/architecture/capture-phase4c-carousel.mjs`.

## Remaining risk and next phase

The known Aileron weight assertion in `tests/selection.spec.ts` failed both before and after extraction. It is unrelated to this feature and was not changed.

For Phase 4D, assess feature-level CSS ownership for the desktop panel and responsive carousel as a separate, stylesheet-only change. Keep both experiences behaviorally separate, and use the same protected screenshots and geometry checks before/after any CSS Module move. Do not combine that work with extracting screen composition or artwork primitives.
