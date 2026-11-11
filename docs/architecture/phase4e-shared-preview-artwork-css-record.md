# Phase 4E: Shared Preview Artwork CSS Ownership Extraction

## Outcome

The desktop `ProductPreviewPanel` and responsive `ProductPreviewCarousel` now consume one feature-owned artwork stylesheet, `PreviewArtwork.module.css`. This was a CSS ownership change only: the artwork declarations and values are unchanged, and no JSX structure, state, product data, responsive rule, or interaction changed.

## Ownership boundary

Moved unchanged from `BrandReview.module.css` to `PreviewArtwork.module.css`:

- `.productArt`: block image, full-size fill, `object-fit: contain`.
- `.brandLogo`: absolute overlay, 5% bottom, 2% left, 12% width, 18% max-height, contain fit, darken blend.
- `.brandText`: absolute overlay, 31.4% left, 2.5% bottom, 37.2% width, centered flex column, anywhere wrapping, `#4c6774`, `1.73cqw`, and `1.333` line-height.

Both preview components import the module as `artworkStyles`. `ProductPreviewPanel.module.css` continues to own desktop controls, preview stage, and `.artboard`; `BrandReview.module.css` continues to own parent framing and responsive carousel layout, `.mobilePreviewStage`, `.mobileArtboard`, and responsive sizing. Product-specific overlay placement remains inline from product data.

The `.brandText` container query remains relative to the existing `.artboard` and `.mobileArtboard` contexts. No wrapper or `container-type` rule changed. Both component imports are explicit, with no `:global`, `composes`, or cross-feature stylesheet promotion.

## Source size

Compared with the protected Phase 4E starting tree:

| Files | Before | After |
| --- | ---: | ---: |
| `BrandReview.module.css`, `ProductPreviewPanel.tsx`, `ProductPreviewCarousel.tsx` | 31,324 bytes / 480 lines | 31,034 bytes / 478 lines |
| New `PreviewArtwork.module.css` | — | 473 bytes / 30 lines |
| Total touched runtime source | 31,324 bytes | 31,507 bytes |

The parent module shrank by 428 bytes. The focused new module and explicit consumer references produce a net increase of 183 bytes across runtime source.

## Visual and computed-style comparison

The protected, non-destructive working-tree checkpoint is at `C:\Users\welau\.codex\visualizations\2026\10\08\01a11c5d-9825-7c83-8a1d-72a5d2451728\phase4e-protected-checkpoint-2026-11-09`. It preserves the pre-existing tracked and untracked project files, status, and binary diff without staging or resetting anything.

The repeatable harness is `capture-phase4e-artwork.mjs`; screenshots and comparison metadata are under `evidence/phase4e-artwork/`. Chromium ran at DPR 1, 100% zoom, with reduced motion. Each capture waited for `document.fonts.ready` and image decoding. The comparison records semantic DOM, element rectangles, and computed object fit, positioning, blend, text size, line-height, overflow, transform, and container context. Uploaded logo blob URLs are normalized only for metadata comparison; screenshot pixels are compared byte-for-byte.

The 42 before/after pairs matched in semantic DOM, recorded geometry and computed styles, and screenshot pixels (42/42 for each measure). Desktop preview panel captures cover 1280×900, 1440×900, and 1920×1080, with empty artwork, regular/bold text, logo-only, logo plus text, and alternate products. Responsive preview captures cover 320×568, 390×844, 414×896, 768×1140, 1024×768, and 1279×800. Together, these exercise constrained height, product-specific logo/text placements, first/middle/last navigation, varied artwork, and supported combinations. Fresh loads on both sides of the 1279/1280 transition are included.

## Validation

- TypeScript check (`tsc --noEmit`): passed.
- Production Vite build: passed.
- Focused desktop preview, responsive carousel, and configuration tests: 46 passed.
- Full Playwright suite: 99 passed.
- `git diff --check`: passed; Git printed existing LF-to-CRLF working-copy notices.
- Existing test-driven `docs/validation` outputs are checked against the protected checkpoint and restored if changed; new Phase 4E evidence is kept separately.

A repeat run after the extraction produced another 42/42 exact pixel, geometry/style, and semantic matches against the post-extraction capture set. The full suite rewrote 55 pre-existing validation files; each was restored from the checkpoint. No unrelated validation output was removed.

Existing Playwright tests verified upload/removal, bold and regular lines, product-specific placements, active product navigation, responsive carousel gestures, and mobile preview sizing. No new React component or test expectation was required.

## Remaining recommendations

The remaining responsive carousel selectors stay in `BrandReview.module.css` as required. If carousel CSS extraction is considered later, treat it as a separate phase with its own protected baseline and responsive visual comparison. Phase 4E ends here.
