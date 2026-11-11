# Phase 4F: Responsive Carousel CSS Ownership Extraction

## Outcome

The responsive `ProductPreviewCarousel` now owns its intrinsic styling in `ProductPreviewCarousel.module.css`. The parent `BrandReview.module.css` continues to own the constraints that depend on the Step 2 composition. The extraction preserves the same React markup, state, product data, breakpoint behavior, preview artwork, carousel gestures, summary transitions, and controls.

## Ownership boundary

Moved unchanged to `ProductPreviewCarousel.module.css`:

- Carousel root, viewport, track, drag, and slide presentation, including focus, touch, and horizontal overscroll behavior.
- Responsive stage and artboard intrinsic sizing, stationary summary, identity/status typography, and summary fade states.
- Product-specific controls layout, pagination dots, tablet carousel dimensions, and reduced-motion transition rules.

Kept in `BrandReview.module.css`:

- `.previewMode` constraints on the carousel, viewport, track, slide, stage, artboard, pagination, and stationary area.
- The viewport-height exception and `100cqh` artboard sizing, since these depend on the parent preview workspace.
- The shared `.responsiveIntro h1, .mobileProductSummary h1` heading rule. The `mobileProductSummary` hook remains applied alongside its new component class so the CSS Module export remains available.

`PreviewArtwork.module.css` remains the shared owner of product artwork and imprint overlays. Dual classes are used only where the parent module still constrains a carousel element. All extracted property values and ordering match the Phase 4F starting stylesheet.

## Protected baseline and evidence

The non-destructive full-workspace checkpoint is `C:\Users\welau\.codex\visualizations\2026\10\08\01a11c5d-9825-7c83-8a1d-72a5d2451728\phase4f-protected-checkpoint-2026-11-09`. It records the pre-change Git status, patch, and source tree; no existing work was reset or discarded.

The reproducible capture harness is [capture-phase4f-carousel.mjs](capture-phase4f-carousel.mjs). Before/after/repeat screenshots and metadata are under [evidence/phase4f-carousel](evidence/phase4f-carousel). Chromium ran at DPR 1 and 100% zoom with reduced motion, after font readiness and image decoding. Captures cover 320×568, 375×667, 390×844, 414×896, 767×800, 768×1140, 1024×768, 1279×800, 1280×800, 1280×900, 1440×900, and 1920×1080. The scenario set includes configured first product with bold text and combined logo/text, logo-only, text-only, unconfigured middle product, long product name, and reduced motion. Desktop captures verify the existing preview panel at 1280, 1440, and 1920 widths.

The harness compares class-independent semantic markup, selected element rectangles and computed styles, document scroll dimensions, footer geometry, and screenshot bytes. All 52 before/after pairs match semantically and geometrically. 51/52 screenshot pairs are byte-identical; the sole differing pair is 390×844 text-only. The first repeat capture showed one byte-level difference against the after capture at 414×896 reduced-motion, while the latest repeat was 52/52 byte-identical to the after capture. The variable cold-render differences have no accompanying DOM or geometry/style changes; screenshots were inspected at normal scale.

The comparison includes carousel viewport/track/active slide, preview stage/artboard/product image, logo and text overlays, pagination, product summary/status, option controls, fixed action footer, and document scroll dimensions. CSS Module hashes are intentionally excluded from semantic markup comparison because they change when style ownership moves.

## Source size

`BrandReview.module.css` decreased by 2,557 bytes (from 16,553 to 13,996 bytes). The new `ProductPreviewCarousel.module.css` is 2,611 bytes, for a net increase of 54 bytes across the two stylesheets. Existing `ProductPreviewCarousel.tsx` changed only its stylesheet imports and class composition; the component markup and handlers remain intact.

## Validation

- Protected baseline Playwright suite: 99 passed.
- TypeScript check (`tsc --noEmit`): passed.
- Production Vite build: passed.
- Responsive capture comparison: 52/52 class-independent DOM matches; 52/52 geometry/style matches; 51/52 exact screenshot matches, with the one cold-render raster difference described above.
- The latest repeat after-state capture: 52/52 semantic DOM matches, 52/52 geometry/style matches, and 52/52 exact screenshot matches against the first after-state.
- Existing carousel behavior tests remain unchanged and are included in the baseline and post-change suite.

No runtime behavior or business logic changed. Phase 4F ends with intrinsic responsive carousel styling owned by its component and Step 2 workspace constraints owned by the parent screen.
